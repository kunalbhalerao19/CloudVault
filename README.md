
# CloudVault

CloudVault is a cloud-based file storage project using AWS services and a web frontend.

## Member 4 — Authentication, Security and QA

### 1. Authentication
- Configured Amazon Cognito authentication for the frontend using AWS Amplify.
- Implemented access-token retrieval for authenticated API requests.
- Integrated authentication with the file upload URL endpoint.

### 2. File Upload and Storage Security
- Configured the S3 bucket `cloudvault-storage-sk-2026` in the Mumbai region (`ap-south-1`).
- Enabled S3 Block Public Access.
- Enabled default server-side encryption using SSE-S3.
- Configured an IAM execution role for the upload URL Lambda function.
- Restricted the upload policy to objects in the CloudVault S3 bucket.
- Configured S3 CORS for the local frontend development origins.

### 3. API Integration
- Integrated the frontend with `POST /files/upload-url`.
- Added frontend validation for supported file types and the 10 MB size limit.
- Implemented the presigned URL upload flow to S3.
- Verified that a test file was uploaded successfully to S3.

### 4. Logging and Monitoring
- Verified the Lambda execution role's CloudWatch logging permissions.
- Confirmed that the upload URL Lambda has a CloudWatch log group and log streams.
- Inspected Lambda invocation metrics and log events.

### 5. Current Limitations and Pending Work
- DynamoDB file metadata integration and the listing, download, and deletion APIs are pending backend completion and verification.
- The current frontend file listing, sharing, deletion, and download functions still include mock implementations.
- Full end-to-end QA, including ownership and unauthorized-access tests, remains pending.

### 6. Technologies
- Frontend: React and Vite
- Authentication: Amazon Cognito and AWS Amplify
- Storage: Amazon S3
- API: Amazon API Gateway and AWS Lambda
- Logging: Amazon CloudWatch
- Database: Amazon DynamoDB (planned metadata integration)
