# Variables for Backup Module

variable "project_name" {
  description = "Project name prefix"
  type        = string
}

variable "env" {
  description = "Environment name"
  type        = string
}

variable "backup_role_arn" {
  description = "AWS Backup IAM Role ARN"
  type        = string
}

variable "efs_arn" {
  description = "EFS File System ARN"
  type        = string
}

variable "rds_arn" {
  description = "RDS Instance ARN"
  type        = string
}
