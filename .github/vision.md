# Explore Vision Capabilities with the Gemini API

The Gemini API can run inference on images and videos passed to it. When passed an image, a series of images, or a video, Gemini can:

- **Describe or answer questions about the content**
- **Summarize the content**
- **Extrapolate from the content**

This tutorial demonstrates some possible ways to prompt the Gemini API with images and video input. All output is text-only.

---

## Before You Begin: Set up Your Project and API Key

Before calling the Gemini API, you need to set up your project and configure your API key.

---

## Prompting with Images

In this tutorial, you will upload images using the File API or as inline data and generate content based on those images.

### Technical Details (Images)

- **Supported formats**: PNG, JPEG, WEBP, HEIC, HEIF
- **Maximum files**: 3,600
- **Scaling**: Larger images are scaled down to a maximum resolution of `3072x3072`. Smaller images are scaled up to `768x768`.
- **Token count**: Each image is equivalent to 258 tokens.

### Best Practices for Images

- Rotate images to the correct orientation before uploading.
- Avoid blurry images.
- Place the text prompt after the image when using a single image.

---

### Upload an Image and Generate Content

Use the `media.upload` method of the File API to upload an image of any size. For large files (>20MB), always use the File API.

```python
myfile = genai.upload_file(media / "Cajun_instruments.jpg")
print(f"{myfile=}")

model = genai.GenerativeModel("gemini-1.5-flash")
result = model.generate_content(
    [myfile, "\n\n", "Can you tell me about the instruments in this photo?"]
)
print(f"{result.text=}")
```

---

### Verify Image File Upload and Get Metadata

You can verify the API successfully stored the uploaded file and get its metadata by calling `files.get`.

```python
myfile = genai.upload_file(media / "poem.txt")
file_name = myfile.name
print(file_name)  # "files/*"

myfile = genai.get_file(file_name)
print(myfile)
```

---

### Upload One or More Locally Stored Image Files

Alternatively, you can upload your own files.

```python
import PIL.Image

sample_file_2 = PIL.Image.open('piranha.jpg')
sample_file_3 = PIL.Image.open('firefighter.jpg')
```

---

### Prompt with Multiple Images

You can provide the Gemini API with any combination of images and text that fit within the model's context window.

```python
model = genai.GenerativeModel(model_name="gemini-1.5-pro")

prompt = "Write an advertising jingle showing how the product in the first image could solve the problems shown in the second two images."

response = model.generate_content([prompt, sample_file, sample_file_2, sample_file_3])

Markdown(">" + response.text)
```

---

### Get a Bounding Box for an Object

You can ask the model for the coordinates of bounding boxes for objects in images.

```python
model = genai.GenerativeModel(model_name="gemini-1.5-pro")

prompt = "Return a bounding box for the piranha. \n [ymin, xmin, ymax, xmax]"
response = model.generate_content([piranha, prompt])

print(response.text)
```

To convert these coordinates to the dimensions of the original image:

1. Divide each output coordinate by 1000.
2. Multiply the x-coordinates by the original image width.
3. Multiply the y-coordinates by the original image height.

---

## Prompting with Video

In this tutorial, you will upload a video using the File API and generate content based on those videos.

### Technical Details (Video)

- **Supported formats**: MP4, MPEG, MOV, AVI, FLV, MPG, WEBM, WMV, 3GPP
- **Duration limit**: 1 hour
- **Frame extraction rate**: 1 FPS
- **Token count**: ~300 tokens/second (1M context window fits ~1 hour of video)

### Best Practices for Videos

- Use one video per prompt.
- Place the text prompt after the video.

---

### Upload a Video File Using the File API

```python
video_file_name = "GreatRedSpot.mp4"

print(f"Uploading file...")
video_file = genai.upload_file(path=video_file_name)
print(f"Completed upload: {video_file.uri}")
```

Verify the uploaded file's state:

```python
import time

while video_file.state.name == "PROCESSING":
    print('.', end='')
    time.sleep(10)
    video_file = genai.get_file(video_file.name)

if video_file.state.name == "FAILED":
    raise ValueError(video_file.state.name)
```

---

### Prompt with a Video and Text

```python
prompt = "Summarize this video. Then create a quiz with answer key based on the information in the video."

model = genai.GenerativeModel(model_name="gemini-1.5-pro")

response = model.generate_content([video_file, prompt], request_options={"timeout": 600})

Markdown(response.text)
```

---

### Refer to Timestamps in Content

```python
prompt = "What are the examples given at 01:05 and 01:19 supposed to show us?"

model = genai.GenerativeModel(model_name="gemini-1.5-pro")

response = model.generate_content([prompt, video_file], request_options={"timeout": 600})

print(response.text)
```

---

### Transcribe Video and Provide Visual Descriptions

```python
prompt = "Transcribe the audio, giving timestamps. Also provide visual descriptions."

model = genai.GenerativeModel(model_name="gemini-1.5-pro")

response = model.generate_content([prompt, video_file], request_options={"timeout": 600})

print(response.text)
```

---

## Manage Files

### List Uploaded Files

```python
print("My files:")
for f in genai.list_files():
    print("  ", f.name)
```

### Delete Uploaded Files

```python
myfile = genai.upload_file(media / "poem.txt")

myfile.delete()

try:
    model = genai.GenerativeModel("gemini-1.5-flash")
    result = model.generate_content([myfile, "Describe this file."])
except google.api_core.exceptions.PermissionDenied:
    pass
```

---

## What's Next

This guide shows how to upload image and video files using the File API and generate text outputs from them. To learn more, see the following resources:

- **File Prompting Strategies**: Learn more about multimodal prompting with text, image, audio, and video data.
- **System Instructions**: Steer the model's behavior based on your specific needs.
- **Safety Guidance**: Mitigate risks like inaccurate, biased, or offensive outputs through post-processing and human evaluation.
