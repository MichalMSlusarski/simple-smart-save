# Simple Smart Save

![Banner](https://github.com/MichalMSlusarski/simple-smart-save/banner.png)

This Chrome Extension was built for the **Google Chrome Built-in AI Challenge 2025**.

Most images online have meaningless filenames like `image123.jpg` or `screenshot_final_final2.png`.  
**Simple Smart Save** fixes that by automatically giving downloaded images clear, descriptive names using on-device AI.

## Description

When a user right-clicks an image and selects **“Simple Smart Save”**, the extension downloads it instantly and uses the **Prompt API with Gemini Nano’s new multimodal capabilities** to understand what’s in the picture.  
The model generates a short description that becomes the new filename. All processing happens locally, ensuring full privacy. No data or images ever leave the user’s device.

## Installation

1. Clone or download this repository.  
2. Open `chrome://extensions/` in Google Chrome.  
3. Enable **Developer mode** in the top-right corner.  
4. Click **Load unpacked** and select the project folder.  
5. Ensure the **Prompt API** is enabled and that the **Gemini Nano** model (with multimodal capability) is downloaded and available in Chrome.  
6. Right-click on any image and choose **“Simple Smart Save”** to test it.

## Project Structure

```bash
simple-smart-save/
├── background.js
├── popup.html
├── popup.js
├── styles.css
├── manifest.json
└── icons
    └── icon.png
```
