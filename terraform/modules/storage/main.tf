# Storage Module - S3, EFS, VPC Endpoint

# ============================================================================
# S3 Buckets
# ============================================================================

# S3 Bucket for Static Assets (Frontend)
resource "aws_s3_bucket" "static_assets" {
  bucket = "sango-static-assets-${var.account_id}"

  tags = {
    Name = "${var.project_name}-static-assets"
  }
}

resource "aws_s3_bucket_versioning" "static_assets" {
  bucket = aws_s3_bucket.static_assets.id

  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_public_access_block" "static_assets" {
  bucket = aws_s3_bucket.static_assets.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_server_side_encryption_configuration" "static_assets" {
  bucket = aws_s3_bucket.static_assets.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# S3 Bucket for Uploads (Venue Images)
resource "aws_s3_bucket" "uploads" {
  bucket = "sango-uploads-${var.account_id}"

  tags = {
    Name = "${var.project_name}-uploads"
  }
}

resource "aws_s3_bucket_versioning" "uploads" {
  bucket = aws_s3_bucket.uploads.id

  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_public_access_block" "uploads" {
  bucket = aws_s3_bucket.uploads.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_server_side_encryption_configuration" "uploads" {
  bucket = aws_s3_bucket.uploads.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# S3 Bucket Notification will be configured separately to avoid circular dependency

# ============================================================================
# S3 VPC Gateway Endpoint
# ============================================================================

resource "aws_vpc_endpoint" "s3" {
  vpc_id            = var.vpc_id
  service_name      = "com.amazonaws.${data.aws_region.current.name}.s3"
  vpc_endpoint_type = "Gateway"
  route_table_ids   = var.private_route_table_ids

  tags = {
    Name = "${var.project_name}-s3-vpc-endpoint"
  }
}

data "aws_region" "current" {}

# ============================================================================
# EFS File System (MH3)
# ============================================================================

# EFS Security Group
resource "aws_security_group" "efs" {
  name        = "${var.project_name}-efs-sg"
  description = "Security group for EFS mount targets"
  vpc_id      = var.vpc_id

  ingress {
    from_port       = 2049
    to_port         = 2049
    protocol        = "tcp"
    security_groups = [var.ec2_security_group_id]
    description     = "Allow NFS from EC2 App tier"
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Allow all outbound"
  }

  tags = {
    Name = "${var.project_name}-efs-sg"
  }
}

# EFS File System
resource "aws_efs_file_system" "main" {
  performance_mode = "generalPurpose"
  throughput_mode  = "elastic"
  encrypted        = true

  lifecycle_policy {
    transition_to_ia = "AFTER_30_DAYS"
  }

  tags = {
    Name   = "${var.project_name}-efs"
    backup = "true"
  }
}

# EFS Mount Targets (one per AZ)
resource "aws_efs_mount_target" "az_a" {
  file_system_id  = aws_efs_file_system.main.id
  subnet_id       = var.private_app_subnet_ids[0]
  security_groups = [aws_security_group.efs.id]
}

resource "aws_efs_mount_target" "az_b" {
  file_system_id  = aws_efs_file_system.main.id
  subnet_id       = var.private_app_subnet_ids[1]
  security_groups = [aws_security_group.efs.id]
}
