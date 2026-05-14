# 📋 Current AWS Infrastructure Configuration
> **Trạng thái:** As-Is — chỉ ghi nhận những gì đang tồn tại trên AWS. Không bao gồm gợi ý hay cải thiện.
> **Account ID:** 597088027861
> **Region thực tế:** `us-west-2` (Oregon)
> **⚠️ LƯU Ý QUAN TRỌNG:** Diagram vẽ `ap-southeast-1` nhưng toàn bộ resource thực tế đang ở `us-west-2`. Cần đồng bộ lại.

---

## 1. VPC

```yaml
vpc:
  name: thanh-vpc
  id: vpc-0fd326b43175598e4
  cidr: 10.0.0.0/16
  region: us-west-2
  availability_zones:
    - us-west-2a
    - us-west-2b
```

---

## 2. Subnets

### 2.1 Public Subnets (NAT Gateway)
```yaml
public_subnets:
  - name: thanh-public-subnet-a
    az: us-west-2a
    cidr: "(chưa ghi nhận)"

  - name: thanh-public-subnet-b
    az: us-west-2b
    cidr: "(chưa ghi nhận)"
```

### 2.2 Private Subnets — Backend (EC2 / App)
```yaml
private_subnets_be:
  - name: thanh-private-subnet-be-a
    id: subnet-0bd34cfb47d9b9ce9
    az: us-west-2a
    cidr: 10.0.8.0/22
    route_table: thanh-private-rtb-a

  - name: thanh-private-subnet-be-b
    id: subnet-0e9f6a6f706ea194a
    az: us-west-2b
    cidr: 10.0.12.0/22
    route_table: thanh-private-rtb-b
```

### 2.3 Private Subnets — Redis (ElastiCache)
```yaml
private_subnets_redis:
  - name: thanh-private-subnet-redis-a
    id: subnet-0348187c06de7a2f7
    az: us-west-2a
    cidr: 10.0.16.0/22
    route_table: main

  - name: thanh-private-subnet-redis-b
    id: subnet-04509d5a68ec61517
    az: us-west-2b
    cidr: 10.0.20.0/22
    route_table: main
```

### 2.4 Private Subnets — Database (RDS)
```yaml
private_subnets_db:
  - name: thanh-private-subnet-db-a
    az: us-west-2a
    cidr: 10.0.24.0/22
    route_table: main

  - name: thanh-private-subnet-db-b
    id: subnet-00ffdf50f22345149
    az: us-west-2b
    cidr: 10.0.28.0/22
    route_table: main
```

---

## 3. Route Tables

```yaml
public_route_table:
  name: thanh-public-rtb
  id: rtb-077cdb1303f4f7987
  routes:
    - 0.0.0.0/0 → igw-0859f0bb3c9f078a6
    - 10.0.0.0/16 → local

private_route_table_a:
  name: thanh-private-rtb-a
  id: rtb-0e1f4466cc63d457a
  routes:
    - 10.0.0.0/16 → local
    - 0.0.0.0/0 → nat-043de178c620254c8
    - S3 Prefix List → vpce-093a493dd7ca8c337

private_route_table_b:
  name: thanh-private-rtb-b
  id: rtb-05b477b2cf890a312
  routes:
    - 10.0.0.0/16 → local
    - 0.0.0.0/0 → nat-01624277de47f67e5
    - S3 Prefix List → vpce-093a493dd7ca8c337

main_route_table:
  id: rtb-01e8c26cdad818cb3
  assigned_to: [redis subnets, db subnets]
  routes:
    - 10.0.0.0/16 → local
```

---

## 4. Internet Gateway & NAT Gateways

```yaml
internet_gateway:
  id: igw-0859f0bb3c9f078a6
  attached_to: thanh-vpc

nat_gateways:
  - name: thanh-ngw-a
    id: nat-043de178c620254c8
    az: us-west-2a
    public_ip: 44.253.194.40
    subnet: thanh-public-subnet-a

  - name: thanh-ngw-b
    id: nat-01624277de47f67e5
    az: us-west-2b
    public_ip: 100.22.212.141
    subnet: thanh-public-subnet-b
```

---

## 5. VPC Endpoint

```yaml
vpc_endpoint:
  id: vpce-093a493dd7ca8c337
  type: Gateway
  service: com.amazonaws.us-west-2.s3
  attached_route_tables:
    - thanh-private-rtb-a
    - thanh-private-rtb-b
```

---

## 6. Network ACL

```yaml
network_acl:
  id: acl-0f672d3a13c1232a3
  applied_to: all subnets
  rules: "(dùng default AWS — chưa custom)"
```

---

## 7. Security Groups

### 7.1 ALB Security Group
```yaml
alb_security_group:
  name: thanh-alb-sg
  id: sg-04e38a1af43f9be52
  vpc_id: vpc-0fd326b43175598e4
  inbound:
    - tcp/80  → 0.0.0.0/0
    - tcp/443 → 0.0.0.0/0
  outbound:
    - all → 0.0.0.0/0
```

### 7.2 Backend (EC2) Security Group
```yaml
backend_security_group:
  name: thanh-be-sg
  id: sg-08c4083b541a7bd18
  inbound:
    - tcp/3000 → sg-04e38a1af43f9be52 (ALB SG)
  outbound:
    - all → 0.0.0.0/0
```

### 7.3 Redis Security Group
```yaml
redis_security_group:
  name: thanh-redis-sg
  id: sg-0aa22ae55678dcfd0
  inbound:
    - tcp/6379 → sg-08c4083b541a7bd18 (BE SG)
  outbound:
    - all → 0.0.0.0/0
```

### 7.4 Database Security Group
```yaml
db_security_group:
  name: thanh-db-sg
  id: sg-0159cd8f8ab7493d2
  inbound:
    - tcp/5432 → sg-08c4083b541a7bd18 (BE SG)
    - tcp/5432 → sg-0fe1d0bef271ce93a (Lambda chatbot SG — chưa có full config)
  outbound:
    - all → 0.0.0.0/0
```

---

## 8. Application Load Balancer (ALB)

```yaml
alb:
  name: thanh-alb
  type: application
  scheme: internet-facing
  ip_address_type: ipv4
  vpc_id: vpc-0fd326b43175598e4
  subnets:
    - subnet-07cd5316b10cd2295 (us-west-2a)
    - subnet-068c17ffa7da0b01c (us-west-2b)
  security_group: sg-04e38a1af43f9be52
  dns_name: thanh-alb-1625478833.us-west-2.elb.amazonaws.com

listeners:
  - protocol: HTTP
    port: 80
    action: forward   # ← chưa redirect sang HTTPS
    target_group: thanh-tg

  - protocol: HTTPS
    port: 443
    ssl_policy: ELBSecurityPolicy-TLS13-1-2-Res-PQ-2025-09
    certificate: lnnhatthanh.id.vn
    action: forward
    target_group: thanh-tg

target_group:
  name: thanh-tg
  arn: arn:aws:elasticloadbalancing:us-west-2:597088027861:targetgroup/thanh-tg/28605df5771ce105
  target_type: instance
  protocol: HTTP
  port: 3000
  protocol_version: HTTP1
  health_check:
    path: /mon-choi/lay-tat-ca
    interval: 30
    timeout: 5
    healthy_threshold: 5
    unhealthy_threshold: 2
    success_codes: "200"
  registered_targets: []  # ← CHƯA CÓ INSTANCE NÀO
```

---

## 9. EC2 (Backend)

```yaml
ec2_instances:
  - name: thanh-be-a
    instance_id: i-007fe795c929b22d4
    instance_type: t3.micro
    ami: ami-0cc96c4cd98401dae
    os: Amazon Linux 2023
    subnet: thanh-private-subnet-be-a
    private_ip: 10.0.10.215
    public_ip: none
    security_group: sg-08c4083b541a7bd18
    iam_role: thanh-ec2-role
    key_pair: none
    imds_v2: required
    detailed_monitoring: disabled
    autoscaling: false  # ← KHÔNG CÓ ASG
```

---

## 10. S3 Buckets

### 10.1 Frontend (Static Web)
```yaml
s3_frontend:
  name: thanh-bucket-web
  arn: arn:aws:s3:::thanh-bucket-web
  region: us-west-2
  versioning: enabled
  encryption: SSE-S3
  block_public_access: true
  object_ownership: bucket-owner-enforced
  oac_oai: none  # ← CHƯA CÓ
  logging: disabled
  lifecycle_rules: none
  objects:
    - index.html
    - assets/
    - vite.svg
```

arn:aws:s3:::thanh-media-bucket-240426
  region: us-west-2
  versioning: enabled
  encryption: SSE-S3
    block_public_access: true
---

## 11. CloudFront

```yaml
cloudfront:
  name: thanh-web-cf
  distribution_id: E16YLNMEEIP8PW
  domain: d2ne1ee7lv0i3t.cloudfront.net
  aliases:
    - lnnhatthanh.id.vn
  origin:
    type: s3
    domain: thanh-bucket-web.s3.us-west-2.amazonaws.com
    oac: none  # ← CHƯA CÓ OAC
  behavior:
    viewer_protocol_policy: redirect-to-https
    cache_policy: Managed-CachingOptimized
  default_root_object: index.html
  tls:
    certificate: lnnhatthanh.id.vn
    security_policy: TLSv1.2_2021
  waf:
    enabled: true
    bot_protection: false
  logging: disabled
```

---

## 12. Route 53

```yaml
route53:
  hosted_zone: lnnhatthanh.id.vn
  records:
    - name: lnnhatthanh.id.vn
      type: A (Alias)
      target: d2ne1ee7lv0i3t.cloudfront.net

    - name: lnnhatthanh.id.vn
      type: AAAA (Alias)
      target: cloudfront

    - name: api.lnnhatthanh.id.vn
      type: A (Alias)
      target: thanh-alb-1625478833.us-west-2.elb.amazonaws.com

    - name: _acm_validation_root
      type: CNAME
      purpose: ACM DNS validation

    - name: _acm_validation_api
      type: CNAME
      purpose: ACM DNS validation
```

---

## 13. IAM

```yaml
iam_roles:
  - name: thanh-ec2-role
    arn: arn:aws:iam::597088027861:role/thanh-ec2-role
    trust_policy:
      service: ec2.amazonaws.com
    attached_policies:
      - AmazonSSMManagedInstanceCore
    inline_policies:
      - name: thanh-ec2-policy
        permissions:
          - action: secretsmanager:GetSecretValue
            resource: "arn:aws:secretsmanager:us-west-2:597088027861:secret:qlsan/dev/db*"
    missing_permissions:
      - logs:CreateLogGroup
      - logs:CreateLogStream
      - logs:PutLogEvents
```

---

## 14. Secrets Manager

```yaml
secrets_manager:
  - name: qlsan/dev/db
    arn: arn:aws:secretsmanager:us-west-2:597088027861:secret:qlsan/dev/db-fmjCOt
    engine: postgres
    values:
      host: thanh-database.cdq0s4ce8qln.us-west-2.rds.amazonaws.com
      username: postgres
      password: thanh123   # ← YẾU
      dbname: qlsan
      port: 5432
    encryption: aws/secretsmanager
    rotation: disabled  # ← CHƯA BẬT
```

---

## 15. RDS PostgreSQL

```yaml
rds:
  identifier: thanh-database
  engine: postgres
  version: "17.6"
  instance_class: db.m5.large
  endpoint: thanh-database.cdq0s4ce8qln.us-west-2.rds.amazonaws.com:5432
  storage:
    type: io2
    size_gb: 400
    iops: 3000
    autoscaling: true
    max_size_gb: 1000
  multi_az: true
  primary_az: us-west-2b
  standby_az: us-west-2a
  publicly_accessible: false
  subnet_group: thanh-db-subnetgr
  subnets:
    - subnet-00ffdf50f22345149
    - subnet-0102543e9f9eb1c9a
  security_group: thanh-db-sg
  encryption:
    enabled: true
    kms_key: aws/rds
  backup:
    enabled: true
    retention_days: 7
  monitoring:
    performance_insights: enabled
    enhanced_monitoring: enabled
    interval_sec: 60
  logs:
    - postgresql
    - upgrade
    - iam-db-auth-error
  deletion_protection: true
  iam_db_auth: false  # ← CHƯA BẬT
```

---

## 16. ACM

```yaml
acm:
  id: 3145f3f6-12f7-4e1d-a557-a51836f3edc4
  arn: arn:aws:acm:us-west-2:597088027861:certificate/3145f3f6-12f7-4e1d-a557-a51836f3edc4
  domains:
    - lnnhatthanh.id.vn
    - api.lnnhatthanh.id.vn
  validation: DNS (via Route53)
  status: issued
  key_algorithm: RSA_2048
  expires: 2026-11-07
  associated_with:
    - thanh-alb
```

---

## 17. Các Component trên Diagram nhưng CHƯA có Config

> Những service này **xuất hiện trong diagram** nhưng **không có cấu hình chi tiết** trong Overview.md:

| Service | Ghi chú |
|---|---|
| ElastiCache Redis (Primary + Standby) | Diagram có, config chưa ghi nhận |
| AWS Lambda (Chatbot) | Có SG reference (sg-0fe1d0bef271ce93a) nhưng không có Lambda config |
| Amazon Bedrock Knowledge Base | Diagram có, không có config |
| Amazon OpenSearch | Diagram có, không có config |
| S3 Media Bucket (Standard) | Diagram có lifecycle 30d→IA, không có config |
| S3 Media Bucket (Standard-IA) | Diagram có lifecycle 90d→Glacier, không có config |
| AWS CloudTrail | Listed trong diagram, không có config |
| AWS KMS (custom key) | Chỉ dùng aws/rds managed key |
| WAF trên ALB | Chỉ có WAF trên CloudFront |
| Auto Scaling Group | Diagram có label nhưng Overview.md xác nhận KHÔNG tồn tại |
