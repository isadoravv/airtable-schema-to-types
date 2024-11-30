import fs from "fs/promises";
import path from "path";
import axios from "axios";

console.log("Starting the script...");

async function loadDefaultConfig() {
  console.log("Loading config...");
  const configPath = path.resolve(process.cwd(), "at-types.config.json");
  
  try {
    const fileContent = await fs.readFile(configPath, "utf-8");
    return JSON.parse(fileContent);
  } catch (err) {
    throw new Error(
      `Failed to read config file at ${configPath}: ${(err as Error).message}`
    );
  }
}

function sanitizeTableName(tableName: string): string {
  // Replace hyphens, spaces, and special characters with valid TypeScript name characters
  return "Airtable" + tableName
  .replace(/[^a-zA-Z0-9]/g, ' ')        // Replace non-alphanumeric characters with spaces
  .replace(/\s+/g, '')                  // Remove all spaces
  .replace(/^([a-z])/, (match) => match.toUpperCase()) // Capitalize the first letter
  .replace(/([A-Z])([A-Z][a-z])/g, '$1$2')  // Handle camelCase for multiple capitals
  .replace(/([a-z])([A-Z])/g, '$1$2');  // Keep camelCase
}

function isAlphanumeric(fieldName: string): boolean {
  // Checks if the fieldName contains only letters and digits (no spaces or accents)
  const regexAlphanumeric = /^[a-zA-Z0-9]+$/;
  return regexAlphanumeric.test(fieldName);
}

function getParisTime(): string {
  const parisTime = new Date().toLocaleString("en-US", {
    timeZone: "Europe/Paris",
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  return `${parisTime} (CET/CEST)`;
}

function getSingleSelectType(choices: any[]): string {
  // For singleSelect, generate a union of the available options
  return `"${choices.map((choice: any) => choice.name).join('" | "')}"`;
}

function getMultipleSelectType(choices: any[]): string {
  // For multipleSelects, generate an array of available options
  return `("${choices.map((choice: any) => choice.name).join('" | "')}")[]`;
}

export async function generateTypesForBase(baseId: string, outputPath: string): Promise<void> {
  const config = await loadDefaultConfig();
  const { AIRTABLE_TOKEN } = config;
  
  console.log("Fetching schema...");
  const url = `https://api.airtable.com/v0/meta/bases/${baseId}/tables`;
  
  const response = await axios.get(url, {
    headers: { Authorization: `Bearer ${AIRTABLE_TOKEN}` },
  });
  
  const baseName = response.data.name;
  const tables = response.data.tables;
  const typeMap: { [key: string]: string } = {
    singleLineText: "string",
    email: "string",
    url: "string",
    multilineText: "string",
    number: "number",
    percent: "number",
    currency: "number",
    singleSelect: "string",
    multipleSelects: "string[]",
    singleCollaborator: "string",  // Could be an ID or a collaborator name
    multipleCollaborators: "string[]",  // Array of IDs or names
    multipleRecordLinks: "string[]",  // Array of linked record IDs
    date: "string",
    dateTime: "string",
    phoneNumber: "string",  // Treating phone numbers as strings for simplicity
    multipleAttachments: "Attachment[]",  // Array of attachment objects
    checkbox: "boolean",
    formula: "string",  // Treat formula as string or any (depending on the formula result)
    createdTime: "string",
    rollup: "any",  // Rollup could return various types, such as number or string, so we use `any`
    count: "number",
    lookup: "any",  // Lookup can return various types based on the lookup field
    multipleLookupValues: "any[]",  // Array of lookup results
    autoNumber: "number",
    barcode: "string",  // Barcode as a string (typically alphanumeric)
    rating: "number",  // Rating is typically a numeric value
    richText: "string",  // Treat rich text as string (could also be HTML, depending on the field content)
    duration: "string",  // Duration is typically a string representation (e.g., "P1Y2M3D")
    lastModifiedTime: "string",
    button: "string",  // Buttons are typically represented as strings
    createdBy: "string",  // Created by could be a user ID or name
    lastModifiedBy: "string",  // Last modified by could be a user ID or name
    externalSyncSource: "string",  // External sync sources are typically represented as strings
    aiText: "string",  // AI-generated text as a string
  };
  
  // Initialize a variable to accumulate all the type definitions
  let allTypes = `// Base ID: ${baseId}\n// List of Tables: ${tables.map((t: any) => t.name).join(", ")}\n\n// This types file was generated automatically by the Airtable Types Generator on ${new Date().toLocaleString('en-GB', { timeZone: 'Europe/Paris' })}, Paris time\n\n// Imported Types\nimport { Attachment } from './Airtable-Filetypes';\n\n`;

  function getNestedType(field: any): string {
    let baseType = 'any';  // Default type if not found
    
    // Handle multipleLookupValues type
    if (field.type === 'multipleLookupValues') {
      const result = field.options?.result?.type;
      
      // If a result type is specified, map it to TypeScript type
      if (result) {
        baseType = typeMap[result] || 'any';  // Fallback to 'any' if not mapped
      }
      
      // Recursively handle nested arrays
      if (Array.isArray(field.options?.result?.valuesByLinkedRecordId)) {
        return `${getNestedType(field)}[]`;  // Recursively add array notation for nested arrays
      }
    }
    
    // Handle rollup type
    if (field.type === 'rollup') {
      const result = field.options?.result?.type;
      
      // If a result type is specified, map it to TypeScript type
      if (result) {
        baseType = typeMap[result] || 'any';  // Fallback to 'any' if not mapped
      }
      
      // Handle possible arrays in rollup result
      if (field.options?.result?.options?.nestedArray) {
        return `${getNestedType(field)}[]`;  // Add array notation if nested arrays are present
      }
    }
  
    return baseType;
  }
        
  for (const table of tables) {
    const typeName = sanitizeTableName(table.name); // Sanitize table name to TypeScript type name
    console.log(`Processing table: ${table.name} -> Type: ${typeName}`);
    const primaryFieldId = table.primaryFieldId;
    const fields = table.fields.map((field: any) => {
      
      let tsType = typeMap[field.type] || "any";
      if(field.type === 'multipleLookupValues' || field.type === 'rollup') {
        // console.log('multipleLookupValues', field);
        tsType = getNestedType(field);
        tsType += '[]'; // Add array notation for multipleLookupValues
      } else if (field.type === 'formula') {
        // The result type is contained in the options.result object
        const formulaResultType = field.options?.result?.type;
        if (formulaResultType) {
          tsType = typeMap[formulaResultType] || "any"; // Map the result type to the TypeScript type
        } else {
          tsType = 'string'; // Default to 'string' if result type is unavailable
        }
      } else if (field.type === 'singleSelect') {
        tsType = getSingleSelectType(field.options?.choices || []);
      } else if (field.type === 'multipleSelects') {
        tsType = getMultipleSelectType(field.options?.choices || []);
      }
      const nameWithQuotesIfNeeded = !isAlphanumeric(field.name) ? `"${field.name}"` : field.name;
      let fieldName = nameWithQuotesIfNeeded;
      if (!field.id === primaryFieldId) {
        fieldName = `${fieldName}?`;
      }
      let comment = `// ${field.type}`;

      // Adding field-specific options for fields that have options
      if (field.type === 'singleSelect' || field.type === 'multipleSelects') {
        comment += ` (Options: ${field.options?.choices.map((choice: any) => choice.name).join(", ")})`;
      } else if (field.type === 'formula') {
        // comment += ` (Formula: ${field.options.formula})`;
      }

      return `  ${fieldName}: ${tsType}; ${comment}`;
    });
    
    const typeDef = `export interface ${typeName} {\n${fields.join("\n")}\n}\n\n`; // Added double line break
    allTypes += typeDef; // Append the type definition to the accumulator
  }
  
  // Write all the accumulated types into one file
  const outputFilePath = path.resolve(outputPath, `Airtable-${baseId}.d.ts`);
  console.log(`Writing all types to: ${outputFilePath}`);
  await fs.writeFile(outputFilePath, allTypes);
  
}

export async function generateTypes(outputPath: string): Promise<void> {
  const config = await loadDefaultConfig();
  const { AIRTABLE_BASE_IDS } = config;
  
  // Loop over each base ID and generate the type file for each base
  for (const baseId of AIRTABLE_BASE_IDS) {
    await generateTypesForBase(baseId, outputPath);
  }
  
  console.log("Type generation complete!");
}

// Get output directory from command-line arguments
const outputDir = process.argv[2] || "./types";
console.log("Output directory:", outputDir);

// Call the function to generate types
generateTypes(outputDir).then(() => {
  console.log("Airtable types generated successfully!");
}).catch((err) => {
  console.error("Error generating Airtable types:", err);
});

console.log("Script execution completed.");
