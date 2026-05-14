# Variables for CDN Module

variable "project_name" {
  description = "Project name prefix"
  type        = string
}

variable "env" {
  description = "Environment name"
  type        = string
}

variable "s3_static_bucket_id" {
  description = "S3 Static Assets Bucket ID"
  type        = string
}

variable "s3_static_bucket_arn" {
  description = "S3 Static Assets Bucket ARN"
  type        = string
}

variable "s3_static_bucket_domain" {
  description = "S3 Static Assets Bucket Domain Name"
  type        = string
}

variable "alb_dns_name" {
  description = "ALB DNS Name"
  type        = string
}
