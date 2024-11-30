const fs = require("fs");
const path = require("path");

const configPath = path.resolve(process.cwd(), "at-types.config.json");

// Default configuration template
const defaultConfig = {
  AIRTABLE_TOKEN: "your_api_key_here",
  AIRTABLE_BASE_ID: "your_base_id_here",
};

// Create the configuration file if it doesn't exist
if (!fs.existsSync(configPath)) {
  console.log("Creating at-types.config.json...");
  fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2), "utf-8");
  console.log(
    `Configuration file created at ${configPath}. Please open and update it with your Airtable credentials.`
  );
} else {
  console.log("Configuration file already exists. Skipping creation.");
}
