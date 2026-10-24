
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "node:crypto";

const REGION = process.env.AWS_REGION || "ap-south-1";
const BUCKET_NAME = process.env.CLOUDVAULT_BUCKET;

const s3 = new S3Client({ region: REGION });

const ALLOWED_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "text/plain"
]);

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

export const handler = async (event) => {
  try {
    const body =
      typeof event.body === "string"
        ? JSON.parse(event.body)
        : event.body;

    const { fileName, contentType, fileSize } = body ?? {};

    if (!fileName || typeof fileName !== "string" ||
        fileName.length > 200 || /[/\\]/.test(fileName)) {
      return response(400, { message: "Invalid file name" });
    }

    if (!ALLOWED_TYPES.has(contentType)) {
      return response(400, { message: "Unsupported file type" });
    }

    if (!Number.isInteger(fileSize) ||
        fileSize <= 0 || fileSize > MAX_FILE_SIZE) {
      return response(400, {
        message: "File size must be between 1 byte and 10 MB"
      });
    }

    if (!BUCKET_NAME) {
      console.error("CLOUDVAULT_BUCKET is not configured");
      return response(500, { message: "Server configuration error" });
    }

    // Temporary development guard: require verified identity
    // from an API Gateway authorizer before enabling uploads.
    const userId =
      event.requestContext?.authorizer?.claims?.sub ??
      event.requestContext?.authorizer?.jwt?.claims?.sub;

    if (!userId) {
      return response(401, { message: "Authentication required" });
    }

    const fileId = randomUUID();
    const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
    const key = `users/${userId}/${fileId}/${safeName}`;

    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      ContentType: contentType
    });

    const uploadUrl = await getSignedUrl(s3, command, {
      expiresIn: 300
    });

    return response(200, {
      uploadUrl,
      fileId,
      fileKey: key,
      expiresIn: 300
    });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return response(400, { message: "Invalid JSON body" });
    }

    console.error("Failed to create upload URL");
    return response(500, { message: "Unable to create upload URL" });
  }
};

function response(statusCode, body) {
  return {
    statusCode,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  };
}
