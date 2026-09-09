# Benzene drive infrastructure

Terraform for the S3 bucket the file service uploads to, plus the least-privilege
IAM that reaches it.

> **Not yet applied.** These files have been syntax-checked but never run through
> `terraform plan` or `apply` against a real account. Review the plan before
> applying — it creates billable resources.

## What it creates

| Resource | Why |
| --- | --- |
| S3 bucket | Stores file bytes. Private; reachable only via presigned URLs. |
| Public access block | All four flags on. Nothing in the bucket is ever publicly readable. |
| Ownership controls | `BucketOwnerEnforced` — ACLs disabled entirely. |
| Versioning | Safety net beneath the app's own version history, covering accidental overwrite or delete. |
| Encryption | SSE-S3 by default; customer-managed KMS key with rotation when `use_kms = true`. |
| CORS | The browser PUTs straight to S3, so S3 answers the preflight itself. |
| Lifecycle rules | Aborts abandoned multipart uploads; ages old versions to STANDARD_IA, then deletes them. |
| Bucket policy | Denies any request not already over TLS. |
| IAM policy + role | Exactly the actions the service performs, scoped to the `users/*` prefix. |

## Design notes

**Why the browser uploads directly.** File bytes never pass through Next.js, the
gateway or the file service — the service only signs a URL and later confirms
what landed. Nothing in the request path is bounded by a body-size limit, and
the application servers stay stateless and cheap.

**Why the IAM policy has no `ListBucket`.** The directory listing is served from
MongoDB, not from S3. Granting `ListBucket` would let a compromised service
enumerate every tenant's object keys for no functional gain.

**Why keys are scoped to `users/*`.** Object keys are built only from
server-side identifiers (`users/<ownerId>/nodes/<nodeId>/v<n>`), never from the
client-supplied filename. The IAM policy is scoped to that same prefix, so a bug
in key construction still cannot reach anything outside it.

**Why `abort_incomplete_upload_days` matters.** Parts of an abandoned multipart
upload do not appear in the object listing but are still billed. Without the
rule they accumulate invisibly.

**Why CORS must not be `*`.** A presigned URL is a bearer credential. If one
leaks, a wildcard origin lets any site on the internet spend it. The variable
has a validation rule that rejects `*`.

**Why access keys are opt-in.** Static credentials are the most commonly leaked
kind. The role is the intended path; `create_access_keys` exists only for
workloads that cannot assume one.

## Usage

```bash
cd infrastructure/terraform
cp terraform.tfvars.example terraform.tfvars   # then edit it
terraform init
terraform plan
terraform apply
```

Before applying, configure a remote backend. The default local state file holds
the IAM secret access key in plaintext when `create_access_keys` is true.

## Wiring the file service to the output

```bash
export STORAGE_DRIVER=s3
export S3_BUCKET="$(terraform output -raw bucket_name)"
export AWS_REGION="$(terraform output -raw aws_region)"
```

Credentials come from the ambient AWS credential chain — an assumed role, an
instance profile, or `AWS_PROFILE` locally. The service never reads a key from
its own configuration.

Leave `STORAGE_DRIVER=local` and none of this is needed: the service writes to
disk and signs its own URLs, exercising the identical browser upload path.

## Cost

Roughly, in `us-east-1`, at the time of writing: S3 Standard storage is billed
per GB-month, with separate per-1,000 charges for PUT and GET requests.
Presigned uploads and downloads go browser-to-S3, so they do not add data
transfer through your compute. `use_kms = true` adds a per-request KMS charge
on top — `bucket_key_enabled` is set to keep that from scaling per object.
Check current AWS pricing before relying on any of these figures.
