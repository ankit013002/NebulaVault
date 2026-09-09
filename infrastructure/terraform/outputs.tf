output "bucket_name" {
  description = "Set this as S3_BUCKET for the file service."
  value       = aws_s3_bucket.drive.id
}

output "bucket_arn" {
  value = aws_s3_bucket.drive.arn
}

output "aws_region" {
  description = "Set this as AWS_REGION for the file service."
  value       = var.aws_region
}

output "file_service_role_arn" {
  description = "Role the file service assumes to presign uploads."
  value       = aws_iam_role.file_service.arn
}

output "kms_key_arn" {
  value = var.use_kms ? aws_kms_key.drive[0].arn : null
}

output "access_key_id" {
  description = "Only produced when create_access_keys is true."
  value       = var.create_access_keys ? aws_iam_access_key.file_service[0].id : null
}

output "secret_access_key" {
  description = <<-EOT
    Only produced when create_access_keys is true. Marked sensitive, but it is
    still written to state in plaintext — keep state in an encrypted backend.
  EOT
  value       = var.create_access_keys ? aws_iam_access_key.file_service[0].secret : null
  sensitive   = true
}
