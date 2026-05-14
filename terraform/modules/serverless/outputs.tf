# Outputs for Serverless Module

output "api_gateway_endpoint" {
  description = "API Gateway endpoint URL"
  value       = "${aws_apigatewayv2_api.main.api_endpoint}/prod/ask"
}

output "lambda_bedrock_kb_arn" {
  description = "Bedrock KB Lambda ARN"
  value       = aws_lambda_function.bedrock_kb.arn
}

output "lambda_s3_processor_arn" {
  description = "S3 Processor Lambda ARN"
  value       = aws_lambda_function.s3_processor.arn
}

output "lambda_authorizer_arn" {
  description = "API Authorizer Lambda ARN"
  value       = aws_lambda_function.authorizer.arn
}
