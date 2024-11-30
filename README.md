# Airtable TypeScript Generator

Airtable TypeScript Generator is a tool that automatically generates TypeScript type definitions for your Airtable bases. It uses the Airtable API to gather metadata about the base, including tables and their fields, and converts them into TypeScript types. This tool helps you maintain type safety when interacting with your Airtable data, ensuring you get autocompletion and validation within your code editor.

## Features

- Automatically generates TypeScript types for Airtable tables.
- Handles various field types such as `singleLineText`, `multipleSelect`, `rollup`, `formula`, `lookup`, and more.
- Supports complex field types like `multipleLookupValues` and `rollup`, with recursive type handling for nested arrays.
- Generates detailed comments with field descriptions and options.
- Provides time zone information (Paris Time) when the types file is generated.

## Installation

To install the Airtable TypeScript Generator, you can use `npm` or `yarn`:

```bash
npm install airtable-types-generator --save-dev
