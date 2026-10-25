const fs = require("node:fs");
const crypto = require("node:crypto");
const path = require("node:path");
const target = path.join(__dirname, "..", ".env.local");
try {
  const template = fs.readFileSync(path.join(__dirname, "..", ".env.example"), "utf8");
  fs.writeFileSync(target, template.replace(/^AUTH0_SECRET=$/m, `AUTH0_SECRET=${crypto.randomBytes(32).toString("hex")}`), {flag:"wx",mode:0o600});
  console.log("Created private .env.local; enter the Auth0 client secret locally. No secret values displayed.");
} catch (error) {
  if (error.code !== "EEXIST") throw error;
  console.log("Existing .env.local preserved without reading it.");
}
