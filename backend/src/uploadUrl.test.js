
import test from "node:test";
import assert from "node:assert/strict";

process.env.CLOUDVAULT_BUCKET = "cloudvault-storage-sk-2026";
process.env.AWS_REGION = "ap-south-1";

const { handler } = await import("./uploadUrl.js");

function makeEvent(body, authenticated = false) {
  return {
    body: typeof body === "string" ? body : JSON.stringify(body),
    requestContext: authenticated
      ? { authorizer: { claims: { sub: "test-user-123" } } }
      : {}
  };
}

test("rejects malformed JSON", async () => {
  const result = await handler({ body: "{" });
  assert.equal(result.statusCode, 400);
});

test("rejects an invalid file name", async () => {
  const result = await handler(
    makeEvent({
      fileName: "../report.pdf",
      contentType: "application/pdf",
      fileSize: 1024
    })
  );
  assert.equal(result.statusCode, 400);
});

test("rejects unsupported file types", async () => {
  const result = await handler(
    makeEvent({
      fileName: "report.exe",
      contentType: "application/x-msdownload",
      fileSize: 1024
    })
  );
  assert.equal(result.statusCode, 400);
});

test("rejects files larger than 10 MB", async () => {
  const result = await handler(
    makeEvent({
      fileName: "report.pdf",
      contentType: "application/pdf",
      fileSize: 11 * 1024 * 1024
    })
  );
  assert.equal(result.statusCode, 400);
});

test("rejects requests without an authenticated user", async () => {
  const result = await handler(
    makeEvent({
      fileName: "report.pdf",
      contentType: "application/pdf",
      fileSize: 1024
    })
  );
  assert.equal(result.statusCode, 401);
});
