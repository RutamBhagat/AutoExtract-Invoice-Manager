# Explore document processing capabilities with the Gemini API

## Supported Programming Languages
- Python
- Node.js
- Go
- REST

The Gemini API can process and run inference on PDF documents passed to it. When a PDF is uploaded, the Gemini API can:

- Describe or answer questions about the content
- Summarize the content
- Extrapolate from the content

This tutorial demonstrates some possible ways to prompt the Gemini API with provided PDF documents. All output is text-only.

---

## Before you begin: Set up your project and API key

Before calling the Gemini API, you need to set up your project and configure your API key.

<details>
<summary>Expand to view how to set up your project and API key</summary>
<!-- Add specific instructions or links to setup if provided -->
</details>

---

## Technical details

- **Supported MIME Types**:
  - **PDF**: `application/pdf`
  - **JavaScript**: `application/x-javascript`, `text/javascript`
  - **Python**: `application/x-python`, `text/x-python`
  - **TXT**: `text/plain`
  - **HTML**: `text/html`
  - **CSS**: `text/css`
  - **Markdown**: `text/md`
  - **CSV**: `text/csv`
  - **XML**: `text/xml`
  - **RTF**: `text/rtf`

- **Maximum document size**: 3,600 pages
- **Token equivalent**: Each page is equivalent to 258 tokens.

### Document Resolution
- **Maximum resolution**: 3072x3072 (scaled down while preserving aspect ratio)
- **Minimum resolution**: 768x768 (scaled up if necessary)

### Best Practices
- Rotate pages to the correct orientation before uploading.
- Avoid blurry pages.
- If using a single page, place the text prompt after the page.

---

## Upload a document and generate content

You can use the File API to upload a document of any size. Always use the File API when the total request size (including files, text prompt, system instructions, etc.) is larger than 20 MB.

- **File API Storage**: 20 GB per project, with a per-file maximum size of 2 GB.
- **File Retention**: Files are stored for 48 hours.
- **Cost**: The File API is available at no cost in all supported regions.

### Example: Upload a file and generate content

```javascript
import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleAIFileManager } from "@google/generative-ai/server";

// Initialize GoogleGenerativeAI with your API_KEY.
const genAI = new GoogleGenerativeAI(process.env.API_KEY);
// Initialize GoogleAIFileManager with your API_KEY.
const fileManager = new GoogleAIFileManager(process.env.API_KEY);

const model = genAI.getGenerativeModel({
  // Choose a Gemini model.
  model: "gemini-1.5-flash",
});

// Upload the file and specify a display name.
const uploadResponse = await fileManager.uploadFile("media/gemini.pdf", {
  mimeType: "application/pdf",
  displayName: "Gemini 1.5 PDF",
});

// View the response.
console.log(
  `Uploaded file ${uploadResponse.file.displayName} as: ${uploadResponse.file.uri}`
);

// Generate content using text and the URI reference for the uploaded file.
const result = await model.generateContent([
  {
    fileData: {
      mimeType: uploadResponse.file.mimeType,
      fileUri: uploadResponse.file.uri,
    },
  },
  { text: "Can you summarize this document as a bulleted list?" },
]);

// Output the generated text to the console
console.log(result.response.text());
```

---

## Get metadata for a file

You can verify the API successfully stored the uploaded file and get its metadata by calling `files.get`. Only the name (and by extension, the URI) are unique.

```javascript
import { GoogleAIFileManager } from "@google/generative-ai/server";

const fileManager = new GoogleAIFileManager(process.env.API_KEY);

const uploadResponse = await fileManager.uploadFile(`${mediaPath}/jetpack.jpg`, {
  mimeType: "image/jpeg",
  displayName: "Jetpack drawing",
});

// Get the previously uploaded file's metadata.
const getResponse = await fileManager.getFile(uploadResponse.file.name);

// View the response.
console.log(
  `Retrieved file ${getResponse.displayName} as ${getResponse.uri}`
);
```

---

## Call one or more locally stored files

When the combination of files and system instructions that you intend to send is larger than 20 MB in size, use the File API. Smaller files can be called locally from the Gemini API.

### Example: Prompt with multiple documents

```javascript
import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";

// Access your API key as an environment variable
const genAI = new GoogleGenerativeAI(process.env.API_KEY);

// Converts local file information to a GoogleGenerativeAI.Part object.
function fileToGenerativePart(path, mimeType) {
  return {
    inlineData: {
      data: Buffer.from(fs.readFileSync(path)).toString("base64"),
      mimeType,
    },
  };
}

// Turn documents to Part objects
const filePart1 = fileToGenerativePart("gemini.pdf", "application/pdf");
const filePart2 = fileToGenerativePart("example-1.pdf", "application/pdf");
const filePart3 = fileToGenerativePart("example-2.pdf", "application/pdf");

async function run() {
  // Choose a Gemini model.
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt =
    "Summarize the differences between the thesis statements for these documents.";

  const imageParts = [filePart1, filePart2, filePart3];

  const generatedContent = await model.generateContent([prompt, ...imageParts]);

  console.log(generatedContent.response.text());
}

run();
```

---

## List files

You can list all files uploaded using the File API and their URIs using `files.list`.

```javascript
import { GoogleAIFileManager } from "@google/generative-ai/server";

const fileManager = new GoogleAIFileManager(process.env.API_KEY);

const listFilesResponse = await fileManager.listFiles();

// View the response.
for (const file of listFilesResponse.files) {
  console.log(`name: ${file.name} | display name: ${file.displayName}`);
}
```

---

## Delete files

Files uploaded using the File API are automatically deleted after 2 days. You can also manually delete them using `files.delete`.

```javascript
import { GoogleAIFileManager } from "@google/generative-ai/server";

const fileManager = new GoogleAIFileManager(process.env.API_KEY);

const uploadResult = await fileManager.uploadFile(`${mediaPath}/jetpack.jpg`, {
  mimeType: "image/jpeg",
  displayName: "Jetpack drawing",
});

// Delete the file.
await fileManager.deleteFile(uploadResult.file.name);

console.log(`Deleted ${uploadResult.file.displayName}`);
```

---

## What's next

This guide shows how to use `generateContent` and generate text outputs from processed documents. To learn more, see the following resources:

- **File prompting strategies**: The Gemini API supports prompting with text, image, audio, and video data, also known as multimodal prompting.
- **System instructions**: System instructions let you steer the behavior of the model based on your specific needs and use cases.
- **Safety guidance**: Sometimes generative AI models produce unexpected outputs, such as outputs that are inaccurate, biased, or offensive. Post-processing and human evaluation are essential to limit the risk of harm from such outputs.
---