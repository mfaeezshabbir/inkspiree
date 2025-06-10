// Simple script to test CORS configuration
console.log("Testing CORS configuration...");

// Test accessing the API directly
console.log("Testing direct API access...");
fetch("http://localhost:8001/api/boards", {
  method: "GET",
  headers: {
    "Content-Type": "application/json",
    "Origin": "http://localhost:3001"
  }
})
.then(response => {
  console.log("Direct API Response status:", response.status);
  console.log("Direct API Response headers:", JSON.stringify([...response.headers.entries()]));
  return response.json();
})
.then(data => {
  console.log("Direct API Received data:", data);
  console.log("Direct API CORS test successful!");
})
.catch(error => {
  console.error("Direct API CORS error:", error);
});

// Test accessing the API through the Next.js API proxy
console.log("\nTesting Next.js API proxy...");
fetch("http://localhost:3001/api/boards", {
  method: "GET",
  headers: {
    "Content-Type": "application/json"
  }
})
.then(response => {
  console.log("Next.js Proxy Response status:", response.status);
  console.log("Next.js Proxy Response headers:", JSON.stringify([...response.headers.entries()]));
  return response.json();
})
.then(data => {
  console.log("Next.js Proxy Received data:", data);
  console.log("Next.js Proxy CORS test successful!");
})
.catch(error => {
  console.error("Next.js Proxy CORS error:", error);
});
