
export const handler = async (event) => {
  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      success: true,
      message: "CloudVault backend is running"
    })
  };
};

if (process.argv[1]?.endsWith("health.js")) {
  const response = await handler({});
  console.log("Response:", response);
  console.log("Parsed body:", JSON.parse(response.body));
}
