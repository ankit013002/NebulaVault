# Exactly the actions the file service performs: presign PUT/GET, confirm an
# object landed (HeadObject is covered by GetObject), and purge on delete.
# No ListBucket — the service reads its listing from MongoDB, never from S3.
data "aws_iam_policy_document" "drive_access" {
  statement {
    sid    = "ReadWriteDriveObjects"
    effect = "Allow"

    actions = [
      "s3:GetObject",
      "s3:PutObject",
      "s3:DeleteObject",
    ]

    resources = ["${aws_s3_bucket.drive.arn}/${local.object_prefix}"]
  }

  # Needed to abort and clean up multipart uploads of large files.
  statement {
    sid    = "ManageMultipartUploads"
    effect = "Allow"

    actions = [
      "s3:AbortMultipartUpload",
      "s3:ListMultipartUploadParts",
    ]

    resources = ["${aws_s3_bucket.drive.arn}/${local.object_prefix}"]
  }

  dynamic "statement" {
    for_each = var.use_kms ? [1] : []

    content {
      sid    = "UseDriveKey"
      effect = "Allow"

      actions = [
        "kms:Decrypt",
        "kms:GenerateDataKey",
      ]

      resources = [aws_kms_key.drive[0].arn]
    }
  }
}

resource "aws_iam_policy" "drive_access" {
  name        = "benzene-drive-access-${var.environment}"
  description = "Least-privilege access to the Benzene drive bucket"
  policy      = data.aws_iam_policy_document.drive_access.json
}

data "aws_iam_policy_document" "assume_role" {
  # With no trusted principals the document has no statements, so the role
  # exists but nobody can assume it.
  dynamic "statement" {
    for_each = length(var.service_principal_arns) > 0 ? [1] : []

    content {
      effect  = "Allow"
      actions = ["sts:AssumeRole"]

      principals {
        type        = "AWS"
        identifiers = var.service_principal_arns
      }
    }
  }
}

resource "aws_iam_role" "file_service" {
  name               = "benzene-file-service-${var.environment}"
  description        = "Assumed by the file service to presign drive uploads"
  assume_role_policy = data.aws_iam_policy_document.assume_role.json
}

resource "aws_iam_role_policy_attachment" "file_service" {
  role       = aws_iam_role.file_service.name
  policy_arn = aws_iam_policy.drive_access.arn
}

# Escape hatch for workloads that cannot assume a role — local development
# against real S3, for instance. Off unless explicitly requested.
resource "aws_iam_user" "file_service" {
  count = var.create_access_keys ? 1 : 0
  name  = "benzene-file-service-${var.environment}"
}

resource "aws_iam_user_policy_attachment" "file_service" {
  count      = var.create_access_keys ? 1 : 0
  user       = aws_iam_user.file_service[0].name
  policy_arn = aws_iam_policy.drive_access.arn
}

resource "aws_iam_access_key" "file_service" {
  count = var.create_access_keys ? 1 : 0
  user  = aws_iam_user.file_service[0].name
}
