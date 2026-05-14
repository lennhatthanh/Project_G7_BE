# Serverless Module - Lambda Functions + API Gateway

# ============================================================================
# Lambda Function - Bedrock KB (MH4)
# ============================================================================

# Placeholder Lambda code for Bedrock KB
data "archive_file" "bedrock_kb" {
  type        = "zip"
  output_path = "${path.module}/lambda_bedrock_kb.zip"

  source {
    content  = <<-EOF
      // Placeholder for Bedrock KB Lambda
      // Real implementation should be deployed separately
      exports.handler = async (event) => {
        console.log('Event:', JSON.stringify(event));
        return {
          statusCode: 200,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            answer: 'Bedrock KB integration - deploy real code separately' 
          })
        };
      };
    EOF
    filename = "index.js"
  }
}

resource "aws_lambda_function" "bedrock_kb" {
  filename         = data.archive_file.bedrock_kb.output_path
  function_name    = "${var.project_name}-bedrock-kb-function"
  role             = var.lambda_role_arn
  handler          = "index.handler"
  source_code_hash = data.archive_file.bedrock_kb.output_base64sha256
  runtime          = "nodejs20.x"
  timeout          = 30
  memory_size      = 512

  vpc_config {
    subnet_ids         = var.private_app_subnet_ids
    security_group_ids = [var.ec2_security_group_id]
  }

  environment {
    variables = {
      BEDROCK_KB_ID    = "REPLACE_WITH_ACTUAL_KB_ID"
      BEDROCK_MODEL_ID = "anthropic.claude-v2"
    }
  }

  tags = {
    Name = "${var.project_name}-bedrock-kb-function"
  }
}

resource "aws_cloudwatch_log_group" "bedrock_kb" {
  name              = "/aws/lambda/${aws_lambda_function.bedrock_kb.function_name}"
  retention_in_days = 7
}

# ============================================================================
# Lambda Authorizer (MH4)
# ============================================================================

data "archive_file" "authorizer" {
  type        = "zip"
  output_path = "${path.module}/lambda_authorizer.zip"

  source {
    content  = <<-EOF
      import os

      VALID_API_KEY = os.environ.get('VALID_API_KEY', 'sango-secret-key-2026')

      def lambda_handler(event, context):
          headers = event.get('headers', {})
          api_key = headers.get('x-api-key', '') or headers.get('X-Api-Key', '')
          
          if api_key == VALID_API_KEY:
              return {
                  "isAuthorized": True,
                  "context": {"userId": "authenticated"}
              }
          
          return {"isAuthorized": False}
    EOF
    filename = "lambda_authorizer.py"
  }
}

resource "aws_lambda_function" "authorizer" {
  filename         = data.archive_file.authorizer.output_path
  function_name    = "${var.project_name}-api-authorizer"
  role             = var.lambda_role_arn
  handler          = "lambda_authorizer.lambda_handler"
  source_code_hash = data.archive_file.authorizer.output_base64sha256
  runtime          = "python3.12"
  timeout          = 10
  memory_size      = 128

  environment {
    variables = {
      VALID_API_KEY = var.valid_api_key
    }
  }

  tags = {
    Name = "${var.project_name}-api-authorizer"
  }
}

resource "aws_cloudwatch_log_group" "authorizer" {
  name              = "/aws/lambda/${aws_lambda_function.authorizer.function_name}"
  retention_in_days = 7
}

# ============================================================================
# Lambda Function - S3 Venue Image Processor (MH5)
# ============================================================================

data "archive_file" "s3_processor" {
  type        = "zip"
  output_path = "${path.module}/lambda_s3_processor.zip"

  source {
    content  = <<-EOF
      import boto3
      import os
      import json
      from datetime import datetime

      def lambda_handler(event, context):
          """
          Trigger: S3 PutObject on prefix venues/
          Action: Extract metadata and insert into RDS
          """
          
          for record in event['Records']:
              bucket = record['s3']['bucket']['name']
              key = record['s3']['object']['key']
              size = record['s3']['object']['size']
              
              # Extract venue_id from key path: venues/{venue_id}/filename.jpg
              parts = key.split('/')
              venue_id = parts[1] if len(parts) >= 2 else 'unknown'
              filename = parts[-1]
              
              # Build S3 URL
              s3_url = f"https://{bucket}.s3.amazonaws.com/{key}"
              
              print(f"Processing: venue_id={venue_id}, file={filename}, size={size}B")
              
              # TODO: Connect to RDS and insert metadata
              # This requires psycopg2 layer and actual DB connection
              # For now, just log the event
              
              print(f"SUCCESS: Would save metadata for venue_id={venue_id}")
          
          return {"statusCode": 200, "body": "Processed"}
    EOF
    filename = "s3_processor.py"
  }
}

resource "aws_lambda_function" "s3_processor" {
  filename         = data.archive_file.s3_processor.output_path
  function_name    = "${var.project_name}-s3-venue-image-processor"
  role             = var.lambda_role_arn
  handler          = "s3_processor.lambda_handler"
  source_code_hash = data.archive_file.s3_processor.output_base64sha256
  runtime          = "python3.12"
  timeout          = 30
  memory_size      = 256

  vpc_config {
    subnet_ids         = var.private_app_subnet_ids
    security_group_ids = [var.ec2_security_group_id]
  }

  environment {
    variables = {
      DB_HOST     = var.db_host
      DB_NAME     = var.db_name
      DB_USER     = var.db_user
      DB_PASSWORD = var.db_password
      DB_PORT     = "5432"
    }
  }

  tags = {
    Name = "${var.project_name}-s3-venue-image-processor"
  }
}

resource "aws_cloudwatch_log_group" "s3_processor" {
  name              = "/aws/lambda/${aws_lambda_function.s3_processor.function_name}"
  retention_in_days = 7
}

# Lambda permission for S3 to invoke
resource "aws_lambda_permission" "s3_processor" {
  statement_id  = "AllowS3Invoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.s3_processor.function_name
  principal     = "s3.amazonaws.com"
  source_arn    = "arn:aws:s3:::${var.s3_upload_bucket}"
}

# ============================================================================
# API Gateway HTTP API (MH4)
# ============================================================================

resource "aws_apigatewayv2_api" "main" {
  name          = "${var.project_name}-bedrock-api"
  protocol_type = "HTTP"

  cors_configuration {
    allow_origins = ["*"]
    allow_methods = ["GET", "POST"]
    allow_headers = ["*"]
  }

  tags = {
    Name = "${var.project_name}-bedrock-api"
  }
}

# Integration with Bedrock KB Lambda
resource "aws_apigatewayv2_integration" "bedrock_kb" {
  api_id           = aws_apigatewayv2_api.main.id
  integration_type = "AWS_PROXY"
  integration_uri  = aws_lambda_function.bedrock_kb.invoke_arn

  payload_format_version = "2.0"
}

# Authorizer
resource "aws_apigatewayv2_authorizer" "main" {
  api_id           = aws_apigatewayv2_api.main.id
  authorizer_type  = "REQUEST"
  name             = "${var.project_name}-key-authorizer"
  authorizer_uri   = aws_lambda_function.authorizer.invoke_arn

  authorizer_payload_format_version = "2.0"
  authorizer_result_ttl_in_seconds  = 0
  enable_simple_responses           = true
}

# Route with Authorizer
resource "aws_apigatewayv2_route" "ask" {
  api_id             = aws_apigatewayv2_api.main.id
  route_key          = "POST /ask"
  target             = "integrations/${aws_apigatewayv2_integration.bedrock_kb.id}"
  authorization_type = "CUSTOM"
  authorizer_id      = aws_apigatewayv2_authorizer.main.id
}

# Stage with Throttling
resource "aws_apigatewayv2_stage" "prod" {
  api_id      = aws_apigatewayv2_api.main.id
  name        = "prod"
  auto_deploy = true

  default_route_settings {
    throttling_burst_limit = 10
    throttling_rate_limit  = 5
  }

  tags = {
    Name = "${var.project_name}-api-stage-prod"
  }
}

# Lambda permissions for API Gateway
resource "aws_lambda_permission" "bedrock_kb_apigw" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.bedrock_kb.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.main.execution_arn}/*/*"
}

resource "aws_lambda_permission" "authorizer_apigw" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.authorizer.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.main.execution_arn}/*/*"
}
