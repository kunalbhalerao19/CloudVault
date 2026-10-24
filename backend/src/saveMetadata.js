
import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { dynamo, TABLE_NAME } from "./dynamo.js";

export const handler = async (event) => {
  try {
    const userId =
      event.requestContext?.authorizer?.jwt?.claims?.sub ??
      event.requestContext?.authorizer?.claims?.sub;

    if (!userId) {
      return response(401, { message: "Authentication required" });
    }

    const body =
      typeof event.body === "string"
        ? JSON.parse(event.body)
        : event.body;

    const { fileId, fileName, fileKey, contentType, fileSize } = body ?? {};

    if (
      !fileId ||
      !fileName ||
      !fileKey ||
      !contentType ||
      !Number.isInteger(fileSize) ||
      fileSize <= 0 ||
      fileSize > 10 * 1024 * 1024
    ) {
      return response(400, { message: "Invalid file metadata" });
    }

    // Never allow a user to save metadata for another user's S3 object.
    if (!fileKey.startsWith(`users/${userId}/${fileId}/`)) {
      return response(403, { message: "File ownership validation failed" });
    }

    const uploadedAt = new Date().toISOString();

    await dynamo.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: {
          userId,
          fileId,
          fileName,
          fileKey,
          contentType,
          fileSize,
          uploadedAt,
        },
        ConditionExpression:
          "attribute_not_exists(userId) AND attribute_not_exists(fileId)",
      })
    );

    return response(201, {
      message: "File metadata saved",
      fileId,
      uploadedAt,
    });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return response(400, { message: "Invalid JSON body" });
    }

    if (error.name === "ConditionalCheckFailedException") {
      return response(409, { message: "File metadata already exists" });
    }

 console.error("Failed to save file metadata", {
  name: error?.name,
  message: error?.message,
  code: error?.$metadata?.httpStatusCode,
});
  }
};

function response(statusCode, body) {
  return {
    statusCode,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  };
}
