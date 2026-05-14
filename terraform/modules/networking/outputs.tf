# Outputs for Networking Module

output "vpc_app_id" {
  description = "VPC-App ID"
  value       = aws_vpc.app.id
}

output "vpc_mgmt_id" {
  description = "VPC-Mgmt ID"
  value       = aws_vpc.mgmt.id
}

output "vpc_peering_id" {
  description = "VPC Peering Connection ID"
  value       = aws_vpc_peering_connection.app_to_mgmt.id
}

output "public_subnet_ids" {
  description = "Public subnet IDs"
  value       = [aws_subnet.public_az_a.id, aws_subnet.public_az_b.id]
}

output "private_app_subnet_ids" {
  description = "Private app subnet IDs"
  value       = [aws_subnet.private_app_az_a.id, aws_subnet.private_app_az_b.id]
}

output "private_db_subnet_ids" {
  description = "Private DB subnet IDs"
  value       = [aws_subnet.private_db_az_a.id, aws_subnet.private_db_az_b.id]
}

output "private_route_table_ids" {
  description = "Private route table IDs for S3 VPC endpoint"
  value = [
    aws_route_table.private_app_az_a.id,
    aws_route_table.private_app_az_b.id,
    aws_route_table.private_db.id
  ]
}

output "alb_security_group_id" {
  description = "ALB Security Group ID"
  value       = aws_security_group.alb.id
}

output "bastion_security_group_id" {
  description = "Bastion Security Group ID"
  value       = aws_security_group.bastion.id
}

output "bastion_public_ip" {
  description = "Bastion Host Public IP"
  value       = aws_instance.bastion.public_ip
}
