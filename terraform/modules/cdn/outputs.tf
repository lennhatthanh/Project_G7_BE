# Outputs for CDN Module

output "cloudfront_domain_fe" {
  description = "CloudFront domain for frontend"
  value       = aws_cloudfront_distribution.frontend.domain_name
}

output "cloudfront_domain_be" {
  description = "CloudFront domain for backend"
  value       = aws_cloudfront_distribution.backend.domain_name
}

output "cloudfront_distribution_id_fe" {
  description = "CloudFront distribution ID for frontend"
  value       = aws_cloudfront_distribution.frontend.id
}

output "cloudfront_distribution_id_be" {
  description = "CloudFront distribution ID for backend"
  value       = aws_cloudfront_distribution.backend.id
}
