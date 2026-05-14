# SanGo Infrastructure Architecture

## Overview

This document describes the complete AWS infrastructure architecture for the SanGo sports facility booking platform, deployed in the **ap-southeast-1 (Singapore)** region.

## High-Level Architecture

The infrastructure follows a **3-tier architecture** pattern with **multi-VPC design** for security and management separation.

### Key Design Principles

1. **High Availability**: Multi-AZ deployment across ap-southeast-1a and ap-southeast-1b
2. **Security**: Defense in depth with Network Firewall, Security Groups, private subnets
3. **Scalability**: Auto Scaling Groups, ElastiCache, CloudFront CDN
4. **Disaster Recovery**: AWS Backup with 7-day retention, RDS Multi-AZ
5. **Cost Optimization**: S3 VPC Gateway Endpoint (no data transfer charges), right-sized instances

## Network Architecture

### VPC-App (10.0.0.0/16) - Main Application Stack

**Purpose**: Hosts the entire SanGo application infrastructure

#### Subnets

| Subnet | CIDR | AZ | Purpose | Tier |
|--------|------|----|---------| -----|
| Public AZ-a | 10.0.1.0/24 | ap-southeast-1a | ALB, NAT Gateway | Presentation |
| Public AZ-b | 10.0.101.0/24 | ap-southeast-1b | ALB, NAT Gateway | Presentation |
| Private App AZ-a | 10.0.2.0/24 | ap-southeast-1a | EC2, EFS, Lambda | Application |
| Private App AZ-b | 10.0.102.0/24 | ap-southeast-1b | EC2, EFS, Lambda | Application |
| Private DB AZ-a | 10.0.3.0/24 | ap-southeast-1a | RDS Primary, Redis | Database |
| Private DB AZ-b | 10.0.103.0/24 | ap-southeast-1b | RDS Standby, Redis | Database |
| Firewall AZ-a | 10.0.5.0/28 | ap-southeast-1a | Network Firewall Endpoint | Security |
| Firewall AZ-b | 10.0.6.0/28 | ap-southeast-1b | Network Firewall Endpoint | Security |

#### Traffic Flow

```
Internet
  ↓
CloudFront (CDN)
  ↓
ALB (Public Subnet)
  ↓
EC2 Auto Scaling Group (Private App Subnet)
  ↓
RDS PostgreSQL / ElastiCache Redis (Private DB Subnet)
```

**Egress Traffic Flow** (MH2 - Network Firewall):

```
EC2 (Private App Subnet)
  ↓ (route: 0.0.0.0/0 → Firewall Endpoint)
Network Firewall Endpoint (Firewall Subnet)
  ↓ (stateful domain filtering)
AWS Network Firewall
  ↓ (route: 0.0.0.0/0 → NAT Gateway)
NAT Gateway (Public Subnet)
  ↓
Internet Gateway
  ↓
Internet
```

### VPC-Mgmt (10.1.0.0/16) - Management Plane

**Purpose**: Isolated management and monitoring infrastructure

#### Subnets

| Subnet | CIDR | AZ | Purpose |
|--------|------|----|---------| 
| Public | 10.1.1.0/24 | ap-southeast-1a | Bastion Host |

### VPC Peering (MH1)

- **Connection**: VPC-App ↔ VPC-Mgmt
- **Type**: Bidirectional with DNS resolution enabled
- **Purpose**: Allow Bastion host to SSH into EC2 instances in private subnets
- **Routes**:
  - VPC-App Private RT: `10.1.0.0/16 → pcx-xxxxx`
  - VPC-Mgmt RT: `10.0.0.0/16 → pcx-xxxxx`

## Compute Layer

### EC2 Auto Scaling Group

- **Instance Type**: t3.medium
- **AMI**: Amazon Linux 2023 (latest)
- **Capacity**: Min=2, Max=4, Desired=2
- **Placement**: Private App Subnets (both AZs)
- **Scaling Policy**: Target Tracking - CPU 70%
- **Health Check**: ELB health check on `/health` endpoint

#### User Data Script

The launch template includes a user data script that:
1. Installs Node.js 20
2. Installs PM2 process manager
3. Mounts EFS at `/mnt/efs/uploads`
4. Creates `.env` file with DB and Redis endpoints
5. Downloads app bundle from S3 (placeholder)
6. Starts application with PM2

### Application Load Balancer

- **Type**: Internet-facing
- **Subnets**: Public subnets (both AZs)
- **Listeners**: HTTP (port 80)
- **Target Group**: EC2 instances on port 3000
- **Health Check**: `/health` endpoint, 30s interval

### Bastion Host

- **Instance Type**: t3.micro
- **AMI**: Amazon Linux 2023
- **Placement**: VPC-Mgmt Public Subnet
- **Access**: SSH from team IP only (configurable via `team_ip_cidr`)
- **Purpose**: SSH jump host to access private EC2 instances

## Database Layer

### RDS PostgreSQL

- **Engine**: PostgreSQL 15.4
- **Instance Class**: db.t3.medium
- **Storage**: 20 GB GP3 (auto-scaling to 100 GB)
- **Multi-AZ**: Enabled (synchronous replication)
- **Encryption**: At rest (AWS-managed KMS key)
- **Backup**: 7-day retention, automated daily backups
- **Maintenance Window**: Monday 04:00-05:00 UTC
- **Logs**: PostgreSQL and upgrade logs to CloudWatch

**Connection**:
- Endpoint: `sango-postgres.xxxxx.ap-southeast-1.rds.amazonaws.com:5432`
- Database: `sango_db`
- Username: `sango_admin`
- Password: Stored in Secrets Manager (recommended) or tfvars

### ElastiCache Redis

- **Engine**: Redis 7.0
- **Node Type**: cache.t3.micro
- **Nodes**: 1 (single node for dev/demo)
- **Encryption**: At rest and in transit enabled
- **Purpose**: Session cache, API response cache

## Storage Layer

### Amazon EFS (MH3)

- **Performance Mode**: General Purpose
- **Throughput Mode**: Elastic (auto-scales)
- **Encryption**: At rest (AWS-managed key)
- **Lifecycle Policy**: Transition to IA after 30 days
- **Mount Targets**: One per Private App Subnet (AZ-a, AZ-b)
- **Purpose**: Shared file storage for venue image uploads (replaces local disk)

**Mount Path**: `/mnt/efs/uploads`

### S3 Buckets

#### sango-static-assets-{account_id}

- **Purpose**: Frontend static files (React build output)
- **Versioning**: Enabled
- **Encryption**: AES256
- **Public Access**: Blocked (served via CloudFront OAC)
- **Access**: CloudFront Origin Access Control only

#### sango-uploads-{account_id}

- **Purpose**: Venue image uploads, backend bundles
- **Versioning**: Enabled
- **Encryption**: AES256
- **Public Access**: Blocked
- **Event Notification**: Triggers Lambda on `s3:ObjectCreated:Put` with prefix `venues/`

### S3 VPC Gateway Endpoint

- **Type**: Gateway Endpoint (no hourly charge)
- **Service**: com.amazonaws.ap-southeast-1.s3
- **Route Tables**: All private route tables (App, DB)
- **Purpose**: Allow EC2 and Lambda to access S3 without NAT Gateway (cost savings)

## CDN Layer

### CloudFront Distribution - Frontend

- **Origin**: S3 Static Assets bucket
- **Origin Access**: Origin Access Control (OAC)
- **Default Root Object**: `index.html`
- **Cache Behavior**: CachingOptimized policy
- **Error Pages**: 404/403 → `/index.html` (SPA routing)
- **HTTPS**: Redirect HTTP to HTTPS
- **Price Class**: PriceClass_200 (excludes South America)

### CloudFront Distribution - Backend (Optional)

- **Origin**: Application Load Balancer
- **Cache Behavior**: No caching (TTL=0) for API requests
- **Headers Forwarded**: Host, Authorization, Accept, Content-Type
- **Cookies**: Forward all
- **Purpose**: Global edge locations, DDoS protection

## Serverless Layer

### Lambda Function - Bedrock KB (MH4)

- **Runtime**: Node.js 20
- **Memory**: 512 MB
- **Timeout**: 30 seconds
- **VPC**: Private App Subnets
- **Purpose**: Query Bedrock Knowledge Base for venue recommendations
- **Trigger**: API Gateway HTTP API
- **Environment Variables**:
  - `BEDROCK_KB_ID`: Knowledge Base ID
  - `BEDROCK_MODEL_ID`: `anthropic.claude-v2`

### Lambda Function - API Authorizer (MH4)

- **Runtime**: Python 3.12
- **Memory**: 128 MB
- **Timeout**: 10 seconds
- **VPC**: No (faster cold start)
- **Purpose**: Validate `x-api-key` header for API Gateway
- **Type**: REQUEST authorizer with simple responses
- **Environment Variables**:
  - `VALID_API_KEY`: API key for authentication

### Lambda Function - S3 Venue Image Processor (MH5)

- **Runtime**: Python 3.12
- **Memory**: 256 MB
- **Timeout**: 30 seconds
- **VPC**: Private App Subnets (to access RDS)
- **Purpose**: Process venue image uploads and store metadata in RDS
- **Trigger**: S3 event notification on `venues/` prefix
- **Environment Variables**:
  - `DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_PORT`

### API Gateway HTTP API (MH4)

- **Type**: HTTP API (lower cost than REST API)
- **Protocol**: HTTPS only
- **CORS**: Enabled (allow all origins, GET/POST methods)
- **Route**: `POST /ask` → Lambda Proxy Integration
- **Authorizer**: Lambda authorizer (x-api-key)
- **Throttling**: 
  - Rate: 5 requests/second
  - Burst: 10 requests
- **Stage**: `prod` (auto-deploy enabled)

**Endpoint**: `https://{api-id}.execute-api.ap-southeast-1.amazonaws.com/prod/ask`

## Security Layer

### Network Firewall (MH2)

**Stateful Rule Group - Domain Allowlist**:

Allowed domains:
- `.payos.vn` (payment gateway)
- `.amazonaws.com` (AWS services)
- `.amazoncognito.com` (authentication)
- `nodemailer.com` (email service)

**Policy**:
- Stateless Default Action: `aws:forward_to_sfe`
- Stateful Default Action: `aws:drop_established`
- Rule Order: `DEFAULT_ACTION_ORDER`

**Logging**:
- Alert Logs: `/aws/network-firewall/sango/alert`
- Flow Logs: `/aws/network-firewall/sango/flow`

### Security Groups

#### ALB Security Group

| Type | Protocol | Port | Source | Description |
|------|----------|------|--------|-------------|
| Inbound | TCP | 80 | 0.0.0.0/0 | HTTP from internet |
| Inbound | TCP | 443 | 0.0.0.0/0 | HTTPS from internet |
| Outbound | All | All | 0.0.0.0/0 | All outbound |

#### EC2 App Security Group

| Type | Protocol | Port | Source | Description |
|------|----------|------|--------|-------------|
| Inbound | TCP | 3000 | ALB SG | App traffic from ALB |
| Inbound | TCP | 22 | Bastion SG | SSH from Bastion |
| Outbound | All | All | 0.0.0.0/0 | All outbound |

#### RDS Security Group

| Type | Protocol | Port | Source | Description |
|------|----------|------|--------|-------------|
| Inbound | TCP | 5432 | EC2 App SG | PostgreSQL from App tier |
| Outbound | All | All | 0.0.0.0/0 | All outbound |

#### Redis Security Group

| Type | Protocol | Port | Source | Description |
|------|----------|------|--------|-------------|
| Inbound | TCP | 6379 | EC2 App SG | Redis from App tier |
| Outbound | All | All | 0.0.0.0/0 | All outbound |

#### EFS Security Group

| Type | Protocol | Port | Source | Description |
|------|----------|------|--------|-------------|
| Inbound | TCP | 2049 | EC2 App SG | NFS from App tier |
| Outbound | All | All | 0.0.0.0/0 | All outbound |

#### Bastion Security Group

| Type | Protocol | Port | Source | Description |
|------|----------|------|--------|-------------|
| Inbound | TCP | 22 | Team IP CIDR | SSH from team only |
| Outbound | All | All | 0.0.0.0/0 | All outbound |

### IAM Roles

#### EC2 Role

**Permissions**:
- SSM Session Manager (alternative to SSH)
- S3 read/write on both buckets
- CloudWatch Logs write
- EFS client mount

**Policy**: Least-privilege with specific resource ARNs (no wildcards)

#### Lambda Role

**Permissions**:
- VPC ENI management (for VPC-attached Lambdas)
- CloudWatch Logs write
- Bedrock Retrieve and RetrieveAndGenerate
- S3 GetObject on uploads bucket (venues/ prefix)
- Secrets Manager read

**Policy**: Scoped to specific resources

#### Backup Role

**Permissions**:
- AWS Managed Policies:
  - `AWSBackupServiceRolePolicyForBackup`
  - `AWSBackupServiceRolePolicyForRestores`

### VPC Flow Logs

- **Enabled on**: VPC-App and VPC-Mgmt
- **Traffic Type**: ALL (accepted and rejected)
- **Destination**: CloudWatch Logs
- **Log Groups**:
  - `/aws/vpc/flowlogs/sango-app-vpc`
  - `/aws/vpc/flowlogs/sango-mgmt-vpc`
- **Retention**: 7 days

## Backup and Disaster Recovery (MH3)

### AWS Backup

**Backup Vault**: `sango-backup-vault`

**Backup Plan**: `sango-daily-backup`
- **Schedule**: Daily at 02:00 UTC (`cron(0 2 * * ? *)`)
- **Retention**: 7 days
- **Start Window**: 60 minutes
- **Completion Window**: 180 minutes

**Resources Backed Up** (tag-based selection: `backup=true`):
- EFS file system
- RDS PostgreSQL instance
- EC2 EBS volumes (via ASG tag propagation)

**Recovery Point Objective (RPO)**: 24 hours  
**Recovery Time Objective (RTO)**: ~30 minutes (EFS), ~10 minutes (RDS)

### RDS Multi-AZ

- **Primary**: ap-southeast-1a
- **Standby**: ap-southeast-1b
- **Replication**: Synchronous
- **Automatic Failover**: Yes (~1-2 minutes)
- **Failover Triggers**: AZ failure, instance failure, storage failure

## Monitoring and Logging

### CloudWatch Log Groups

| Log Group | Source | Retention |
|-----------|--------|-----------|
| `/aws/vpc/flowlogs/sango-app-vpc` | VPC Flow Logs | 7 days |
| `/aws/vpc/flowlogs/sango-mgmt-vpc` | VPC Flow Logs | 7 days |
| `/aws/network-firewall/sango/alert` | Network Firewall | 7 days |
| `/aws/network-firewall/sango/flow` | Network Firewall | 7 days |
| `/aws/lambda/sango-bedrock-kb-function` | Lambda | 7 days |
| `/aws/lambda/sango-api-authorizer` | Lambda | 7 days |
| `/aws/lambda/sango-s3-venue-image-processor` | Lambda | 7 days |
| `/aws/ec2/*` | EC2 CloudWatch Agent | 7 days |

### Metrics to Monitor

**Application**:
- ALB Target Response Time
- ALB Healthy Host Count
- ASG CPU Utilization
- ASG Network In/Out

**Database**:
- RDS CPU Utilization
- RDS Database Connections
- RDS Read/Write Latency
- ElastiCache CPU Utilization
- ElastiCache Cache Hit Rate

**Serverless**:
- Lambda Invocations
- Lambda Errors
- Lambda Duration
- API Gateway 4xx/5xx Errors
- API Gateway Latency

**Network**:
- NAT Gateway Bytes Out
- Network Firewall Dropped Packets
- VPC Flow Logs Rejected Connections

## Cost Optimization

### Implemented Strategies

1. **S3 VPC Gateway Endpoint**: No data transfer charges for S3 access from EC2/Lambda
2. **EFS Lifecycle Policy**: Transition to Infrequent Access after 30 days (60% cost savings)
3. **Right-Sized Instances**: t3.medium for app, db.t3.medium for RDS (burstable)
4. **CloudFront Price Class 200**: Excludes expensive South America edge locations
5. **HTTP API**: Lower cost than REST API for API Gateway
6. **Single Redis Node**: Sufficient for dev/demo (upgrade to cluster for production)

### Cost Breakdown (Monthly)

| Category | Cost | Percentage |
|----------|------|------------|
| Network Firewall | $400 | 55% |
| RDS Multi-AZ | $120 | 17% |
| NAT Gateway | $70 | 10% |
| EC2 Instances | $60 | 8% |
| ALB | $25 | 3% |
| ElastiCache | $15 | 2% |
| CloudFront | $10 | 1% |
| Other (S3, EFS, Backup, Lambda) | $16 | 4% |
| **Total** | **$716** | **100%** |

### Cost Reduction Options

For non-production environments:
- Remove Network Firewall → Save $400/month (use Security Groups only)
- Single-AZ RDS → Save $60/month (no Multi-AZ)
- Single NAT Gateway → Save $35/month (shared across AZs)
- Smaller instances (t3.small) → Save $30/month

**Potential savings**: ~$525/month (73% reduction) → **$191/month**

## Scalability

### Horizontal Scaling

- **EC2 Auto Scaling**: Automatically scales from 2 to 4 instances based on CPU
- **RDS Read Replicas**: Can add up to 5 read replicas (not included in base config)
- **ElastiCache Cluster Mode**: Can enable cluster mode for Redis (not included)

### Vertical Scaling

- **EC2**: Can upgrade to t3.large, t3.xlarge, or compute-optimized (c6i family)
- **RDS**: Can upgrade to db.t3.large, db.r6g.large (memory-optimized)
- **ElastiCache**: Can upgrade to cache.t3.small, cache.r6g.large

### Global Scaling

- **CloudFront**: Already provides global edge locations
- **Multi-Region**: Can replicate to additional regions (requires cross-region replication)

## High Availability

### Availability Zones

All critical components are deployed across **2 AZs** (ap-southeast-1a, ap-southeast-1b):
- ALB (active-active)
- NAT Gateway (one per AZ)
- EC2 Auto Scaling Group (distributed)
- RDS (Multi-AZ with automatic failover)
- EFS (replicated across AZs automatically)

### Single Points of Failure

**Eliminated**:
- ✅ Single EC2 instance → Auto Scaling Group
- ✅ Single AZ database → RDS Multi-AZ
- ✅ Single NAT Gateway → One per AZ

**Remaining** (acceptable for dev/demo):
- ⚠️ Single Redis node (upgrade to cluster mode for production)
- ⚠️ Single region (add cross-region replication for DR)

## Security Compliance

### Encryption

| Resource | At Rest | In Transit |
|----------|---------|------------|
| RDS PostgreSQL | ✅ KMS | ✅ SSL/TLS |
| ElastiCache Redis | ✅ KMS | ✅ TLS |
| EFS | ✅ KMS | ✅ TLS |
| S3 Buckets | ✅ AES256 | ✅ HTTPS |
| EBS Volumes | ✅ KMS | N/A |

### Network Security

- ✅ Private subnets for app and database tiers
- ✅ Network Firewall with domain allowlist
- ✅ Security Groups with least-privilege rules
- ✅ VPC Flow Logs enabled
- ✅ Bastion host with IP whitelist
- ✅ No public IPs on app/database instances

### IAM Security

- ✅ Least-privilege policies
- ✅ No wildcard permissions (`Action: "*"` or `Resource: "*"`)
- ✅ Specific resource ARNs
- ✅ Separate roles per service

### Data Security

- ✅ S3 buckets block public access
- ✅ CloudFront OAC (not deprecated OAI)
- ✅ Secrets Manager for sensitive data (recommended)
- ✅ No hardcoded credentials in code

## Disaster Recovery Strategy

### Backup Strategy

- **RDS**: Automated daily backups (7-day retention) + AWS Backup
- **EFS**: AWS Backup daily snapshots (7-day retention)
- **EC2**: EBS snapshots via AWS Backup (7-day retention)

### Recovery Procedures

**Scenario 1: Single EC2 Instance Failure**
- **Detection**: ALB health check fails
- **Action**: Auto Scaling Group automatically replaces instance
- **RTO**: ~5 minutes
- **RPO**: 0 (no data loss)

**Scenario 2: AZ Failure**
- **Detection**: Multiple health check failures
- **Action**: 
  - ALB routes traffic to healthy AZ
  - RDS automatically fails over to standby
  - Auto Scaling Group launches instances in healthy AZ
- **RTO**: ~2 minutes
- **RPO**: 0 (no data loss)

**Scenario 3: Database Corruption**
- **Detection**: Application errors, data inconsistency
- **Action**: Restore RDS from automated backup or AWS Backup recovery point
- **RTO**: ~10 minutes
- **RPO**: Up to 24 hours (last backup)

**Scenario 4: Accidental File Deletion (EFS)**
- **Detection**: User reports missing files
- **Action**: Restore EFS from AWS Backup recovery point
- **RTO**: ~30 minutes
- **RPO**: Up to 24 hours (last backup)

## Future Enhancements

### Short-Term (Next Sprint)

1. **HTTPS on ALB**: Add ACM certificate and HTTPS listener
2. **CloudWatch Alarms**: Set up alarms for critical metrics
3. **RDS Read Replica**: Add read replica for reporting queries
4. **Redis Cluster Mode**: Enable cluster mode for high availability

### Medium-Term (Next Quarter)

1. **AWS WAF**: Add Web Application Firewall on ALB and CloudFront
2. **GuardDuty**: Enable threat detection
3. **AWS Config**: Track configuration changes
4. **Secrets Manager Integration**: Move all secrets from env vars to Secrets Manager
5. **CI/CD Pipeline**: Automate deployments with CodePipeline

### Long-Term (Next Year)

1. **Multi-Region**: Deploy to secondary region for DR
2. **Aurora PostgreSQL**: Migrate from RDS PostgreSQL to Aurora for better performance
3. **ECS/EKS**: Containerize application for better resource utilization
4. **Service Mesh**: Implement App Mesh for microservices
5. **Observability**: Add X-Ray tracing and detailed metrics

## Conclusion

This infrastructure provides a **production-ready, highly available, and secure** foundation for the SanGo application. It implements all W5 Must-Have requirements (MH1-MH5) and follows AWS best practices for:

- ✅ High availability (Multi-AZ)
- ✅ Security (Network Firewall, Security Groups, encryption)
- ✅ Scalability (Auto Scaling, CloudFront)
- ✅ Disaster recovery (AWS Backup, RDS Multi-AZ)
- ✅ Cost optimization (S3 VPC Endpoint, right-sized instances)
- ✅ Monitoring (CloudWatch Logs, VPC Flow Logs)

The architecture is designed to be **maintainable, extensible, and cost-effective** while meeting the requirements of a modern web application.
