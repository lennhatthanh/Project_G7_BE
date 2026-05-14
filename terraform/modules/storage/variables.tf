# Variables for Storage Module

variable "project_name" {
  description = "Project name prefix"
  type        = string
}

variable "env" {
  description = "Environment name"
  type        = string
}

variable "account_id" {
  description = "AWS Account ID"
  type        = string
}

variable "vpc_id" {
  description = "VPC ID"
  type        = string
}

variable "private_app_subnet_ids" {
  description = "Private app subnet IDs for EFS mount targets"
  type        = list(string)
}

variable "private_route_table_ids" {
  description = "Private route table IDs for S3 VPC endpoint"
  type        = list(string)
}

variable "ec2_security_group_id" {
  description = "EC2 Security Group ID for EFS access"
  type        = string
}
