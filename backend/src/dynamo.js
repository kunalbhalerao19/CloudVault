
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || "ap-south-1",
});

export const dynamo = DynamoDBDocumentClient.from(client);

export const TABLE_NAME =
  process.env.CLOUDVAULT_TABLE || "CloudVaultFiles";
