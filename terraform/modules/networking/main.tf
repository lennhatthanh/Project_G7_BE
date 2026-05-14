# Networking Module - VPC-App, VPC-Mgmt, Peering, Network Firewall

# ============================================================================
# VPC-App (10.0.0.0/16) - Main Application Stack
# ============================================================================

resource "aws_vpc" "app" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "${var.project_name}-vpc-app"
  }
}

# Public Subnets (for ALB, NAT Gateway)
resource "aws_subnet" "public_az_a" {
  vpc_id                  = aws_vpc.app.id
  cidr_block              = "10.0.1.0/24"
  availability_zone       = "${var.region}a"
  map_public_ip_on_launch = true

  tags = {
    Name = "${var.project_name}-public-subnet-az-a"
    Tier = "Presentation"
  }
}

resource "aws_subnet" "public_az_b" {
  vpc_id                  = aws_vpc.app.id
  cidr_block              = "10.0.101.0/24"
  availability_zone       = "${var.region}b"
  map_public_ip_on_launch = true

  tags = {
    Name = "${var.project_name}-public-subnet-az-b"
    Tier = "Presentation"
  }
}

# Private App Subnets (for EC2 Auto Scaling, EFS)
resource "aws_subnet" "private_app_az_a" {
  vpc_id            = aws_vpc.app.id
  cidr_block        = "10.0.2.0/24"
  availability_zone = "${var.region}a"

  tags = {
    Name = "${var.project_name}-private-app-subnet-az-a"
    Tier = "Application"
  }
}

resource "aws_subnet" "private_app_az_b" {
  vpc_id            = aws_vpc.app.id
  cidr_block        = "10.0.102.0/24"
  availability_zone = "${var.region}b"

  tags = {
    Name = "${var.project_name}-private-app-subnet-az-b"
    Tier = "Application"
  }
}

# Private DB Subnets (for RDS, ElastiCache)
resource "aws_subnet" "private_db_az_a" {
  vpc_id            = aws_vpc.app.id
  cidr_block        = "10.0.3.0/24"
  availability_zone = "${var.region}a"

  tags = {
    Name = "${var.project_name}-private-db-subnet-az-a"
    Tier = "Database"
  }
}

resource "aws_subnet" "private_db_az_b" {
  vpc_id            = aws_vpc.app.id
  cidr_block        = "10.0.103.0/24"
  availability_zone = "${var.region}b"

  tags = {
    Name = "${var.project_name}-private-db-subnet-az-b"
    Tier = "Database"
  }
}

# Firewall Subnets (for Network Firewall Endpoints)
resource "aws_subnet" "firewall_az_a" {
  vpc_id            = aws_vpc.app.id
  cidr_block        = "10.0.5.0/28"
  availability_zone = "${var.region}a"

  tags = {
    Name = "${var.project_name}-firewall-subnet-az-a"
  }
}

resource "aws_subnet" "firewall_az_b" {
  vpc_id            = aws_vpc.app.id
  cidr_block        = "10.0.6.0/28"
  availability_zone = "${var.region}b"

  tags = {
    Name = "${var.project_name}-firewall-subnet-az-b"
  }
}

# Internet Gateway for VPC-App
resource "aws_internet_gateway" "app" {
  vpc_id = aws_vpc.app.id

  tags = {
    Name = "${var.project_name}-igw-app"
  }
}

# Elastic IPs for NAT Gateways
resource "aws_eip" "nat_az_a" {
  domain = "vpc"

  tags = {
    Name = "${var.project_name}-nat-eip-az-a"
  }
}

resource "aws_eip" "nat_az_b" {
  domain = "vpc"

  tags = {
    Name = "${var.project_name}-nat-eip-az-b"
  }
}

# NAT Gateways (one per AZ)
resource "aws_nat_gateway" "az_a" {
  allocation_id = aws_eip.nat_az_a.id
  subnet_id     = aws_subnet.public_az_a.id

  tags = {
    Name = "${var.project_name}-nat-az-a"
  }

  depends_on = [aws_internet_gateway.app]
}

resource "aws_nat_gateway" "az_b" {
  allocation_id = aws_eip.nat_az_b.id
  subnet_id     = aws_subnet.public_az_b.id

  tags = {
    Name = "${var.project_name}-nat-az-b"
  }

  depends_on = [aws_internet_gateway.app]
}

# ============================================================================
# Network Firewall (MH2)
# ============================================================================

# Stateful Rule Group - Domain Allowlist
resource "aws_networkfirewall_rule_group" "egress_allowlist" {
  capacity = 100
  name     = "${var.project_name}-egress-allowlist"
  type     = "STATEFUL"

  rule_group {
    stateful_rule_options {
      rule_order = "STRICT_ORDER"
    }

    rules_source {
      rules_source_list {
        generated_rules_type = "ALLOWLIST"
        target_types         = ["HTTP_HOST", "TLS_SNI"]
        targets = [
          ".payos.vn",
          ".amazonaws.com",
          ".amazoncognito.com",
          ".nodesource.com",
          ".npmjs.com",
          ".npmjs.org",
          "nodemailer.com",
          "registry.npmjs.org",
          "rpm.nodesource.com"
        ]
      }
    }
  }

  tags = {
    Name = "${var.project_name}-egress-allowlist"
  }
}

# Firewall Policy
resource "aws_networkfirewall_firewall_policy" "main" {
  name = "${var.project_name}-firewall-policy"

  firewall_policy {
    stateless_default_actions          = ["aws:forward_to_sfe"]
    stateless_fragment_default_actions = ["aws:forward_to_sfe"]
    stateful_default_actions           = ["aws:drop_established"]

    stateful_engine_options {
      rule_order = "STRICT_ORDER"
    }

    stateful_rule_group_reference {
      resource_arn = aws_networkfirewall_rule_group.egress_allowlist.arn
      priority     = 1
    }
  }

  tags = {
    Name = "${var.project_name}-firewall-policy"
  }
}

# CloudWatch Log Groups for Firewall
resource "aws_cloudwatch_log_group" "firewall_alert" {
  name              = "/aws/network-firewall/${var.project_name}/alert"
  retention_in_days = 7
}

resource "aws_cloudwatch_log_group" "firewall_flow" {
  name              = "/aws/network-firewall/${var.project_name}/flow"
  retention_in_days = 7
}

# Network Firewall
resource "aws_networkfirewall_firewall" "main" {
  name                = "${var.project_name}-network-firewall"
  firewall_policy_arn = aws_networkfirewall_firewall_policy.main.arn
  vpc_id              = aws_vpc.app.id

  subnet_mapping {
    subnet_id = aws_subnet.firewall_az_a.id
  }

  subnet_mapping {
    subnet_id = aws_subnet.firewall_az_b.id
  }

  tags = {
    Name = "${var.project_name}-network-firewall"
  }
}

# Firewall Logging Configuration
resource "aws_networkfirewall_logging_configuration" "main" {
  firewall_arn = aws_networkfirewall_firewall.main.arn

  logging_configuration {
    log_destination_config {
      log_destination = {
        logGroup = aws_cloudwatch_log_group.firewall_alert.name
      }
      log_destination_type = "CloudWatchLogs"
      log_type             = "ALERT"
    }

    log_destination_config {
      log_destination = {
        logGroup = aws_cloudwatch_log_group.firewall_flow.name
      }
      log_destination_type = "CloudWatchLogs"
      log_type             = "FLOW"
    }
  }
}

# ============================================================================
# Route Tables - VPC-App
# ============================================================================

# Public Route Table
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.app.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.app.id
  }

  tags = {
    Name = "${var.project_name}-public-rt"
  }
}

resource "aws_route_table_association" "public_az_a" {
  subnet_id      = aws_subnet.public_az_a.id
  route_table_id = aws_route_table.public.id
}

resource "aws_route_table_association" "public_az_b" {
  subnet_id      = aws_subnet.public_az_b.id
  route_table_id = aws_route_table.public.id
}

# Private App Route Tables (one per AZ, route to Firewall Endpoint)
resource "aws_route_table" "private_app_az_a" {
  vpc_id = aws_vpc.app.id

  tags = {
    Name = "${var.project_name}-private-app-rt-az-a"
  }
}

resource "aws_route_table" "private_app_az_b" {
  vpc_id = aws_vpc.app.id

  tags = {
    Name = "${var.project_name}-private-app-rt-az-b"
  }
}

# Routes to Firewall Endpoints (added after firewall is ready)
resource "aws_route" "private_app_az_a_to_firewall" {
  route_table_id         = aws_route_table.private_app_az_a.id
  destination_cidr_block = "0.0.0.0/0"
  vpc_endpoint_id        = local.firewall_endpoint_az_a

  depends_on = [aws_networkfirewall_firewall.main]
}

resource "aws_route" "private_app_az_b_to_firewall" {
  route_table_id         = aws_route_table.private_app_az_b.id
  destination_cidr_block = "0.0.0.0/0"
  vpc_endpoint_id        = local.firewall_endpoint_az_b

  depends_on = [aws_networkfirewall_firewall.main]
}

resource "aws_route_table_association" "private_app_az_a" {
  subnet_id      = aws_subnet.private_app_az_a.id
  route_table_id = aws_route_table.private_app_az_a.id
}

resource "aws_route_table_association" "private_app_az_b" {
  subnet_id      = aws_subnet.private_app_az_b.id
  route_table_id = aws_route_table.private_app_az_b.id
}

# Firewall Subnet Route Tables (route to NAT Gateway in same AZ)
resource "aws_route_table" "firewall_az_a" {
  vpc_id = aws_vpc.app.id

  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.az_a.id
  }

  tags = {
    Name = "${var.project_name}-firewall-rt-az-a"
  }

  depends_on = [aws_networkfirewall_firewall.main]
}

resource "aws_route_table" "firewall_az_b" {
  vpc_id = aws_vpc.app.id

  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.az_b.id
  }

  tags = {
    Name = "${var.project_name}-firewall-rt-az-b"
  }

  depends_on = [aws_networkfirewall_firewall.main]
}

resource "aws_route_table_association" "firewall_az_a" {
  subnet_id      = aws_subnet.firewall_az_a.id
  route_table_id = aws_route_table.firewall_az_a.id
}

resource "aws_route_table_association" "firewall_az_b" {
  subnet_id      = aws_subnet.firewall_az_b.id
  route_table_id = aws_route_table.firewall_az_b.id
}

# Private DB Route Tables (same as private app)
resource "aws_route_table" "private_db" {
  vpc_id = aws_vpc.app.id

  tags = {
    Name = "${var.project_name}-private-db-rt"
  }
}

resource "aws_route_table_association" "private_db_az_a" {
  subnet_id      = aws_subnet.private_db_az_a.id
  route_table_id = aws_route_table.private_db.id
}

resource "aws_route_table_association" "private_db_az_b" {
  subnet_id      = aws_subnet.private_db_az_b.id
  route_table_id = aws_route_table.private_db.id
}

# ============================================================================
# VPC Flow Logs - VPC-App
# ============================================================================

resource "aws_cloudwatch_log_group" "vpc_app_flow_logs" {
  name              = "/aws/vpc/flowlogs/${var.project_name}-app-vpc"
  retention_in_days = 7
}

resource "aws_iam_role" "vpc_flow_logs" {
  name = "${var.project_name}-vpc-flow-logs-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Service = "vpc-flow-logs.amazonaws.com"
        }
        Action = "sts:AssumeRole"
      }
    ]
  })
}

resource "aws_iam_role_policy" "vpc_flow_logs" {
  name = "${var.project_name}-vpc-flow-logs-policy"
  role = aws_iam_role.vpc_flow_logs.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents",
          "logs:DescribeLogGroups",
          "logs:DescribeLogStreams"
        ]
        Resource = "*"
      }
    ]
  })
}

resource "aws_flow_log" "vpc_app" {
  vpc_id          = aws_vpc.app.id
  traffic_type    = "ALL"
  iam_role_arn    = aws_iam_role.vpc_flow_logs.arn
  log_destination = aws_cloudwatch_log_group.vpc_app_flow_logs.arn

  tags = {
    Name = "${var.project_name}-vpc-app-flow-logs"
  }
}

# ============================================================================
# VPC-Mgmt (10.1.0.0/16) - Management Plane
# ============================================================================

resource "aws_vpc" "mgmt" {
  cidr_block           = "10.1.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "${var.project_name}-vpc-mgmt"
  }
}

# Public Subnet for Bastion
resource "aws_subnet" "mgmt_public" {
  vpc_id                  = aws_vpc.mgmt.id
  cidr_block              = "10.1.1.0/24"
  availability_zone       = "${var.region}a"
  map_public_ip_on_launch = true

  tags = {
    Name = "${var.project_name}-mgmt-public-subnet"
  }
}

# Internet Gateway for VPC-Mgmt
resource "aws_internet_gateway" "mgmt" {
  vpc_id = aws_vpc.mgmt.id

  tags = {
    Name = "${var.project_name}-igw-mgmt"
  }
}

# Route Table for VPC-Mgmt
resource "aws_route_table" "mgmt" {
  vpc_id = aws_vpc.mgmt.id

  tags = {
    Name = "${var.project_name}-mgmt-rt"
  }
}

resource "aws_route" "mgmt_default" {
  route_table_id         = aws_route_table.mgmt.id
  destination_cidr_block = "0.0.0.0/0"
  gateway_id             = aws_internet_gateway.mgmt.id
}

resource "aws_route_table_association" "mgmt_public" {
  subnet_id      = aws_subnet.mgmt_public.id
  route_table_id = aws_route_table.mgmt.id
}

# VPC Flow Logs - VPC-Mgmt
resource "aws_cloudwatch_log_group" "vpc_mgmt_flow_logs" {
  name              = "/aws/vpc/flowlogs/${var.project_name}-mgmt-vpc"
  retention_in_days = 7
}

resource "aws_flow_log" "vpc_mgmt" {
  vpc_id          = aws_vpc.mgmt.id
  traffic_type    = "ALL"
  iam_role_arn    = aws_iam_role.vpc_flow_logs.arn
  log_destination = aws_cloudwatch_log_group.vpc_mgmt_flow_logs.arn

  tags = {
    Name = "${var.project_name}-vpc-mgmt-flow-logs"
  }
}

# ============================================================================
# VPC Peering (MH1)
# ============================================================================

resource "aws_vpc_peering_connection" "app_to_mgmt" {
  vpc_id      = aws_vpc.app.id
  peer_vpc_id = aws_vpc.mgmt.id
  auto_accept = true

  tags = {
    Name = "${var.project_name}-app-mgmt-peering"
  }
}

# Enable DNS resolution for peering
resource "aws_vpc_peering_connection_options" "app_to_mgmt" {
  vpc_peering_connection_id = aws_vpc_peering_connection.app_to_mgmt.id

  accepter {
    allow_remote_vpc_dns_resolution = true
  }

  requester {
    allow_remote_vpc_dns_resolution = true
  }
}

# Add routes for peering in VPC-App private subnets
resource "aws_route" "app_to_mgmt_az_a" {
  route_table_id            = aws_route_table.private_app_az_a.id
  destination_cidr_block    = "10.1.0.0/16"
  vpc_peering_connection_id = aws_vpc_peering_connection.app_to_mgmt.id
}

resource "aws_route" "app_to_mgmt_az_b" {
  route_table_id            = aws_route_table.private_app_az_b.id
  destination_cidr_block    = "10.1.0.0/16"
  vpc_peering_connection_id = aws_vpc_peering_connection.app_to_mgmt.id
}

# Add route for peering in VPC-Mgmt
resource "aws_route" "mgmt_to_app" {
  route_table_id            = aws_route_table.mgmt.id
  destination_cidr_block    = "10.0.0.0/16"
  vpc_peering_connection_id = aws_vpc_peering_connection.app_to_mgmt.id
}

# ============================================================================
# Security Groups
# ============================================================================

# ALB Security Group
resource "aws_security_group" "alb" {
  name        = "${var.project_name}-alb-sg"
  description = "Security group for Application Load Balancer"
  vpc_id      = aws_vpc.app.id

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Allow HTTP from internet"
  }

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Allow HTTPS from internet"
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Allow all outbound"
  }

  tags = {
    Name = "${var.project_name}-alb-sg"
  }
}

# Bastion Security Group
resource "aws_security_group" "bastion" {
  name        = "${var.project_name}-bastion-sg"
  description = "Security group for Bastion Host"
  vpc_id      = aws_vpc.mgmt.id

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = [var.team_ip_cidr]
    description = "Allow SSH from team IP"
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Allow all outbound"
  }

  tags = {
    Name = "${var.project_name}-bastion-sg"
  }
}

# ============================================================================
# Bastion Host
# ============================================================================

data "aws_ami" "amazon_linux_2023" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["al2023-ami-*-x86_64"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

resource "aws_instance" "bastion" {
  ami                    = data.aws_ami.amazon_linux_2023.id
  instance_type          = "t3.micro"
  subnet_id              = aws_subnet.mgmt_public.id
  vpc_security_group_ids = [aws_security_group.bastion.id]
  key_name               = var.key_pair_name

  associate_public_ip_address = true

  user_data = <<-EOF
              #!/bin/bash
              yum update -y
              yum install -y postgresql15
              EOF

  tags = {
    Name = "${var.project_name}-bastion"
  }
}

# ============================================================================
# Local values for Firewall Endpoints
# ============================================================================

locals {
  # Extract firewall endpoint IDs per AZ
  firewall_sync_states = aws_networkfirewall_firewall.main.firewall_status[0].sync_states

  firewall_endpoint_az_a = [
    for state in local.firewall_sync_states :
    state.attachment[0].endpoint_id
    if state.availability_zone == "${var.region}a"
  ][0]

  firewall_endpoint_az_b = [
    for state in local.firewall_sync_states :
    state.attachment[0].endpoint_id
    if state.availability_zone == "${var.region}b"
  ][0]
}
