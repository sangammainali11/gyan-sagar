const fs = require("fs");
const path = require("path");

const envPath = path.join(__dirname, "../.env");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  console.log("Searching .env for admin email...");
  const lines = envContent.split("\n");
  lines.forEach((line) => {
    if (line.includes("ADMIN_EMAIL") || line.includes("sangam")) {
      console.log("Found line:", line.trim());
    }
  });
} else {
  console.log(".env file does not exist.");
}
