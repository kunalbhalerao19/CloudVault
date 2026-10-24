# CloudVault — Secure Cloud File Storage

A cloud-based file storage application built with React and Amazon Web Services (AWS), designed to provide authenticated file uploads, storage, retrieval, and deletion.

## 1. Project Overview

CloudVault is a web-based cloud storage system that allows authenticated users to upload files, view their stored files, download them, and delete them through a web interface.

The project uses Amazon Cognito for authentication, Amazon S3 for file storage, Amazon DynamoDB for file metadata, Amazon API Gateway for API access, and AWS Lambda for backend operations.

The application uses presigned S3 URLs to upload files without exposing AWS credentials in the frontend.

## 2. Project Objectives

- Develop a secure and user-friendly cloud file storage application.
- Implement user registration and authentication.
- Enable authenticated file uploads to Amazon S3.
- Store file metadata in Amazon DynamoDB.
- Allow users to list, download, and delete their files.
- Restrict file access based on the authenticated user's identity.
- Monitor backend execution through Amazon CloudWatch.
- Apply cloud security practices using IAM permissions, private storage, and authenticated API requests.

## 3. Key Features

### Authentication
- User authentication through Amazon Cognito.
- Frontend authentication integration using AWS Amplify.
- Access-token retrieval for authenticated API requests.
- Protected file API endpoints using Cognito JWT authorization.

### File Management
- File upload using presigned S3 URLs.
- File metadata storage in DynamoDB.
- File listing for the authenticated user.
- File download through temporary presigned URLs.
- File deletion from S3 and corresponding metadata deletion from DynamoDB.

### Security
- Amazon S3 Block Public Access enabled.
- Default S3 server-side encryption using SSE-S3.
- IAM permissions scoped to the CloudVault S3 bucket for the upload URL Lambda role.
- Authenticated API requests using Cognito tokens.
- User-specific DynamoDB queries and lookups in the reviewed Lambda handlers.

### Monitoring
- Lambda execution logs through Amazon CloudWatch.
- Inspection of Lambda invocation metrics and log events.

## 4. System Architecture

```text
                  USER
                   |
                   v
           React + Vite Frontend
                   |
                   v
          Amazon Cognito
          User Authentication
                   |
                   v
             Access Token
                   |
                   v
           Amazon API Gateway
          Cognito JWT Authorizer
                   |
                   v
              AWS Lambda
           Backend Operations
             /          \
            v            v
    Amazon DynamoDB    Amazon S3
    File Metadata      File Storage
            \            /
             \          /
             File Management
       Upload / List / Download / Delete
```

**Architecture note:** File uploads use a separate presigned URL flow. The frontend requests an upload URL from the backend and then uploads the file directly to S3. It subsequently submits the file metadata through the API.

## 5. Technology Stack

| Component | Technology | Purpose |
|---|---|---|
| Frontend | React | User interface |
| Build tool | Vite | Development server and production builds |
| Authentication | Amazon Cognito | User authentication and identity |
| Frontend authentication SDK | AWS Amplify | Cognito authentication integration |
| API management | Amazon API Gateway | Backend API endpoints |
| Backend | AWS Lambda | File-related business logic |
| Object storage | Amazon S3 | File storage |
| Database | Amazon DynamoDB | File metadata |
| Logging | Amazon CloudWatch | Logs and monitoring |
| Version control | Git and GitHub | Source code management |

## 6. AWS Infrastructure

The project uses the AWS Mumbai region.

- **Region:** `ap-south-1`
- **S3 bucket:** `cloudvault-storage-sk-2026`
- **DynamoDB table:** `CloudVaultFiles`
- **Cognito user pool:** `CloudVault-Web`
- **Upload URL Lambda:** `cloudvault-upload-url`
- **Download URL Lambda:** `cloudvault-download-url`
- **List files Lambda:** `cloudvault-list-files`
- **Delete file Lambda:** `cloudvault-delete-file`
- **API Gateway base URL:** `https://05nxz2uqye.execute-api.ap-south-1.amazonaws.com`

The API Gateway backend also includes the metadata endpoint `POST /files/metadata`. Confirm the deployed metadata handler and its configuration with the backend developer.

## 7. File Upload Workflow

1. The user signs in through Amazon Cognito.
2. The frontend obtains an access token.
3. The frontend sends an authenticated request to `POST /files/upload-url`.
4. API Gateway authorizes the request using Cognito JWT authorization.
5. The Lambda function generates a presigned S3 upload URL.
6. The frontend uploads the file directly to S3 using an HTTP PUT request.
7. The frontend submits the file ID, file key, name, content type, and file size to `POST /files/metadata`.
8. The backend stores the file metadata in DynamoDB.
9. The frontend refreshes the file list using `GET /files`.

## 8. File Download Workflow

1. The authenticated user selects a file.
2. The frontend requests `GET /files/{fileId}/download-url`.
3. The download Lambda obtains the authenticated user's ID from the authorizer claims.
4. The Lambda retrieves the metadata using the user's ID and file ID.
5. If the file record exists for that user, the backend generates a temporary S3 download URL.
6. The frontend uses the URL to download the file.

The configured download URL expiry is 300 seconds.

## 9. File Deletion Workflow

1. The user selects a file for deletion.
2. The frontend sends `DELETE /files/{fileId}` with an access token.
3. The delete Lambda retrieves the metadata using the authenticated user's ID and file ID.
4. If the record exists, the Lambda deletes the associated S3 object.
5. The Lambda deletes the corresponding DynamoDB record.
6. The frontend refreshes the file list.

The reviewed handler returns `404 File not found` if no matching user-specific record exists.

## 10. Database Design

### DynamoDB Table: `CloudVaultFiles`

The table stores metadata associated with uploaded files.

| Attribute | Type | Description |
|---|---|---|
| `userId` | String | Partition key identifying the file owner |
| `fileId` | String | Sort key identifying the file |
| `fileKey` | String | S3 object key |
| `fileName` | String | Original or stored filename |
| `contentType` | String | File MIME type |
| `fileSize` | Number | File size in bytes |
| Timestamp | String | Upload or record timestamp, if stored by the backend |

The actual metadata attributes depend on the deployed metadata Lambda implementation.

### S3 Object Organization

Uploaded objects use a user-specific key structure, for example:

```text
users/{userId}/{fileId}/{fileName}
```

The S3 bucket is configured with Block Public Access and default SSE-S3 encryption.

## 11. API Endpoints

Base URL:

`https://05nxz2uqye.execute-api.ap-south-1.amazonaws.com`

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/files/upload-url` | Generate a presigned upload URL |
| POST | `/files/metadata` | Save file metadata |
| GET | `/files` | List the authenticated user's files |
| GET | `/files/{fileId}/download-url` | Generate a download URL |
| DELETE | `/files/{fileId}` | Delete a file and its metadata |

The file endpoints are configured to use Cognito JWT authorization. Authenticated requests must include:

```http
Authorization: Bearer <access-token>
```

The upload flow requires a separate PUT request to the returned presigned S3 URL.

## 12. Local Development Setup

### Prerequisites

- Node.js and npm
- Git
- Access to the CloudVault GitHub repository
- An authorized AWS environment with the required resources configured

### Clone the repository

```bash
git clone https://github.com/kunalbhalerao19/CloudVault.git
cd CloudVault
```

### Install dependencies

```bash
npm install
```

On Windows PowerShell, if the npm PowerShell script is blocked by the execution policy, use:

```powershell
npm.cmd install
```

### Configure environment variables

Create a local `.env` file in the project root using the environment variable names expected by the frontend:

```env
VITE_AWS_REGION=ap-south-1
VITE_COGNITO_USER_POOL_ID=<your-cognito-user-pool-id>
VITE_COGNITO_CLIENT_ID=<your-cognito-app-client-id>
VITE_API_BASE_URL=https://05nxz2uqye.execute-api.ap-south-1.amazonaws.com
```

Replace the placeholders with the appropriate values from the authorized AWS environment.

**Security:** Never commit `.env` files, passwords, access tokens, AWS secret keys, or other credentials to GitHub.

### Start the development server

```bash
npm run dev
```

On Windows PowerShell:

```powershell
npm.cmd run dev
```

Open the local URL printed by Vite in your terminal.

### Create a production build

```bash
npm run build
```

On Windows PowerShell:

```powershell
npm.cmd run build
```

The production build is generated in the `dist/` directory.

## 13. Security Considerations

- Keep the S3 bucket private and Block Public Access enabled.
- Use IAM roles and least