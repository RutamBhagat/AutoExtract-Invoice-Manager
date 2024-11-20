# Explore Vision Capabilities with the Gemini API

The Gemini API can run inference on images and videos. It can:

- Describe or answer questions about the content
- Summarize the content
- Extrapolate from the content

This tutorial demonstrates how to prompt the Gemini API with image and video input. **All output is text-only**.

---

## Before You Begin: Set Up Your Project and API Key

Before calling the Gemini API, set up your project and configure your API key.

---

## Prompting with Images

You can upload images using the File API or as inline data and generate content based on those images.

### Technical Details (Images)

- **Supported MIME Types**:
  - `image/png`
  - `image/jpeg`
  - `image/webp`
  - `image/heic`
  - `image/heif`
- **Limits**:
  - Max: 3,600 image files
  - Images larger than `3072x3072` are scaled down.
  - Images smaller than `768x768` are scaled up.

For best results:

- Rotate images to the correct orientation.
- Avoid blurry images.

---

### Upload an Image and Generate Content

Use the `media.upload` method of the File API to upload an image and generate content.

```javascript
// Import required modules
import { GoogleAIFileManager } from "@google/generative-ai/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize FileManager and upload an image
const fileManager = new GoogleAIFileManager(process.env.API_KEY);

const uploadResult = await fileManager.uploadFile(`${mediaPath}/jetpack.jpg`, {
  mimeType: "image/jpeg",
  displayName: "Jetpack drawing",
});

console.log(
  `Uploaded file ${uploadResult.file.displayName} as: ${uploadResult.file.uri}`
);

// Initialize GenerativeAI
const genAI = new GoogleGenerativeAI(process.env.API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Generate content
const result = await model.generateContent([
  "Tell me about this image.",
  {
    fileData: {
      fileUri: uploadResult.file.uri,
      mimeType: uploadResult.file.mimeType,
    },
  },
]);

console.log(result.response.text());
```

---

### Verify Image File Upload and Get Metadata

Retrieve the metadata of the uploaded file.

```javascript
// Import required modules
import { GoogleAIFileManager } from "@google/generative-ai/server";

const fileManager = new GoogleAIFileManager(process.env.API_KEY);

const uploadResponse = await fileManager.uploadFile(
  `${mediaPath}/jetpack.jpg`,
  {
    mimeType: "image/jpeg",
    displayName: "Jetpack drawing",
  }
);

const getResponse = await fileManager.getFile(uploadResponse.file.name);
console.log(`Retrieved file ${getResponse.displayName} as ${getResponse.uri}`);
```

---

### Call Locally Stored Image Files

Smaller files can be uploaded locally.

```javascript
import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";

const genAI = new GoogleGenerativeAI(process.env.API_KEY);

function fileToGenerativePart(path, mimeType) {
  return {
    inlineData: {
      data: Buffer.from(fs.readFileSync(path)).toString("base64"),
      mimeType,
    },
  };
}

const filePart1 = fileToGenerativePart("jetpack.jpg", "image/jpeg");
const filePart2 = fileToGenerativePart("piranha.jpg", "image/jpeg");
const filePart3 = fileToGenerativePart("firefighter.jpg", "image/jpeg");
```

---

### Prompt with Multiple Images

Provide multiple images and a text prompt.

```javascript
async function run() {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

  const prompt =
    "Write an advertising jingle showing how the product in the first image could solve the problems shown in the second two images.";

  const imageParts = [filePart1, filePart2, filePart3];

  const generatedContent = await model.generateContent([prompt, ...imageParts]);

  console.log(generatedContent.response.text());
}

run();
```

---

### Get a Bounding Box for an Object

Retrieve bounding box coordinates for objects in images.

```javascript
async function findBox(filePart) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

  const prompt =
    "Return a bounding box for the piranha. \n [ymin, xmin, ymax, xmax]";

  const generatedContent = await model.generateContent([prompt, filePart]);

  console.log(generatedContent.response.text());
}

findBox(filePart);
```

---

## Prompting with Video

### Technical Details (Video)

- **Supported MIME Types**:
  - `video/mp4`
  - `video/mpeg`
  - `video/mov`
  - `video/avi`
  - `video/webm`
- Files must be uploaded using the File API.
- Up to 1 frame per second and 1 Kbps audio extraction.

---

### Upload a Video File Using the File API

```javascript
import { GoogleAIFileManager } from "@google/generative-ai/server";

const fileManager = new GoogleAIFileManager(process.env.API_KEY);

const uploadResponse = await fileManager.uploadFile("GreatRedSpot.mp4", {
  mimeType: "video/mp4",
  displayName: "Jupiter's Great Red Spot",
});

console.log(
  `Uploaded file ${uploadResponse.file.displayName} as: ${uploadResponse.file.uri}`
);
```

---

### Prompt with a Video and Text

```javascript
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

const result = await model.generateContent([
  {
    fileData: {
      mimeType: uploadResponse.file.mimeType,
      fileUri: uploadResponse.file.uri,
    },
  },
  {
    text: "Summarize this video. Then create a quiz with answer key based on the information in the video.",
  },
]);

console.log(result.response.text());
```

### Refer to Timestamps in the Content

You can use timestamps in the format `MM:SS` to refer to specific moments in the video.

```javascript
// To generate content, use this import path for GoogleGenerativeAI.
// Note that this is a different import path than what you use for the File API.
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize GoogleGenerativeAI with your API_KEY.
const genAI = new GoogleGenerativeAI(process.env.API_KEY);

// Choose a Gemini model.
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-pro",
});

// Upload the video file using the File API
// uploadResponse = ...

// Generate content using text and the URI reference for the uploaded file.
const result = await model.generateContent([
  {
    fileData: {
      mimeType: uploadResponse.file.mimeType,
      fileUri: uploadResponse.file.uri,
    },
  },
  {
    text: "What are the examples given at 01:05 and 01:19 supposed to show us?",
  },
]);

// Handle the response of generated text
console.log(result.response.text());
```

### Transcribe Video and Provide Visual Descriptions

If the video is not fast-paced (only 1 frame per second of video is sampled), it's possible to transcribe the video with visual descriptions for each shot.

```javascript
// To generate content, use this import path for GoogleGenerativeAI.
// Note that this is a different import path than what you use for the File API.
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize GoogleGenerativeAI with your API_KEY.
const genAI = new GoogleGenerativeAI(process.env.API_KEY);

// Choose a Gemini model.
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-pro",
});

// Upload the video file using the File API
// uploadResponse = ...

// Generate content using text and the URI reference for the uploaded file.
const result = await model.generateContent([
  {
    fileData: {
      mimeType: uploadResponse.file.mimeType,
      fileUri: uploadResponse.file.uri,
    },
  },
  {
    text: "Transcribe the audio, giving timestamps. Also provide visual descriptions.",
  },
]);

// Handle the response of generated text
console.log(result.response.text());
```

### List Files

You can list all files uploaded using the File API and their URIs using `files.list`.

```javascript
// Make sure to include these imports:
import { GoogleAIFileManager } from "@google/generative-ai/server";
const fileManager = new GoogleAIFileManager(process.env.API_KEY);

const listFilesResponse = await fileManager.listFiles();

// View the response.
for (const file of listFilesResponse.files) {
  console.log(`name: ${file.name} | display name: ${file.displayName}`);
}
```

### Delete Files

Files uploaded using the File API are automatically deleted after 2 days. You can also manually delete them using `files.delete`.

```javascript
// Make sure to include these imports:
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

### What's Next

This guide shows how to upload image and video files using the File API and then generate text outputs from image and video inputs. To learn more, see the following resources:

- **File Prompting Strategies**: The Gemini API supports prompting with text, image, audio, and video data, also known as multimodal prompting.
- **System Instructions**: System instructions let you steer the behavior of the model based on your specific needs and use cases.
- **Safety Guidance**: Sometimes generative AI models produce unexpected outputs, such as outputs that are inaccurate, biased, or offensive. Post-processing and human evaluation are essential to limit the risk of harm from such outputs.

---
