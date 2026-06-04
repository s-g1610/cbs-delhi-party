// Runs at Vercel build time — generates config.js from environment variables
const fs = require("fs");

const url       = process.env.SUPABASE_URL   || "";
const key       = process.env.SUPABASE_KEY   || "";
const adminPass = process.env.ADMIN_PASS     || "";

if (!url || !key || !adminPass) {
    console.error("ERROR: Missing environment variables (SUPABASE_URL, SUPABASE_KEY, ADMIN_PASS)");
    process.exit(1);
}

const content = `// Auto-generated at build time — DO NOT COMMIT
var SUPABASE_URL = "${url}";
var SUPABASE_KEY = "${key}";
var ADMIN_PASS   = "${adminPass}";
`;

fs.writeFileSync("config.js", content);
console.log("config.js generated successfully.");
