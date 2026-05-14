# Outputs for Storage Module

output "s3_static_bucket_id" {
  description = "S3 Static Assets Bucket ID"
  value       = aws_s3_bucket.static_assets.id
}

output "s3_static_bucket_arn" {
  description = "S3 Static Assets Bucket ARN"
  value       = aws_s3_bucket.static_assets.arn
}

output "s3_static_bucket_domain" {
  description = "S3 Static Assets Bucket Domain Name"
  value       = aws_s3_bucket.static_assets.bucket_regional_domain_name
}

output "s3_upload_bucket_name" {
  description = "S3 Upload Bucket Name"
  value       = aws_s3_bucket.uploads.id
}

output "s3_upload_bucket_arn" {
  description = "S3 Upload Bucket ARN"
  value       = aws_s3_bucket.uploads.arn
}

output "efs_id" {
  description = "EFS File System ID"
  value       = aws_efs_file_system.main.id
}

output "efs_arn" {
  description = "EFS File System ARN"
  value       = aws_efs_file_system.main.arn
}
