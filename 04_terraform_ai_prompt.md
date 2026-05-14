# 🤖 Terraform AI Prompt — AWS Infrastructure from Markdown Config

> **Mục đích:** Copy prompt này và paste vào AI (Claude, ChatGPT, Cursor, etc.) cùng với file markdown config để AI tạo đúng Terraform code theo yêu cầu.
>
> **Cách dùng:**
> 1. Copy toàn bộ prompt bên dưới
> 2. Paste vào AI
> 3. Đính kèm file `01_current_config.md` HOẶC `02_ideal_config.md`
> 4. AI sẽ sinh ra Terraform code theo đúng cấu trúc module

---

## 📋 MASTER TERRAFORM PROMPT

```
# ROLE
Bạn là Senior AWS Cloud Engineer chuyên về Infrastructure as Code (IaC) với 10+ năm kinh nghiệm Terraform.
Bạn sẽ đọc file markdown config đính kèm và sinh ra Terraform code production-ready.

# INPUT
Tôi sẽ cung cấp một file markdown mô tả AWS infrastructure config.
File này có 2 loại entry được đánh dấu rõ:
- "✅ Đã có" → resource đã tồn tại, cần import hoặc tạo matching Terraform code
- "🆕 CẦN THÊM MỚI" → resource chưa có, cần tạo mới từ đầu
- "🔧 CẦN SỬA" → resource đang có nhưng cần thay đổi config

# OUTPUT FORMAT (BẮT BUỘC TUÂN THEO)
Với MỖI module được yêu cầu, sinh ra:

## 1. File structure
```
modules/<module-name>/
  ├── main.tf          # Resource definitions
  ├── variables.tf     # Input variables với description và validation
  ├── outputs.tf       # Output values để module khác reference
  └── versions.tf      # Required providers và version constraints
```

## 2. Coding standards (PHẢI tuân theo)
- Provider: hashicorp/aws ~> 5.0
- Terraform version: >= 1.6
- Backend: S3 + DynamoDB (state locking)
- Naming: dùng đúng tên resource từ markdown (ví dụ: thanh-vpc, thanh-alb)
- Tags: PHẢI thêm tags cho tất cả resource:
  ```hcl
  tags = {
    Project     = "thanh-xbrain"
    Environment = "dev"
    ManagedBy   = "terraform"
    Owner       = "thanh"
  }
  ```
- Variables: KHÔNG hardcode values, dùng variables với defaults từ markdown
- Secrets: KHÔNG hardcode passwords hay keys. Dùng `aws_secretsmanager_secret_version` data source
- `terraform_remote_state` cho cross-module references

## 3. Security requirements (NON-NEGOTIABLE)
- KHÔNG tạo resource với `publicly_accessible = true` cho database
- KHÔNG dùng `0.0.0.0/0` trong Security Group inbound rule trừ ALB port 80/443
- IAM policies KHÔNG được có `Action: "*"` hoặc `Resource: "*"`
- Tất cả S3 bucket phải có `block_public_access = true`
- Tất cả EBS/RDS/ElastiCache phải có encryption enabled
- IMDSv2 phải được enforce trên EC2: `http_tokens = "required"`

## 4. Import blocks (cho resource đã tồn tại)
Với resource đánh dấu "✅ Đã có" và có ID thực tế trong markdown, sinh thêm:
```hcl
import {
  to = aws_vpc.main
  id = "vpc-0fd326b43175598e4"
}
```

# TASK
Đọc file markdown đính kèm và:

1. **LIỆT KÊ** tất cả modules cần tạo (theo thứ tự dependency)
2. **SINH CODE** cho từng module theo format trên
3. **CHỈ RÕ** những resource nào cần `terraform import` (đã có trên AWS)
4. **CẢNH BÁO** nếu config trong markdown có security risk
5. **TẠO** file `terraform.tfvars.example` với tất cả required variables

# DEPENDENCY ORDER (tạo theo thứ tự này)
1. kms          (không dependency)
2. vpc          (depends on: kms)
3. subnet       (depends on: vpc)
4. nat          (depends on: subnet)
5. route-table  (depends on: nat, vpc-endpoint)
6. vpc-endpoint (depends on: vpc, route-table)
7. nacl         (depends on: vpc, subnet)
8. security-group (depends on: vpc)
9. acm          (depends on: route53 - nhưng ACM us-east-1 cho CloudFront)
10. s3          (depends on: kms)
11. cloudfront  (depends on: s3, acm, waf)
12. route53     (depends on: cloudfront, alb)
13. iam         (depends on: kms, s3)
14. secrets-manager (depends on: kms, rds)
15. rds         (depends on: subnet, security-group, kms, secrets-manager)
16. elasticache (depends on: subnet, security-group, kms)
17. alb         (depends on: subnet, security-group, acm)
18. target-group (depends on: alb, vpc)
19. waf         (depends on: không có)
20. ec2-launch-template (depends on: security-group, iam)
21. autoscaling-group (depends on: ec2-launch-template, target-group, subnet)
22. lambda      (depends on: iam, security-group, subnet)
23. bedrock-kb  (depends on: s3, iam, opensearch)
24. opensearch  (depends on: iam)
25. cloudwatch  (depends on: tất cả resource trên)
26. cloudtrail  (depends on: s3, kms)

# ADDITIONAL INSTRUCTIONS
- Nếu markdown có comment "(chưa ghi nhận)" hoặc "(cần bổ sung)" → dùng variable với `default = null` và thêm TODO comment
- Nếu có mục "🔧 CẦN SỬA" → sinh code với giá trị mới (đã sửa), thêm comment `# CHANGED: <lý do>`
- Nếu có mục "🆕 CẦN THÊM MỚI" → thêm comment `# NEW RESOURCE` ở đầu block
- Sinh ra `README.md` cho mỗi module với: mô tả, inputs, outputs, usage example
- Với Lambda: sinh cả `src/handler.py` skeleton với logging, error handling, và boto3 client setup

# OUTPUT LANGUAGE
- Comments trong code: Tiếng Anh
- Giải thích/hướng dẫn cho tôi: Tiếng Việt
- Variable descriptions: Tiếng Anh

# BẮNG ĐẦU
Sau khi đọc xong file markdown, hãy:
1. Xác nhận bạn đã hiểu kiến trúc bằng cách tóm tắt trong 5 bullet points
2. Hỏi tôi module nào muốn tạo trước (hoặc tạo tất cả nếu tôi nói "tạo hết")
3. Cảnh báo ngay nếu thấy security issue trong config
```

---

## 🎯 MODULE-SPECIFIC PROMPTS (Dùng khi muốn tạo từng module riêng lẻ)

### Prompt cho Module VPC

```
Dựa trên file markdown config đính kèm, hãy tạo Terraform module cho VPC.

YÊU CẦU CỤ THỂ:
- Tạo VPC với CIDR từ config (10.0.0.0/16)
- Tạo tất cả subnets (public + private BE + private Redis + private DB)
- Tạo Internet Gateway
- Tạo 2 NAT Gateways (1 per AZ) với Elastic IPs
- Tạo Route Tables với đúng routes từ config
- Tạo S3 Gateway VPC Endpoint
- Tạo Network ACL với custom rules
- PHẢI có import blocks cho các resource đã có ID thực tế
- PHẢI có outputs: vpc_id, subnet_ids (theo từng tier), nat_gateway_ids, vpc_endpoint_id

Cấu trúc file:
modules/vpc/main.tf, variables.tf, outputs.tf, versions.tf
```

### Prompt cho Module Security Groups

```
Dựa trên file markdown config đính kèm, hãy tạo Terraform module cho Security Groups.

YÊU CẦU CỤ THỂ:
- Tạo 4 SGs: ALB, Backend, Redis, Database
- Tạo thêm Lambda SG (🆕 NEW)
- Inbound rules dùng SG reference (KHÔNG dùng CIDR cho internal traffic)
- Outbound rules: tighten theo ideal config (không phải 0.0.0.0/0 tất cả)
- PHẢI có import blocks cho SG đã có ID thực tế
- PHẢI có outputs: từng sg_id để module khác dùng

Cấu trúc file:
modules/security-group/main.tf, variables.tf, outputs.tf, versions.tf
```

### Prompt cho Module RDS

```
Dựa trên file markdown config đính kèm, hãy tạo Terraform module cho RDS PostgreSQL.

YÊU CẦU CỤ THỂ:
- db.m5.large, PostgreSQL 17.6, io2 400GB, 3000 IOPS
- Multi-AZ enabled
- Encryption với KMS (dùng CMK từ kms module output)
- Backup retention: 14 ngày
- Performance Insights + Enhanced Monitoring
- deletion_protection = true
- iam_database_authentication_enabled = true (🔧 SỬA từ false)
- manage_master_password = true (🆕 MỚI — để RDS tự quản lý secret)
- PHẢI có import block (resource đã tồn tại)
- KHÔNG set password trực tiếp — dùng manage_master_password
- PHẢI có outputs: db_endpoint, db_port, db_name

Cấu trúc file:
modules/rds/main.tf, variables.tf, outputs.tf, versions.tf
```

### Prompt cho Module Lambda + Bedrock

```
Dựa trên file markdown config đính kèm, hãy tạo Terraform module cho Lambda và Bedrock Knowledge Base.

YÊU CẦU CỤ THỂ (Lambda):
- Runtime: python3.12, timeout 30s, memory 256MB
- VPC placement: private BE subnets
- Security Group: lambda-sg
- IAM role: KHÔNG có Action:* hoặc Resource:*
  - bedrock:Retrieve → specific KB ARN
  - bedrock:RetrieveAndGenerate → specific KB ARN
  - secretsmanager:GetSecretValue → specific secret ARN
  - VPC execution permissions (AWSLambdaVPCAccessExecutionRole)
- Trigger: S3 Event Notification HOẶC API Gateway (hỏi tôi chọn cái nào trước)
- CloudWatch Log Group với retention 14 ngày
- Sinh thêm: src/handler.py skeleton với boto3 bedrock-agent-runtime client

YÊU CẦU CỤ THỂ (Bedrock KB):
- Embedding model: amazon.titan-embed-text-v1
- Vector store: OpenSearch Serverless
- Data source: S3 bucket (thanh-bucket-web/knowledge-base/)
- Sync policy: auto-sync khi có object mới trong S3

Cấu trúc file:
modules/lambda/main.tf, variables.tf, outputs.tf, versions.tf, src/handler.py
modules/bedrock-kb/main.tf, variables.tf, outputs.tf, versions.tf
```

### Prompt cho Module ASG (Auto Scaling Group)

```
Dựa trên file markdown config đính kèm, hãy tạo Terraform module cho Auto Scaling Group.

ĐÂY LÀ RESOURCE HOÀN TOÀN MỚI (🆕) — không có import.

YÊU CẦU CỤ THỂ:
Launch Template:
- AMI: ami-0cc96c4cd98401dae (Amazon Linux 2023, us-west-2)
- Instance type: t3.micro
- Security group: thanh-be-sg
- IAM instance profile: thanh-ec2-role
- IMDSv2: http_tokens = "required" (MANDATORY)
- Detailed monitoring: true
- EBS: gp3, encrypted với KMS
- User data: script để pull và start Docker container

Auto Scaling Group:
- min: 2, max: 4, desired: 2
- Subnets: cả 2 private BE subnets (multi-AZ)
- Target group: attach vào thanh-tg
- Health check: ELB, grace period 300s

Scaling Policy:
- TargetTrackingScaling
- CPUUtilization = 60%
- Scale in cooldown: 300s
- Scale out cooldown: 60s

PHẢI có outputs: asg_name, asg_arn, launch_template_id

Cấu trúc file:
modules/autoscaling-group/main.tf, variables.tf, outputs.tf, versions.tf
```

---

## 🛡️ SECURITY REVIEW PROMPT (Dùng sau khi sinh code xong)

```
Hãy review toàn bộ Terraform code tôi đã tạo và kiểm tra:

1. CRITICAL CHECKS:
   - Có resource nào với publicly_accessible = true không? (Database phải false)
   - Có IAM policy nào có Action:* hoặc Resource:* không?
   - Có Security Group inbound rule nào allow 0.0.0.0/0 trừ ALB 80/443 không?
   - Có S3 bucket nào không có block_public_access = true không?
   - Có resource nào không có encryption enabled không?
   - Có hardcoded password, secret, hay access key nào không?

2. BEST PRACTICE CHECKS:
   - Tất cả resource có tags đầy đủ không?
   - Tất cả sensitive outputs có sensitive = true không?
   - Có circular dependency nào giữa modules không?
   - IMDSv2 có được enforce trên tất cả EC2/Launch Template không?
   - Có deletion_protection trên RDS và critical resources không?

3. W3 COMPLIANCE CHECKS:
   - Database có trong private subnet không?
   - Lambda IAM role có least-privilege không?
   - S3 Gateway Endpoint có được reference đúng trong route table không?
   - Security Group inbound của DB có reference App SG (không phải CIDR) không?

Trả về danh sách issues theo format:
- 🔴 CRITICAL: <vấn đề> → <cách sửa>
- 🟡 WARNING: <vấn đề> → <cách sửa>
- 🟢 OK: <điều tốt cần giữ>
```

---

## 📁 Suggested Final Directory Structure

```
infrastructure/
├── backend.tf                    # S3 state backend config
├── providers.tf                  # AWS provider config
├── main.tf                       # Module orchestration
├── variables.tf                  # Global variables
├── outputs.tf                    # Global outputs
├── terraform.tfvars.example      # Example values (KHÔNG commit .tfvars)
│
└── modules/
    ├── kms/
    ├── vpc/
    ├── security-group/
    ├── acm/
    ├── s3/
    ├── cloudfront/
    ├── route53/
    ├── iam/
    ├── secrets-manager/
    ├── rds/
    ├── elasticache/
    ├── alb/
    ├── target-group/
    ├── waf/
    ├── ec2-launch-template/
    ├── autoscaling-group/
    ├── lambda/
    │   └── src/
    │       └── handler.py
    ├── bedrock-kb/
    ├── opensearch/
    ├── cloudwatch/
    └── cloudtrail/
```
