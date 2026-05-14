# SanGo Infrastructure - Root Module
# Region: ap-southeast-1 (Singapore)

terraform {
  required_version = ">= 1.5"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    archive = {
      source  = "hashicorp/archive"
      version = "~> 2.4"
    }
  }
}

provider "aws" {
  region = var.region
  default_tags {
    tags = {
      Project     = "SanGoal"
      Environment = var.env
      ManagedBy   = "Terraform"
    }
  }
}

# Data source for current AWS account
data "aws_caller_identity" "current" {}

# Networking Module (VPC-App + VPC-Mgmt + Peering + Network Firewall)
module "networking" {
  source = "./modules/networking"

  project_name  = var.project_name
  env           = var.env
  region        = var.region
  team_ip_cidr  = var.team_ip_cidr
  key_pair_name = var.key_pair_name
}

# Security Module (IAM Roles, KMS Keys)
module "security" {
  source = "./modules/security"

  project_name = var.project_name
  env          = var.env
  account_id   = data.aws_caller_identity.current.account_id
}

# Database Module (RDS PostgreSQL + ElastiCache Redis)
module "database" {
  source = "./modules/database"

  project_name          = var.project_name
  env                   = var.env
  vpc_id                = module.networking.vpc_app_id
  db_subnet_ids         = module.networking.private_db_subnet_ids
  ec2_security_group_id = module.compute.ec2_security_group_id
  db_password           = var.db_password
}

# Storage Module (S3 + EFS + VPC Endpoint)
module "storage" {
  source = "./modules/storage"

  project_name            = var.project_name
  env                     = var.env
  account_id              = data.aws_caller_identity.current.account_id
  vpc_id                  = module.networking.vpc_app_id
  private_app_subnet_ids  = module.networking.private_app_subnet_ids
  private_route_table_ids = module.networking.private_route_table_ids
  ec2_security_group_id   = module.compute.ec2_security_group_id
}

# Compute Module (EC2 Auto Scaling + ALB)
module "compute" {
  source = "./modules/compute"

  project_name              = var.project_name
  env                       = var.env
  vpc_id                    = module.networking.vpc_app_id
  public_subnet_ids         = module.networking.public_subnet_ids
  private_app_subnet_ids    = module.networking.private_app_subnet_ids
  alb_security_group_id     = module.networking.alb_security_group_id
  bastion_security_group_id = module.networking.bastion_security_group_id
  key_pair_name             = var.key_pair_name
  iam_instance_profile      = module.security.ec2_instance_profile_name
  efs_id                    = module.storage.efs_id
  rds_endpoint              = module.database.rds_endpoint
  db_password               = var.db_password
  redis_endpoint            = module.database.redis_endpoint
  s3_upload_bucket          = module.storage.s3_upload_bucket_name
}

# CDN Module (CloudFront)
module "cdn" {
  source = "./modules/cdn"

  project_name            = var.project_name
  env                     = var.env
  s3_static_bucket_id     = module.storage.s3_static_bucket_id
  s3_static_bucket_arn    = module.storage.s3_static_bucket_arn
  s3_static_bucket_domain = module.storage.s3_static_bucket_domain
  alb_dns_name            = module.compute.alb_dns_name
}

# Serverless Module (Lambda + API Gateway)
module "serverless" {
  source = "./modules/serverless"

  project_name           = var.project_name
  env                    = var.env
  vpc_id                 = module.networking.vpc_app_id
  private_app_subnet_ids = module.networking.private_app_subnet_ids
  ec2_security_group_id  = module.compute.ec2_security_group_id
  lambda_role_arn        = module.security.lambda_role_arn
  valid_api_key          = var.valid_api_key
  db_host                = module.database.rds_endpoint
  db_name                = "sango_db"
  db_user                = "sango_admin"
  db_password            = var.db_password
  s3_upload_bucket       = module.storage.s3_upload_bucket_name
}

# Backup Module (AWS Backup)
module "backup" {
  source = "./modules/backup"

  project_name    = var.project_name
  env             = var.env
  backup_role_arn = module.security.backup_role_arn
  efs_arn         = module.storage.efs_arn
  rds_arn         = module.database.rds_arn
}

# ============================================================================
# S3 Bucket Notification (configured after Lambda is created)
# ============================================================================

resource "aws_s3_bucket_notification" "uploads" {
  bucket = module.storage.s3_upload_bucket_name

  lambda_function {
    lambda_function_arn = module.serverless.lambda_s3_processor_arn
    events              = ["s3:ObjectCreated:Put"]
    filter_prefix       = "venues/"
  }

  depends_on = [
    module.serverless,
    module.storage
  ]
}
