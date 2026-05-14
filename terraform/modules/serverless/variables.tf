# Variables for Serverless Module

variable "project_name" {
  description = "Project name prefix"
  type        = string
}

variable "env" {
  description = "Environment name"
  type        = string
}

variable "vpc_id" {
  description = "VPC ID"
  type        = string
}

variable "private_app_subnet_ids" {
  description = "Private app subnet IDs for Lambda VPC config"
  type        = list(string)
}

variable "ec2_security_group_id" {
  description = "EC2 Security Group ID for Lambda"
  type        = string
}

variable "lambda_role_arn" {
  description = "Lambda IAM Role ARN"
  type        = string
}

variable "valid_api_key" {
  description = "Valid API key for Lambda Authorizer"
  type        = string
  sensitive   = true
}

variable "db_host" {
  description = "RDS endpoint"
  type        = string
}

variable "db_name" {
  description = "Database name"
  type        = string
}

variable "db_user" {
  description = "Database user"
  type        = string
}

variable "db_password" {
  description = "Database password"
  type        = string
  sensitive   = true
}

variable "s3_upload_bucket" {
  description = "S3 upload bucket name"
  type        = string
}
