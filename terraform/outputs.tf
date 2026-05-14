# Outputs for SanGo Infrastructure

output "alb_dns_name" {
  description = "ALB DNS name for backend entry point"
  value       = module.compute.alb_dns_name
}

output "cloudfront_domain_fe" {
  description = "CloudFront domain for frontend"
  value       = module.cdn.cloudfront_domain_fe
}

output "api_gateway_endpoint" {
  description = "API Gateway endpoint for Bedrock KB"
  value       = module.serverless.api_gateway_endpoint
}

output "rds_endpoint" {
  description = "RDS PostgreSQL endpoint"
  value       = module.database.rds_endpoint
}

output "elasticache_endpoint" {
  description = "ElastiCache Redis endpoint"
  value       = module.database.redis_endpoint
}

output "efs_id" {
  description = "EFS file system ID"
  value       = module.storage.efs_id
}

output "bastion_public_ip" {
  description = "Bastion host public IP for SSH jump"
  value       = module.networking.bastion_public_ip
}

output "s3_upload_bucket" {
  description = "S3 bucket name for uploads"
  value       = module.storage.s3_upload_bucket_name
}

output "vpc_app_id" {
  description = "VPC-App ID"
  value       = module.networking.vpc_app_id
}

output "vpc_mgmt_id" {
  description = "VPC-Mgmt ID"
  value       = module.networking.vpc_mgmt_id
}

output "vpc_peering_id" {
  description = "VPC Peering Connection ID"
  value       = module.networking.vpc_peering_id
}
