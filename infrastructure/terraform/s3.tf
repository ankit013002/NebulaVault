data "aws_caller_identity" "current" {}

locals {
  bucket_name = var.bucket_name != "" ? var.bucket_name : (
    "benzene-drive-${var.environment}-${data.aws_caller_identity.current.account_id}"
  )

  # Every object the service writes lives under this prefix. Scoping the IAM
  # policy to it means a bug in key construction cannot reach anything else
  # that might later share the bucket.
  object_prefix = "users/*"
}

resource "aws_s3_bucket" "drive" {
  bucket = local.bucket_name
}

# Objects are reachable only through presigned URLs, never by public URL.
resource "aws_s3_bucket_public_access_block" "drive" {
  bucket = aws_s3_bucket.drive.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# Disables ACLs entirely, so the bucket owner is the sole authority on access.
resource "aws_s3_bucket_ownership_controls" "drive" {
  bucket = aws_s3_bucket.drive.id

  rule {
    object_ownership = "BucketOwnerEnforced"
  }
}

# The app keeps its own version history in MongoDB; bucket versioning is the
# safety net underneath it, protecting against an accidental overwrite or
# delete that the application layer would not catch.
resource "aws_s3_bucket_versioning" "drive" {
  bucket = aws_s3_bucket.drive.id

  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_kms_key" "drive" {
  count = var.use_kms ? 1 : 0

  description             = "Encrypts objects in the Benzene drive bucket"
  enable_key_rotation     = true
  deletion_window_in_days = 30
}

resource "aws_kms_alias" "drive" {
  count = var.use_kms ? 1 : 0

  name          = "alias/benzene-drive-${var.environment}"
  target_key_id = aws_kms_key.drive[0].key_id
}

resource "aws_s3_bucket_server_side_encryption_configuration" "drive" {
  bucket = aws_s3_bucket.drive.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm     = var.use_kms ? "aws:kms" : "AES256"
      kms_master_key_id = var.use_kms ? aws_kms_key.drive[0].arn : null
    }
    # Lets S3 use one data key per request batch rather than one per object,
    # which is what keeps KMS costs sane at volume.
    bucket_key_enabled = var.use_kms
  }
}

# The browser PUTs bytes to S3 directly, so S3 itself must answer the preflight.
resource "aws_s3_bucket_cors_configuration" "drive" {
  bucket = aws_s3_bucket.drive.id

  cors_rule {
    allowed_methods = ["PUT", "GET", "HEAD"]
    allowed_origins = var.cors_allowed_origins
    allowed_headers = ["*"]
    # ETag is read back to confirm what actually landed.
    expose_headers  = ["ETag"]
    max_age_seconds = 3000
  }
}

resource "aws_s3_bucket_lifecycle_configuration" "drive" {
  bucket = aws_s3_bucket.drive.id

  depends_on = [aws_s3_bucket_versioning.drive]

  rule {
    id     = "abort-incomplete-multipart-uploads"
    status = "Enabled"

    filter {}

    abort_incomplete_multipart_upload {
      days_after_initiation = var.abort_incomplete_upload_days
    }
  }

  rule {
    id     = "age-out-noncurrent-versions"
    status = "Enabled"

    filter {}

    noncurrent_version_transition {
      noncurrent_days = var.noncurrent_version_ia_transition_days
      storage_class   = "STANDARD_IA"
    }

    noncurrent_version_expiration {
      noncurrent_days = var.noncurrent_version_retention_days
    }
  }
}

# Refuses any request that is not already using TLS. Presigned URLs are
# bearer credentials in a query string, so plaintext transport would leak them.
resource "aws_s3_bucket_policy" "drive" {
  bucket = aws_s3_bucket.drive.id

  depends_on = [aws_s3_bucket_public_access_block.drive]

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "DenyInsecureTransport"
        Effect    = "Deny"
        Principal = "*"
        Action    = "s3:*"
        Resource = [
          aws_s3_bucket.drive.arn,
          "${aws_s3_bucket.drive.arn}/*",
        ]
        Condition = {
          Bool = { "aws:SecureTransport" = "false" }
        }
      },
    ]
  })
}
