# Variables for Networking Module

variable "project_name" {
  description = "Project name prefix"
  type        = string
}

variable "env" {
  description = "Environment name"
  type        = string
}

variable "region" {
  description = "AWS region"
  type        = string
  default     = "ap-southeast-1"
}

variable "team_ip_cidr" {
  description = "Team IP CIDR for Bastion SSH access"
  type        = string
}

variable "key_pair_name" {
  description = "EC2 Key Pair name for Bastion"
  type        = string
}
