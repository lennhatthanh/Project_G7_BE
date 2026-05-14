# SanGo Infrastructure - Terraform Deployment Guide

Complete Terraform infrastructure for deploying the SanGo sports facility booking platform to AWS.

## Architecture Overview

This Terraform configuration deploys a complete W5 AWS infrastructure including:

### Must-Have Requirements (MH1-MH5)

- **MH1**: Multi-VPC Connectivity with VPC Peering
  - VPC-App (10.0.0.0/16) - 3-tier application stack
  - VPC-Mgmt (10.1.0.0/16) - Bastion host and management
  - Bidirectional VPC peering with DNS resolution

- **MH2**: AWS Network Firewall
  - Stateful domain allowlist (.payos.vn, .amazonaws.com, etc.)
  - Dedicated firewall subnets per AZ
  - Alert and flow logs to CloudWatch

- **MH3**: File Storage + Backup
  - Amazon EFS with encryption and lifecycle policies
  - AWS Backup with daily snapshots (7-day retention)
  - S3 buckets with versioning and encryption

- **MH4**: API Gateway + Lambda Authorizer
  - HTTP API with Lambda proxy integration
  - Custom Lambda authorizer (x-api-key)
  - Throttling (5 req/s rate, 10 burst)

- **MH5**: S3-Event-Triggered Lambda
  - Lambda function triggered by S3 uploads to venues/ prefix
  - Processes venue images and stores metadata

### Additional Components

- **Compute**: EC2 Auto Scaling Group (2-4 instances) with ALB
- **Database**: RDS PostgreSQL 15 Multi-AZ + ElastiCache Redis
- **CDN**: CloudFront distributions for frontend and backend
- **Security**: IAM roles with least-privilege policies, VPC Flow Logs
- **Networking**: Multi-AZ with NAT Gateways, S3 VPC Gateway Endpoint

## Prerequisites

1. **AWS CLI** configured with credentials
   ```bash
   aws configure
   ```

2. **Terraform** >= 1.5 installed
   ```bash
   terraform version
   ```

3. **EC2 Key Pair** created in ap-southeast-1 region
   ```bash
   aws ec2 create-key-pair --key-name sango-key --region ap-southeast-1 --query 'KeyMaterial' --output text > sango-key.pem
   chmod 400 sango-key.pem
   ```

4. **Your public IP** for Bastion SSH access
   ```bash
   curl ifconfig.me
   ```

5. **AWS Account ID**
   ```bash
   aws sts get-caller-identity --query Account --output text
   ```

## Deployment Steps

### 1. Clone and Navigate

```bash
cd c:\DevOps\Project_AWS\Project_G7_BE\terraform
```

### 2. Create terraform.tfvars

Copy the example file and fill in your values:

```bash
cp terraform.tfvars.example terraform.tfvars
```

Edit `terraform.tfvars`:

```hcl
region         = "ap-southeast-1"
project_name   = "sango"
env            = "dev"
team_ip_cidr   = "YOUR_PUBLIC_IP/32"  # e.g., "203.0.113.45/32"
key_pair_name  = "sango-key"
db_password    = "YourSecurePassword123!"
valid_api_key  = "sango-secret-key-2026"
account_id     = "YOUR_AWS_ACCOUNT_ID"
```

### 3. Initialize Terraform

```bash
terraform init
```

This will download required providers (AWS, Archive).

### 4. Validate Configuration

```bash
terraform validate
```

### 5. Plan Deployment

```bash
terraform plan -out=tfplan
```

Review the plan carefully. Expected resources: ~80-100 resources.

### 6. Apply Infrastructure

```bash
terraform apply tfplan
```

⏳ **Deployment time**: 15-25 minutes

Key resources that take time:
- RDS Multi-AZ: ~10 minutes
- Network Firewall: ~5 minutes
- CloudFront distributions: ~5 minutes
- NAT Gateways: ~3 minutes

### 7. Save Outputs

```bash
terraform output > outputs.txt
```

Important outputs:
- `alb_dns_name` - Backend API endpoint
- `cloudfront_domain_fe` - Frontend URL
- `api_gateway_endpoint` - Bedrock KB API
- `bastion_public_ip` - SSH jump host
- `rds_endpoint` - Database connection
- `efs_id` - File system ID

## Post-Deployment Configuration

### 1. Upload Frontend to S3

```bash
# Build frontend
cd ../../Project_G7_FE
npm run build

# Upload to S3
aws s3 sync dist/ s3://sango-static-assets-YOUR_ACCOUNT_ID/ --region ap-southeast-1

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id YOUR_CF_DIST_ID --paths "/*"
```

### 2. Deploy Backend Application

```bash
# Package backend
cd ../Project_G7_BE
tar -czf backend.tar.gz --exclude=node_modules --exclude=.git .

# Upload to S3
aws s3 cp backend.tar.gz s3://sango-uploads-YOUR_ACCOUNT_ID/backend.tar.gz --region ap-southeast-1
```

The EC2 user data script will:
- Mount EFS at `/mnt/efs/uploads`
- Download backend bundle from S3
- Install dependencies
- Start with PM2

### 3. Update Lambda Functions

The Terraform creates placeholder Lambda functions. Deploy real code:

**Bedrock KB Lambda:**
```bash
cd lambda-functions/bedrock-kb
npm install
zip -r function.zip .
aws lambda update-function-code \
  --function-name sango-bedrock-kb-function \
  --zip-file fileb://function.zip \
  --region ap-southeast-1
```

**S3 Processor Lambda:**
```bash
cd lambda-functions/s3-processor
pip install -r requirements.txt -t .
zip -r function.zip .
aws lambda update-function-code \
  --function-name sango-s3-venue-image-processor \
  --zip-file fileb://function.zip \
  --region ap-southeast-1
```

### 4. Run Database Migrations

SSH into Bastion, then to App EC2:

```bash
# SSH to Bastion
ssh -i sango-key.pem ec2-user@BASTION_PUBLIC_IP

# From Bastion, SSH to App EC2 (get private IP from console)
ssh ec2-user@10.0.2.X

# Run migrations
cd /home/ec2-user/app
npx sequelize-cli db:migrate
npx sequelize-cli db:seed:all
```

## Testing the Deployment

### 1. Health Check

```bash
curl http://ALB_DNS_NAME/health
# Expected: {"status":"running","timestamp":"..."}
```

### 2. Frontend Access

Open browser: `https://CLOUDFRONT_DOMAIN_FE`

### 3. API Gateway Test (200 - Authenticated)

```bash
curl -X POST "https://API_GATEWAY_ENDPOINT" \
  -H "Content-Type: application/json" \
  -H "x-api-key: sango-secret-key-2026" \
  -d '{"query": "What sports facilities are available?"}'
```

Expected: `{"answer": "..."}`

### 4. API Gateway Test (403 - Unauthenticated)

```bash
curl -X POST "https://API_GATEWAY_ENDPOINT" \
  -H "Content-Type: application/json" \
  -d '{"query": "test"}'
```

Expected: `{"message": "Forbidden"}`

### 5. S3 Event Lambda Test

```bash
# Upload a test image
aws s3 cp test-venue.jpg s3://sango-uploads-YOUR_ACCOUNT_ID/venues/venue001/test.jpg

# Check Lambda logs
aws logs tail /aws/lambda/sango-s3-venue-image-processor --follow --region ap-southeast-1
```

### 6. Cross-VPC Connectivity Test

```bash
# SSH to Bastion
ssh -i sango-key.pem ec2-user@BASTION_PUBLIC_IP

# Ping App EC2 private IP
ping -c 4 10.0.2.X

# Test RDS connection
psql -h RDS_ENDPOINT -U sango_admin -d sango_db
```

### 7. Network Firewall Test

```bash
# SSH to App EC2 (via Bastion)
# Try blocked domain
curl --max-time 5 https://google.com
# Expected: timeout

# Try allowed domain
curl https://s3.ap-southeast-1.amazonaws.com
# Expected: response

# Check firewall logs
aws logs tail /aws/network-firewall/sango/alert --follow --region ap-southeast-1
```

## SSH Access Guide

### SSH to Bastion

```bash
ssh -i sango-key.pem ec2-user@BASTION_PUBLIC_IP
```

### SSH from Bastion to App EC2

```bash
# Get App EC2 private IP from AWS Console or:
aws ec2 describe-instances \
  --filters "Name=tag:Name,Values=sango-asg-instance" \
  --query "Reservations[*].Instances[*].PrivateIpAddress" \
  --output text \
  --region ap-southeast-1

# SSH from Bastion
ssh ec2-user@10.0.2.X
```

### SSH with Jump Host (One Command)

```bash
ssh -i sango-key.pem -J ec2-user@BASTION_PUBLIC_IP ec2-user@10.0.2.X
```

## Monitoring and Logs

### CloudWatch Log Groups

```bash
# VPC Flow Logs
aws logs tail /aws/vpc/flowlogs/sango-app-vpc --follow

# Network Firewall Alerts
aws logs tail /aws/network-firewall/sango/alert --follow

# Lambda Logs
aws logs tail /aws/lambda/sango-bedrock-kb-function --follow
aws logs tail /aws/lambda/sango-s3-venue-image-processor --follow
```

### AWS Backup Status

```bash
# List backup jobs
aws backup list-backup-jobs --by-backup-vault-name sango-backup-vault --region ap-southeast-1

# List recovery points
aws backup list-recovery-points-by-backup-vault --backup-vault-name sango-backup-vault --region ap-southeast-1
```

### RDS Multi-AZ Failover Test

```bash
# Trigger failover
aws rds reboot-db-instance \
  --db-instance-identifier sango-postgres \
  --force-failover \
  --region ap-southeast-1

# Monitor failover (takes ~1-2 minutes)
aws rds describe-db-instances \
  --db-instance-identifier sango-postgres \
  --query "DBInstances[0].DBInstanceStatus" \
  --region ap-southeast-1
```

## Cleanup

⚠️ **Warning**: This will destroy all resources and data.

```bash
# Destroy infrastructure
terraform destroy

# Confirm by typing: yes
```

Note: Some resources may require manual cleanup:
- CloudWatch Log Groups (if retention is set)
- S3 bucket contents (must be empty before deletion)
- EFS data

## Troubleshooting

### Issue: Terraform timeout on Network Firewall

**Solution**: Network Firewall takes 5-10 minutes to become READY. If timeout occurs:
```bash
terraform apply -target=module.networking.aws_networkfirewall_firewall.main
terraform apply
```

### Issue: EC2 instances not healthy in ALB

**Causes**:
1. App not running on port 3000
2. Security group blocking ALB → EC2
3. Health check path `/health` not responding

**Debug**:
```bash
# SSH to EC2 and check app
curl localhost:3000/health

# Check security groups
aws ec2 describe-security-groups --group-ids EC2_SG_ID
```

### Issue: Lambda cannot connect to RDS

**Causes**:
1. Lambda not in VPC
2. Security group not allowing Lambda SG → RDS
3. Wrong DB credentials

**Debug**:
```bash
# Check Lambda VPC config
aws lambda get-function-configuration --function-name sango-s3-venue-image-processor

# Test from EC2 in same subnet
psql -h RDS_ENDPOINT -U sango_admin -d sango_db
```

### Issue: S3 VPC Endpoint not working

**Verify**:
```bash
# Check route tables have S3 endpoint
aws ec2 describe-route-tables --route-table-ids RT_ID

# Should see entry with destination: pl-xxxxx (S3 prefix list)
```

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Internet                                     │
└────────────────────────┬────────────────────────────────────────────┘
                         │
         ┌───────────────┴───────────────┐
         │                               │
    CloudFront                      CloudFront
    (Frontend)                      (Backend)
         │                               │
         │                               │
    ┌────▼────┐                    ┌────▼────┐
    │   S3    │                    │   ALB   │
    │ Static  │                    │ Public  │
    └─────────┘                    └────┬────┘
                                        │
┌───────────────────────────────────────┼─────────────────────────────┐
│ VPC-App (10.0.0.0/16)                 │                             │
│                                       │                             │
│  ┌────────────────────────────────────▼──────────────────────────┐ │
│  │ Public Subnet (Presentation Tier)                             │ │
│  │  - ALB                                                         │ │
│  │  - NAT Gateway (AZ-a, AZ-b)                                    │ │
│  └────────────────────────────────────┬──────────────────────────┘ │
│                                       │                             │
│  ┌────────────────────────────────────▼──────────────────────────┐ │
│  │ Firewall Subnet                                                │ │
│  │  - Network Firewall Endpoints (AZ-a, AZ-b)                     │ │
│  └────────────────────────────────────┬──────────────────────────┘ │
│                                       │                             │
│  ┌────────────────────────────────────▼──────────────────────────┐ │
│  │ Private App Subnet (Application Tier)                          │ │
│  │  - EC2 Auto Scaling Group (2-4 instances)                      │ │
│  │  - EFS Mount Targets                                           │ │
│  │  - Lambda Functions (VPC-attached)                             │ │
│  └────────────────────────────────────┬──────────────────────────┘ │
│                                       │                             │
│  ┌────────────────────────────────────▼──────────────────────────┐ │
│  │ Private DB Subnet (Database Tier)                              │ │
│  │  - RDS PostgreSQL Multi-AZ                                     │ │
│  │  - ElastiCache Redis                                           │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  S3 VPC Gateway Endpoint ──────────────────────────────────────────►│
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
                         │
                         │ VPC Peering
                         │
┌────────────────────────▼─────────────────────────────────────────────┐
│ VPC-Mgmt (10.1.0.0/16)                                               │
│                                                                       │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │ Public Subnet                                                  │  │
│  │  - Bastion Host (SSH Jump)                                     │  │
│  └────────────────────────────────────────────────────────────────┘  │
│                                                                       │
└───────────────────────────────────────────────────────────────────────┘
```

## Cost Estimation

Approximate monthly costs (ap-southeast-1):

| Service | Configuration | Monthly Cost (USD) |
|---------|--------------|-------------------|
| EC2 (t3.medium x2) | 24/7 | ~$60 |
| RDS PostgreSQL (db.t3.medium) | Multi-AZ | ~$120 |
| ElastiCache Redis (cache.t3.micro) | Single node | ~$15 |
| NAT Gateway (x2) | 24/7 + data transfer | ~$70 |
| ALB | 24/7 + LCU | ~$25 |
| EFS | 10 GB storage | ~$3 |
| S3 | 50 GB storage + requests | ~$5 |
| CloudFront | 100 GB transfer | ~$10 |
| Network Firewall | 24/7 + data | ~$400 |
| AWS Backup | 50 GB snapshots | ~$3 |
| Lambda | 1M requests | ~$1 |
| API Gateway | 1M requests | ~$4 |
| **Total** | | **~$716/month** |

**Note**: Network Firewall is the most expensive component (~55% of total cost).

## Security Best Practices

✅ **Implemented**:
- All data encrypted at rest (RDS, EFS, S3, EBS)
- Redis encryption in transit
- VPC Flow Logs enabled
- Network Firewall with domain allowlist
- Security Groups with least-privilege rules
- IAM roles with specific resource ARNs (no wildcards)
- Private subnets for app and database tiers
- Bastion host with IP whitelist
- S3 buckets block public access
- CloudFront OAC for S3 (not OAI)

⚠️ **Production Recommendations**:
1. Use AWS Secrets Manager for DB password (not env vars)
2. Enable MFA for Bastion access
3. Use AWS Certificate Manager for HTTPS on ALB
4. Enable GuardDuty and Security Hub
5. Set up CloudWatch alarms for critical metrics
6. Enable RDS Performance Insights
7. Use AWS WAF on CloudFront and ALB
8. Implement backup restore testing automation

## Support

For issues or questions:
1. Check CloudWatch Logs for error messages
2. Review AWS Console for resource status
3. Run `terraform plan` to check for drift
4. Consult AWS documentation for service-specific issues

## License

This infrastructure code is part of the SanGo project.
