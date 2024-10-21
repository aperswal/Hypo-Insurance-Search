// utils/dynamodb.js

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";

const REGION = process.env.AWS_REGION || "us-west-2"; // Your AWS region
const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME || "consultations"; // DynamoDB table name

// Initialize the DynamoDB client
const ddbClient = new DynamoDBClient({ region: REGION });

// Create a DynamoDB Document Client
const ddbDocClient = DynamoDBDocumentClient.from(ddbClient);

export { ddbDocClient, TABLE_NAME, PutCommand };