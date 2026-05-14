# Outputs for Security Module

output "ec2_role_arn" {
  description = "EC2 IAM Role ARN"
  value       = aws_iam_role.ec2.arn
}

output "ec2_instance_profile_name" {
  description = "EC2 Instance Profile Name"
  value       = aws_iam_instance_profile.ec2.name
}

output "lambda_role_arn" {
  description = "Lambda IAM Role ARN"
  value       = aws_iam_role.lambda.arn
}

output "backup_role_arn" {
  description = "AWS Backup IAM Role ARN"
  value       = aws_iam_role.backup.arn
}

output "db_password_secret_arn" {
  description = "DB Password Secret ARN"
  value       = aws_secretsmanager_secret.db_password.arn
}

output "api_key_secret_arn" {
  description = "API Key Secret ARN"
  value       = aws_secretsmanager_secret.api_key.arn
}
