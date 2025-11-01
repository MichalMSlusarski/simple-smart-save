// prompts etc wrzuc na inny plik potem
const GEMINI_FILENAME_PROMPT = `
Extract the following keywords from this image.
Return them as a JSON object with these fields only:
{
  "type": "scan | painting | photo | drawing",
  "object": "primary object(s) in the picture",
  "action": "main action if any",
  "background": "main background",
  "tone": "tone or mood"
}
Be concise: one or two words for each field.
Do not add extra text or explanations.
`;

const GEMINI_FILENAME_SCHEMA = {
  type: "object",
  properties: {
    type: { type: "string" },
    object: { type: "string" },
    action: { type: "string" },
    background: { type: "string" },
    tone: { type: "string" }
  },
  required: ["type", "object", "action", "background", "tone"]
};

let namingSession = null;

// utils
function getFileExtension(url, blob) {
  const urlPath = url.split("?")[0].split("#")[0];
  const extMatch = urlPath.match(/\.(jpe?g|png|gif|webp|bmp|svg)$/i);
  if (extMatch) return extMatch[0].toLowerCase();

  const mime = blob?.type || "";
  if (mime.startsWith("image/")) return "." + mime.split("/")[1];

  return ".jpg"; // default
}

function getStoredSettings() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(["dateFormat", "separator"], (data) => {
      resolve(data || {});
    });
  });
}

async function getDatePrefix() {
  const { dateFormat = "YYYY-MM-DD", separator = "-" } = await getStoredSettings();
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");

  let formatted;
  switch (dateFormat) {
    case "DD-MM-YYYY":
      formatted = `${dd}${separator}${mm}${separator}${yyyy}`;
      break;
    case "MM-DD-YYYY":
      formatted = `${mm}${separator}${dd}${separator}${yyyy}`;
      break;
    case "YYYYMMDD":
      formatted = `${yyyy}${mm}${dd}`;
      break;
    default:
      formatted = `${yyyy}${separator}${mm}${separator}${dd}`;
  }
  return formatted;
}


// filneme gen
async function getDescriptiveFilename(url, blob, fallbackSlug = "image") {
  const ext = getFileExtension(url, blob);
  const date = await getDatePrefix();

  try {
    const available = await LanguageModel.availability();
    if (available === "unavailable") {
      console.warn("Gemini Nano not available, fallback to generic name");
      return `${date}_${fallbackSlug}${ext}`;
    }

    // Create a new session for each request instead of reusing global one
    const namingSession = await LanguageModel.create({
      expectedInputs: [{ type: "text" }, { type: "image" }],
      temperature: 0.2,
      topK: 40
    });

    const response = await namingSession.prompt(
      [
        {
          role: "user",
          content: [
            { type: "text", value: GEMINI_FILENAME_PROMPT },
            { type: "image", value: blob }
          ]
        }
      ],
      { responseConstraint: GEMINI_FILENAME_SCHEMA }
    );

    console.log("Gemini JSON response:", response);
    const data = typeof response === "string" ? JSON.parse(response) : response;

    const parts = [
      data.type,
      data.object,
      data.action,
      data.background,
      data.tone
    ]
      .filter(Boolean)
      .map((p) => p.toLowerCase().replace(/[^a-z0-9]+/g, "-"));

    const slug = parts.join("-") || fallbackSlug;
    return `${date}_${slug}${ext}`;
  } catch (err) {
    console.error("Filename generation failed:", err);
    return `${date}_${fallbackSlug}${ext}`;
  }
}


chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "simple-save",
    title: "Simple Smart Save",
    contexts: ["image"]
  });
});

chrome.contextMenus.onClicked.addListener(async (info) => {
  if (info.menuItemId === "simple-save") {
    try {
      const url = info.srcUrl;
      const fallback = "image_" + Date.now();

      chrome.notifications.create({
        type: "basic",
        iconUrl: chrome.runtime.getURL('icons/icon.png'),
        title: "Simple Smart Save",
        message: "Saving process started... It might take some time, just do other stuff."
      });

      const resp = await fetch(url);
      const blob = await resp.blob();

      const descriptiveName = await getDescriptiveFilename(url, blob, fallback);

      chrome.downloads.download({
        url: url,
        filename: "SimpleSave/" + descriptiveName,
        saveAs: false
      });
    } catch (err) {
      console.error("Error saving image:", err);
    }
  }
});
