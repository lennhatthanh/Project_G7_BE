#!/bin/bash
set -e

# Update system
yum update -y

# Install Node.js 20
curl -fsSL https://rpm.nodesource.com/setup_20.x | bash -
yum install -y nodejs

# Install PM2 globally
npm install -g pm2

# Install AWS CLI
yum install -y awscli

# Install EFS utilities
yum install -y amazon-efs-utils

# Install PostgreSQL client
yum install -y postgresql15

# Create EFS mount point
mkdir -p /mnt/efs/uploads

# Mount EFS
echo "${efs_id}:/ /mnt/efs efs _netdev,tls,iam 0 0" >> /etc/fstab
mount -a

# Set permissions
chown -R ec2-user:ec2-user /mnt/efs

# Create app directory
mkdir -p /home/ec2-user/app
cd /home/ec2-user/app

# Create .env file
cat > /home/ec2-user/app/.env << 'EOF'
PORT=3000
DB_HOST=${db_host}
DB_PORT=5432
DB_NAME=sango_db
DB_USER=sango_admin
DB_PASSWORD=${db_password}
REDIS_URL=redis://${redis_endpoint}
AWS_REGION=${region}
AWS_S3_BUCKET=${s3_upload_bucket}
S3_BUCKET_NAME=${s3_upload_bucket}
EFS_UPLOAD_PATH=/mnt/efs/uploads
NODE_ENV=production
ALLOWED_ORIGINS=*
JWT_ACCESS_KEY=sango-access-key
JWT_REFRESH_KEY=sango-refresh-key
JWT_EMAIL_SECRET=sango-email-secret
CLIENT_ID=placeholder
API_KEY=placeholder
CHECKSUM_KEY=placeholder
EOF

# Download app bundle from S3. The first boot may happen before the bundle is
# uploaded, so keep the instance alive and retry during an ASG instance refresh.
for i in {1..30}; do
  if aws s3 cp s3://${s3_upload_bucket}/backend.tar.gz /home/ec2-user/app/backend.tar.gz; then
    tar -xzf backend.tar.gz
    npm install --omit=dev
    mkdir -p /mnt/efs/uploads/images
    ln -sfn /mnt/efs/uploads /home/ec2-user/app/uploads
    chown -R ec2-user:ec2-user /home/ec2-user/app /mnt/efs
    su - ec2-user -c "cd /home/ec2-user/app && pm2 start ./bin/www --name sango-api"
    su - ec2-user -c "pm2 startup systemd -u ec2-user --hp /home/ec2-user"
    su - ec2-user -c "pm2 save"
    break
  fi
  echo "backend.tar.gz not available yet; retry $i/30"
  sleep 20
done

# Set ownership
chown -R ec2-user:ec2-user /home/ec2-user/app

# Install CloudWatch agent (optional)
wget https://s3.amazonaws.com/amazoncloudwatch-agent/amazon_linux/amd64/latest/amazon-cloudwatch-agent.rpm
rpm -U ./amazon-cloudwatch-agent.rpm

echo "User data script completed successfully"
