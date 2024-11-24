# Generate Structured Output with the Gemini API

## Overview

Gemini generates unstructured text by default, but some applications require structured text. For these use cases, you can constrain Gemini to respond with JSON, a structured data format suitable for automated processing. You can also constrain the model to respond with one of the options specified in an enum.

### Example Use Cases

- Build a database of companies by pulling company information out of newspaper articles.
- Pull standardized information out of resumes.
- Extract ingredients from recipes and display a link to a grocery website for each ingredient.

### JSON Output

You can ask Gemini to produce JSON-formatted output in your prompt, but note:

- The model is not guaranteed to produce JSON and nothing but JSON.
- For deterministic responses, pass a specific JSON schema in the `responseSchema` field to ensure Gemini responds with an expected structure.

This guide shows how to generate JSON using the `generateContent` method through the SDK of your choice or the REST API directly. The examples use text-only input, though Gemini can also produce JSON responses to multimodal requests that include images, videos, and audio.

---

## Before You Begin: Set Up Your Project and API Key

Before calling the Gemini API, set up your project and configure your API key.

<details>
<summary>Expand to view how to set up your project and API key</summary>
Instructions go here.
</details>

---

## Generating JSON

When configured to output JSON, Gemini responds to any prompt with JSON-formatted output.

You can control the structure of the JSON response by supplying a schema in two ways:

1. **As text in the prompt**.
2. **As a structured schema supplied through model configuration**.

Both approaches work in **Gemini 1.5 Flash** and **Gemini 1.5 Pro**.

### 1. Supply a Schema as Text in the Prompt

The following example prompts the model to return cookie recipes in a specific JSON format.

```javascript
// Make sure to include these imports:
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.API_KEY);

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
});

const prompt = `List a few popular cookie recipes using this JSON schema:

Recipe = {'recipeName': string}
Return: Array<Recipe>`;

const result = await model.generateContent(prompt);
console.log(result.response.text());
```

The output might look like this:

```json
[
  { "recipeName": "Chocolate Chip Cookies" },
  { "recipeName": "Oatmeal Raisin Cookies" },
  { "recipeName": "Snickerdoodles" },
  { "recipeName": "Sugar Cookies" },
  { "recipeName": "Peanut Butter Cookies" }
]
```

---

### 2. Supply a Schema Through Model Configuration

The following example:

- Instantiates a model configured with a schema to respond with JSON.
- Prompts the model to return cookie recipes.

> **Important:** This method provides more precise control than relying on text in the prompt.

```javascript
// Make sure to include these imports:
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.API_KEY);

const schema = {
  description: "List of recipes",
  type: SchemaType.ARRAY,
  items: {
    type: SchemaType.OBJECT,
    properties: {
      recipeName: {
        type: SchemaType.STRING,
        description: "Name of the recipe",
        nullable: false,
      },
    },
    required: ["recipeName"],
  },
};

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-pro",
  generationConfig: {
    responseMimeType: "application/json",
    responseSchema: schema,
  },
});

const result = await model.generateContent(
  "List a few popular cookie recipes.",
);
console.log(result.response.text());
```

The output might look like this:

```json
[
  { "recipeName": "Chocolate Chip Cookies" },
  { "recipeName": "Oatmeal Raisin Cookies" },
  { "recipeName": "Snickerdoodles" },
  { "recipeName": "Sugar Cookies" },
  { "recipeName": "Peanut Butter Cookies" }
]
```
