# 🏆 Ideal AWS Infrastructure Configuration
> **Trạng thái:** To-Be — cấu hình lý tưởng cho production-ready system.
> Mọi mục được đánh dấu: `✅ Đã có` | `🆕 CẦN THÊM MỚI` | `🔧 CẦN SỬA`

---

## ⚠️ SỬA NGAY — Region Alignment

```diff
- diagram_region: ap-southeast-1   ← SAI (hiện diagram)
+ actual_region: us-west-2         ← ĐÚNG (thực tế resource)
```
> 🔧 **CẦN SỬA:** Cập nhật lại toàn bộ diagram để phản ánh đúng region `us-west-2`.

---

## 1. VPC

```yaml
vpc:
  name: thanh-vpc
  id: vpc-0fd326b43175598e4
  cidr: 10.0.0.0/16
  region: us-west-2
  # ✅ Đã có — cấu hình tốt, không cần thay đổi
```

---

## 2. Subnets

### ✅ Private Subnets — BE, Redis, DB
> Cấu hình tốt. Giữ nguyên.

### 🔧 Public Subnets — Cần bổ sung CIDR
```yaml
public_subnets:
  - name: thanh-public-subnet-a
    az: us-west-2a
    cidr: 10.0.0.0/22   # 🔧 CẦN ĐIỀN — hiện đang thiếu trong documentation
  - name: thanh-public-subnet-b
    az: us-west-2b
    cidr: 10.0.4.0/22   # 🔧 CẦN ĐIỀN — hiện đang thiếu trong documentation
```

---

## 3. Route Tables

### ✅ Private Route Tables A & B
> Đã có NAT + S3 VPC Endpoint. Giữ nguyên.

### 🆕 Main Route Table — Redis & DB Subnets
> Hiện tại Redis/DB dùng main route table chỉ có `local`. Cần đảm bảo không có route ra internet.
```yaml
main_route_table:
  id: rtb-01e8c26cdad818cb3
  routes:
    - 10.0.0.0/16 → local
    # ✅ Correct — isolated, no internet access
```

---

## 4. NAT Gateways & IGW
```yaml
# ✅ Đã có — 1 NAT/AZ, đúng best practice HA
```

---

## 5. VPC Endpoints

### ✅ S3 Gateway Endpoint
> Đã có. Giữ nguyên.

### 🆕 Interface Endpoints (Mới hoàn toàn)
```yaml
# 🆕 CẦN THÊM — để Lambda/EC2 gọi AWS services mà không qua NAT
vpc_interface_endpoints:
  - service: com.amazonaws.us-west-2.secretsmanager
    subnets: [private-subnet-be-a, private-subnet-be-b]
    security_group: thanh-be-sg
    private_dns: true

  - service: com.amazonaws.us-west-2.bedrock-runtime
    subnets: [private-subnet-be-a, private-subnet-be-b]
    security_group: thanh-be-sg
    private_dns: true

  - service: com.amazonaws.us-west-2.logs
    subnets: [private-subnet-be-a, private-subnet-be-b]
    security_group: thanh-be-sg
    private_dns: true
```

---

## 6. Network ACL

```yaml
# 🔧 CẦN CẤU HÌNH — hiện đang dùng default NACL
network_acl:
  id: acl-0f672d3a13c1232a3
  # 🆕 Thêm rules explicit:
  inbound_rules:
    - rule: 100, tcp, 443, 0.0.0.0/0, ALLOW
    - rule: 110, tcp, 80, 0.0.0.0/0, ALLOW
    - rule: 120, tcp, 1024-65535, 0.0.0.0/0, ALLOW  # ephemeral ports
    - rule: 32767, all, all, 0.0.0.0/0, DENY
  outbound_rules:
    - rule: 100, all, all, 0.0.0.0/0, ALLOW
```

---

## 7. Security Groups

### ✅ ALB, BE, Redis, DB Security Groups
> Chain SG → SG. Đúng chuẩn. Giữ nguyên.

### 🔧 Outbound Rules — Tightening
```yaml
# 🔧 CẦN SỬA — hiện tất cả SG có outbound 0.0.0.0/0 (quá rộng)
backend_security_group:
  outbound_rules:
    - tcp/5432 → sg-0159cd8f8ab7493d2  # → RDS only
    - tcp/6379 → sg-0aa22ae55678dcfd0  # → Redis only
    - tcp/443  → 0.0.0.0/0             # → HTTPS for AWS APIs

redis_security_group:
  outbound_rules:
    - all → sg-08c4083b541a7bd18       # → BE SG only

db_security_group:
  outbound_rules:
    - all → sg-08c4083b541a7bd18       # → BE SG only
```

### 🆕 Lambda Security Group (Mới hoàn toàn)
```yaml
lambda_security_group:
  name: thanh-lambda-sg   # 🆕 CẦN TẠO MỚI
  inbound_rules: []        # Lambda không nhận inbound
  outbound_rules:
    - tcp/5432 → sg-0159cd8f8ab7493d2  # → RDS
    - tcp/443  → 0.0.0.0/0             # → Bedrock API
```

---

## 8. Application Load Balancer

### ✅ ALB Configuration
> internet-facing, multi-AZ. Giữ nguyên.

### 🔧 HTTP Listener — Thêm Redirect
```yaml
# 🔧 CẦN SỬA — hiện đang forward thẳng, không redirect
listeners:
  - protocol: HTTP
    port: 80
    action: redirect          # 🔧 ĐỔI từ "forward" → "redirect"
    redirect:
      protocol: HTTPS
      port: 443
      status_code: HTTP_301
```

### 🔧 Target Group — Health Check Path
```yaml
target_group:
  health_check:
    path: /health             # 🔧 ĐỔI từ /mon-choi/lay-tat-ca → /health
    interval: 30
    timeout: 5
    healthy_threshold: 3      # 🔧 ĐỔI 5 → 3 (nhanh hơn)
    unhealthy_threshold: 2
```

### 🆕 WAF trên ALB (Mới hoàn toàn)
```yaml
# 🆕 CẦN THÊM — hiện WAF chỉ có trên CloudFront
waf_alb:
  name: thanh-alb-waf
  scope: REGIONAL
  rules:
    - AWSManagedRulesCommonRuleSet
    - AWSManagedRulesKnownBadInputsRuleSet
  associated_with: thanh-alb
```

---

## 9. Auto Scaling Group (Mới hoàn toàn 🆕)

```yaml
# 🆕 CẦN TẠO HOÀN TOÀN MỚI — hiện tại không có
launch_template:
  name: thanh-be-lt
  instance_type: t3.micro
  ami: ami-0cc96c4cd98401dae
  security_group: sg-08c4083b541a7bd18
  iam_instance_profile: thanh-ec2-role
  imds_v2: required
  monitoring: enabled   # 🔧 BẬT detailed monitoring
  user_data: |
    #!/bin/bash
    # Pull and start app container
    aws ecr get-login-password --region us-west-2 | docker login ...
    docker run -d -p 3000:3000 <your-app-image>

autoscaling_group:
  name: thanh-be-asg
  min_size: 2
  max_size: 4
  desired_capacity: 2
  subnets:
    - thanh-private-subnet-be-a
    - thanh-private-subnet-be-b
  target_group: thanh-tg
  health_check_type: ELB
  health_check_grace_period: 300

scaling_policy:
  type: TargetTrackingScaling
  metric: ASGAverageCPUUtilization
  target_value: 60
```

---

## 10. EC2 (Legacy — sau khi có ASG có thể retire)

```yaml
ec2_instances:
  - name: thanh-be-a
    # ✅ IMDSv2 required — giữ nguyên
    # ✅ No public IP — giữ nguyên
    # ✅ SSM access — giữ nguyên
    # 🔧 BẬT detailed monitoring
    detailed_monitoring: true
    # 🔧 GÁN vào ASG thay vì standalone
```

---

## 11. S3 Buckets

### 🔧 Frontend Bucket — Thêm OAC + Lifecycle
```yaml
s3_frontend:
  name: thanh-bucket-web
  # ✅ versioning, encryption, block public access — giữ nguyên
  # 🆕 THÊM: OAC (Origin Access Control) cho CloudFront
  bucket_policy:
    allow_principal: cloudfront.amazonaws.com
    condition: cloudfront_distribution_arn: arn:aws:cloudfront::597088027861:distribution/E16YLNMEEIP8PW
  # 🆕 THÊM: Access logging
  logging:
    target_bucket: thanh-bucket-logs
    prefix: s3-frontend-access/
  # 🆕 THÊM: Lifecycle rule
  lifecycle_rules:
    - id: archive-old-versions
      noncurrent_version_transition:
        days: 30
        storage_class: STANDARD_IA
      noncurrent_version_expiration:
        days: 90
```

### 🆕 Media Bucket — Standard (Mới hoàn toàn)
```yaml
s3_media_standard:
  name: thanh-bucket-media      # 🆕 CẦN TẠO MỚI
  versioning: enabled
  encryption: SSE-KMS
  kms_key: thanh-kms-key
  block_public_access: true
  lifecycle_rules:
    - transition:
        days: 30
        storage_class: STANDARD_IA
```

### 🆕 Media Bucket — Archive (Mới hoàn toàn)
```yaml
s3_media_archive:
  name: thanh-bucket-media-archive  # 🆕 CẦN TẠO MỚI
  versioning: enabled
  encryption: SSE-KMS
  lifecycle_rules:
    - transition:
        days: 90
        storage_class: GLACIER
```

---

## 12. CloudFront

```yaml
cloudfront:
  name: thanh-web-cf
  # ✅ HTTPS redirect, TLS 1.2, WAF — giữ nguyên
  # 🔧 THÊM OAC thay vì truy cập S3 trực tiếp
  origin:
    oac_id: thanh-oac               # 🆕 CẦN TẠO OAC
    s3_bucket_arn: arn:aws:s3:::thanh-bucket-web
  # 🆕 BẬT logging
  logging:
    enabled: true
    bucket: thanh-bucket-logs.s3.amazonaws.com
    prefix: cloudfront/
  # 🔧 BẬT WAF bot protection
  waf:
    enabled: true
    bot_protection: true            # 🔧 ĐỔI false → true
```

---

## 13. Route 53
```yaml
# ✅ Đã có đầy đủ records — giữ nguyên
# 🆕 THÊM: Health Check để failover nếu cần
route53_health_check:
  name: thanh-alb-health
  protocol: HTTPS
  resource_path: /health
  fqdn: api.lnnhatthanh.id.vn
  port: 443
```

---

## 14. IAM

### 🔧 EC2 Role — Thêm CloudWatch permissions
```yaml
iam_roles:
  - name: thanh-ec2-role
    # ✅ AmazonSSMManagedInstanceCore — giữ nguyên
    # ✅ secretsmanager:GetSecretValue — giữ nguyên
    # 🔧 THÊM CloudWatch Logs permissions
    additional_inline_policy:
      - logs:CreateLogGroup
      - logs:CreateLogStream
      - logs:PutLogEvents
      - cloudwatch:PutMetricData
    # 🆕 THÊM S3 Media bucket access nếu cần
      - s3:PutObject → arn:aws:s3:::thanh-bucket-media/*
      - s3:GetObject → arn:aws:s3:::thanh-bucket-media/*
```

### 🆕 Lambda Execution Role (Mới hoàn toàn)
```yaml
lambda_execution_role:
  name: thanh-lambda-role           # 🆕 CẦN TẠO MỚI
  trust_policy:
    service: lambda.amazonaws.com
  policies:
    - AWSLambdaVPCAccessExecutionRole
    - AWSLambdaBasicExecutionRole
  inline_policy:
    # KHÔNG DÙNG Action:* hoặc Resource:*
    permissions:
      - action: bedrock:Retrieve
        resource: "arn:aws:bedrock:us-west-2::knowledge-base/<kb-id>"
      - action: bedrock:RetrieveAndGenerate
        resource: "arn:aws:bedrock:us-west-2::knowledge-base/<kb-id>"
      - action: rds-db:connect
        resource: "arn:aws:rds-db:us-west-2:597088027861:dbuser:*/postgres"
      - action: secretsmanager:GetSecretValue
        resource: "arn:aws:secretsmanager:us-west-2:597088027861:secret:qlsan/dev/db*"
```

---

## 15. Secrets Manager

### 🔧 Rotation Policy — Bắt buộc
```yaml
secrets_manager:
  - name: qlsan/dev/db
    # 🔧 ĐỔI password: thanh123 → mật khẩu mạnh (16+ chars, symbols)
    password: "<strong-auto-generated>"
    # 🆕 BẬT rotation
    rotation:
      enabled: true
      lambda_arn: arn:aws:lambda:us-west-2:597088027861:function:SecretsManagerRDSPostgreSQLRotationSingleUser
      rotation_days: 30
    # 🆕 THÊM resource-based policy
    resource_policy:
      allow_principals:
        - arn:aws:iam::597088027861:role/thanh-ec2-role
        - arn:aws:iam::597088027861:role/thanh-lambda-role
```

---

## 16. RDS PostgreSQL

```yaml
rds:
  # ✅ Multi-AZ, encryption, backup, monitoring — giữ nguyên
  # 🔧 BẬT IAM DB Authentication
  iam_db_auth: true                 # 🔧 ĐỔI false → true
  # 🔧 BẬT manage_master_password qua RDS
  manage_master_password: true      # 🆕 để RDS tự rotate trong Secrets Manager
  # 🔧 Tăng backup retention
  backup:
    retention_days: 14              # 🔧 ĐỔI 7 → 14 days
    preferred_window: "02:00-03:00"
  # 🆕 THÊM deletion protection & final snapshot
  final_snapshot_identifier: "thanh-database-final"
```

---

## 17. ElastiCache Redis (Mới — cần config đầy đủ)

```yaml
# 🆕 CẦN GHI NHẬN ĐẦY ĐỦ CONFIG — hiện chỉ có trong diagram
elasticache_redis:
  cluster_id: thanh-redis
  engine: redis
  engine_version: "7.x"
  node_type: cache.t3.micro        # Cần confirm
  num_cache_clusters: 2            # Primary + Standby (Multi-AZ)
  automatic_failover: true
  multi_az: true
  subnet_group:
    name: thanh-redis-subnetgr
    subnets:
      - thanh-private-subnet-redis-a
      - thanh-private-subnet-redis-b
  security_group: thanh-redis-sg
  encryption_at_rest: true         # 🆕 CẦN BẬT
  encryption_in_transit: true      # 🆕 CẦN BẬT (TLS)
  auth_token: "<from-secrets-manager>"  # 🆕 CẦN THÊM
  snapshot_retention: 7
  parameter_group: default.redis7
```

---

## 18. Lambda (Mới — cần config đầy đủ)

```yaml
# 🆕 CẦN TẠO HOÀN TOÀN MỚI
lambda_functions:
  - name: thanh-chatbot-handler
    runtime: python3.12
    handler: app.handler
    timeout: 30
    memory: 256
    vpc_config:
      subnets:
        - thanh-private-subnet-be-a
        - thanh-private-subnet-be-b
      security_group: thanh-lambda-sg
    environment:
      BEDROCK_KB_ID: "<knowledge-base-id>"
      SECRET_ARN: "arn:aws:secretsmanager:us-west-2:597088027861:secret:qlsan/dev/db*"
    iam_role: thanh-lambda-role
    # Trigger options (chọn một):
    triggers:
      - type: api_gateway        # Option A: API Gateway
      - type: s3_event           # Option B: S3 object upload
    logging:
      log_group: /aws/lambda/thanh-chatbot-handler
      retention_days: 14
```

---

## 19. Amazon Bedrock Knowledge Base (Mới — cần config đầy đủ)

```yaml
# 🆕 CẦN TẠO HOÀN TOÀN MỚI
bedrock_knowledge_base:
  name: thanh-kb
  description: "Knowledge base for XBrain chatbot"
  embedding_model: amazon.titan-embed-text-v1   # Cần chọn và document
  vector_store:
    type: opensearch_serverless   # HOẶC aurora_postgresql, s3_vectors
    collection_name: thanh-kb-vectors
  data_source:
    type: s3
    bucket: thanh-bucket-web     # ← dùng S3 bucket từ W2
    prefix: knowledge-base/
  sync_status: Complete           # Phải có ít nhất 3 documents ingested
  iam_role: thanh-bedrock-role   # 🆕 CẦN TẠO
```

---

## 20. Amazon OpenSearch Serverless (Mới — cho Bedrock vector store)

```yaml
# 🆕 CẦN TẠO NẾU DÙNG OpenSearch làm vector store
opensearch_serverless:
  collection_name: thanh-kb-vectors
  type: VECTORSEARCH
  encryption_policy: AWS_OWNED_KMS
  network_policy: VPC             # Private access
  data_access_policy:
    allow_principal: arn:aws:iam::597088027861:role/thanh-bedrock-role
```

---

## 21. CloudWatch & CloudTrail (Monitoring — Mới cần cấu hình)

```yaml
# 🆕 CẦN THIẾT LẬP HOÀN TOÀN
cloudwatch:
  alarms:
    - name: thanh-ec2-cpu-high
      metric: CPUUtilization
      threshold: 80
      period: 300
      action: sns-alert

    - name: thanh-rds-connections
      metric: DatabaseConnections
      threshold: 100

    - name: thanh-alb-5xx
      metric: HTTPCode_ELB_5XX_Count
      threshold: 10

  log_groups:
    - /aws/lambda/thanh-chatbot-handler
    - /aws/rds/instance/thanh-database/postgresql
    - /ec2/thanh-be

cloudtrail:
  name: thanh-trail               # 🆕 CẦN TẠO
  multi_region: true
  log_bucket: thanh-bucket-logs
  log_file_validation: true
  include_management_events: true
  include_data_events:
    - s3: thanh-bucket-media
```

---

## 22. KMS (Mới — Customer Managed Key)

```yaml
# 🆕 NÂNG CẤP từ aws/rds → Customer Managed Key
kms:
  - alias: alias/thanh-rds-key
    description: "CMK for RDS PostgreSQL"
    key_rotation: true            # 🆕 Auto-rotate hàng năm
    policy:
      allow_principals:
        - arn:aws:iam::597088027861:role/thanh-ec2-role
        - arn:aws:iam::597088027861:root

  - alias: alias/thanh-s3-key
    description: "CMK for S3 Media buckets"
    key_rotation: true
```

---

## 23. Tổng hợp — Terraform Modules Cần Tạo

```
infrastructure/
├── modules/
│   ├── vpc/               ✅ Đã có config
│   ├── subnet/            ✅ Đã có config (cần bổ sung CIDR public)
│   ├── nat/               ✅ Đã có config
│   ├── route-table/       ✅ Đã có config
│   ├── vpc-endpoint/      ✅ S3 Gateway — 🆕 thêm Interface Endpoints
│   ├── nacl/              🔧 Cần custom rules
│   ├── security-group/    ✅ Đã có — 🔧 tighten outbound — 🆕 lambda-sg
│   ├── acm/               ✅ Đã có config
│   ├── route53/           ✅ Đã có — 🆕 health check
│   ├── alb/               ✅ Đã có — 🔧 HTTP redirect
│   ├── target-group/      ✅ Đã có — 🔧 health path
│   ├── waf/               🔧 Có trên CF — 🆕 thêm cho ALB
│   ├── cloudfront/        ✅ Đã có — 🔧 thêm OAC
│   ├── s3/                ✅ Frontend — 🆕 media + archive buckets
│   ├── ec2-launch-template/ 🆕 CẦN TẠO MỚI
│   ├── autoscaling-group/   🆕 CẦN TẠO MỚI
│   ├── rds/               ✅ Đã có — 🔧 IAM auth, rotation
│   ├── elasticache/       🆕 CẦN GHI NHẬN ĐẦY ĐỦ
│   ├── lambda/            🆕 CẦN TẠO MỚI
│   ├── bedrock-kb/        🆕 CẦN TẠO MỚI
│   ├── opensearch/        🆕 CẦN TẠO NẾU DÙNG
│   ├── iam/               ✅ EC2 role — 🔧 thêm permissions — 🆕 lambda role
│   ├── secrets-manager/   ✅ Đã có — 🔧 rotation + strong password
│   ├── kms/               🆕 CẦN TẠO CMK thay managed key
│   └── cloudwatch/        🆕 CẦN TẠO alarms + dashboards
```
