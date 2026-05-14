# Variables for SanGo Infrastructure

variable "region" {
  description = "AWS region for deployment"
  type        = string
  default     = "ap-southeast-1"
}

variable "project_name" {
  description = "Project name prefix for resource naming"
  type        = string
  default     = "sango"
}

variable "env" {
  description = "Environment name (dev, staging, prod)"
  type        = string
  default     = "dev"
}

variable "team_ip_cidr" {
  description = "Your team's public IP for Bastion SSH access (e.g., 1.2.3.4/32)"
  type        = string
}

variable "key_pair_name" {
  description = "Name of existing EC2 Key Pair in AWS account"
  type        = string
}

variable "db_password" {
  description = "Master password for RDS PostgreSQL database"
  type        = string
  sensitive   = true
}

variable "valid_api_key" {
  description = "API key for Lambda Authorizer"
  type        = string
  sensitive   = true
  default     = "sango-secret-key-2026"
}

variable "account_id" {
  description = "AWS Account ID for bucket naming"
  type        = string
}
