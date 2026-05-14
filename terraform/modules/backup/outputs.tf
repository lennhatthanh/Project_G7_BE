# Outputs for Backup Module

output "backup_vault_name" {
  description = "Backup Vault Name"
  value       = aws_backup_vault.main.name
}

output "backup_plan_id" {
  description = "Backup Plan ID"
  value       = aws_backup_plan.main.id
}
