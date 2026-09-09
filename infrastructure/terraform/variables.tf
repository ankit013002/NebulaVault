variable "aws_region" {
  description = "Region the drive bucket lives in."
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Deployment environment; part of the bucket name and all tags."
  type        = string
  default     = "dev"

  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "environment must be one of: dev, staging, prod."
  }
}

variable "bucket_name" {
  description = <<-EOT
    Globally unique name for the drive bucket. Leave empty to derive one from
    the project, environment and account id, which avoids the global-namespace
    collisions a fixed name invites.
  EOT
  type        = string
  default     = ""
}

variable "cors_allowed_origins" {
  description = <<-EOT
    Origins permitted to PUT directly to S3. The browser uploads straight to
    the bucket, so the app's own origin must be listed here or every upload
    fails preflight. Never "*": that would let any site upload using a
    presigned URL leaked from this one.
  EOT
  type        = list(string)
  default     = ["http://localhost:3000"]

  validation {
    condition     = !contains(var.cors_allowed_origins, "*")
    error_message = "cors_allowed_origins must not contain '*'."
  }
}

variable "noncurrent_version_retention_days" {
  description = "Days an older file version is kept before deletion."
  type        = number
  default     = 365
}

variable "noncurrent_version_ia_transition_days" {
  description = "Days before an older version moves to STANDARD_IA."
  type        = number
  default     = 30
}

variable "abort_incomplete_upload_days" {
  description = <<-EOT
    Days before an unfinished multipart upload is aborted. Without this,
    abandoned parts accrue storage charges invisibly — they do not appear in
    the object listing.
  EOT
  type        = number
  default     = 7
}

variable "use_kms" {
  description = <<-EOT
    Encrypt with a customer-managed KMS key instead of SSE-S3. Gives auditable
    per-request key usage, at the cost of KMS charges on every operation.
  EOT
  type        = bool
  default     = false
}

variable "service_principal_arns" {
  description = <<-EOT
    IAM principals allowed to assume the file service role — an EC2 instance
    profile, an ECS task role, or a developer role. Empty means the role is
    created but assumable by nobody, which is the safe default.
  EOT
  type        = list(string)
  default     = []
}

variable "create_access_keys" {
  description = <<-EOT
    Create a long-lived IAM user with access keys. Off by default: static keys
    are the credential most often leaked. Prefer the role above wherever the
    workload can assume one.
  EOT
  type        = bool
  default     = false
}
