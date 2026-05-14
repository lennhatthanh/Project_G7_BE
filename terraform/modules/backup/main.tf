# Backup Module - AWS Backup Plan

# ============================================================================
# AWS Backup Vault
# ============================================================================

resource "aws_backup_vault" "main" {
  name = "${var.project_name}-backup-vault"

  tags = {
    Name = "${var.project_name}-backup-vault"
  }
}

data "aws_region" "current" {}

data "aws_caller_identity" "current" {}

# ============================================================================
# AWS Backup Plan
# ============================================================================

resource "aws_backup_plan" "main" {
  name = "${var.project_name}-daily-backup"

  rule {
    rule_name         = "DailyBackup"
    target_vault_name = aws_backup_vault.main.name
    schedule          = "cron(0 2 * * ? *)"

    start_window      = 60
    completion_window = 180

    lifecycle {
      delete_after = 7
    }
  }

  tags = {
    Name = "${var.project_name}-daily-backup"
  }
}

# ============================================================================
# Backup Selection (Tag-based)
# ============================================================================

resource "aws_backup_selection" "main" {
  name         = "${var.project_name}-resources"
  plan_id      = aws_backup_plan.main.id
  iam_role_arn = var.backup_role_arn

  selection_tag {
    type  = "STRINGEQUALS"
    key   = "backup"
    value = "true"
  }

  resources = [
    var.efs_arn,
    var.rds_arn
  ]
}

resource "aws_backup_selection" "ebs_tagged" {
  name         = "${var.project_name}-tagged-ebs"
  plan_id      = aws_backup_plan.main.id
  iam_role_arn = var.backup_role_arn

  resources = [
    "arn:aws:ec2:${data.aws_region.current.name}:${data.aws_caller_identity.current.account_id}:volume/*"
  ]

  selection_tag {
    type  = "STRINGEQUALS"
    key   = "backup"
    value = "true"
  }
}
