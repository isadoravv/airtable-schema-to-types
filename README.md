# Airtable TypeScript Generator

The Airtable TypeScript Generator is a tool that automatically generates TypeScript type definitions for your Airtable bases. It uses the Airtable API to gather metadata about the base, including tables and their fields, and converts them into TypeScript types. This tool helps you maintain type safety when interacting with your Airtable data, ensuring you get autocompletion and validation within your code editor.

## Features
- Automatically generates TypeScript types for Airtable tables.
- Handles various field types such as `singleLineText`, `multipleSelect`, `rollup`, `formula`, `lookup`, and more.
- Supports complex field types like `multipleLookupValues` and `rollup`, with recursive type handling for nested arrays.
- Generates detailed comments with field descriptions and options.

## Installation

1. Clone the repository:

> bash
> ```
> git clone https://github.com/yourusername/airtable-typescript-generator.git
> ```

2. Install dependencies:

> bash
> ```
> cd airtable-typescript-generator
> npm install
> ```

3. Set up the configuration file:

> bash
> ```
> npm run postinstall
> ```

4. Update the _at-types.config.json_ file with your Airtable credentials.

Create a file named at-types.config.json in the root of your project. The tool will generate it automatically if it doesn’t exist, but you can manually configure it by adding your Airtable credentials.

Example configuration:

> json
> ```
> {
>   "AIRTABLE_TOKEN": "your_api_key_here",
>   "AIRTABLE_BASE_IDS": ["base_id_1", "base_id_2"]
> }
> ```

*AIRTABLE_TOKEN*: Your Airtable API key. Obtain it from Airtable’s API page.

*AIRTABLE_BASE_IDS*: An array of Airtable base IDs for which you want to generate TypeScript types. You can find these in the URL of your base, e.g., https://airtable.com/appXXXXXXXX/tblYYYYYY.

## Usage
To generate TypeScript types for your Airtable bases, run the following command:

> bash
> ```
> node generate-types.js
> ```
By default, the types will be saved in the types directory. If you want to specify a different output directory, use the --output-directory option:

> bash
> ```
> node generate-types.js --output-directory ./generated-types
> ```
This command will generate TypeScript type definitions for the Airtable bases specified in the at-types.config.json file and save them in the specified directory.

## Configuration
The configuration file *(at-types.config.json)* should contain the following fields:

*AIRTABLE_TOKEN*: Your Airtable API key.

*AIRTABLE_BASE_IDS*: An array of Airtable base IDs for which you want to generate TypeScript types.


Example configuration:

> json
> ```
> {
>   "AIRTABLE_TOKEN": "your_api_key_here",
>   "AIRTABLE_BASE_IDS": ["base_id_1", "base_id_2"]
> }
> ```

## Contributing
Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes.

## License
This project is licensed under the MIT License. See the LICENSE file for details.