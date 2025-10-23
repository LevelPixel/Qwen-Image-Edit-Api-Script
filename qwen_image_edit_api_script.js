#!/usr/bin/env node

/**
 * qwen_image_edit_api_script.js
 *
 * Dependencies:
 *   npm init -y
 *   npm install axios mime-types dotenv
 *
 * Usage:
 *   (optional) put DASHSCOPE_API_KEY in a .env file in the same folder:
 *     DASHSCOPE_API_KEY="sk-..."
 *   or set environment variable DASHSCOPE_API_KEY in the system.
 *
 *   node qwen_image_edit_api_script.js
 */

const fs = require('fs');
const path = require('path');
const axios = require('axios');
const mime = require('mime-types');
const dotenv = require('dotenv');

const ENV_PATH = path.join(process.cwd(), '.env');
const PROMPT_PATH = path.join(process.cwd(), 'Prompt.txt');
const INPUT_DIR = path.join(process.cwd(), 'input');

let API_KEY = null;
try {
  if (fs.existsSync(ENV_PATH)) {
    const envContent = fs.readFileSync(ENV_PATH, { encoding: 'utf8' });
    const parsed = dotenv.parse(envContent);
    if (parsed && parsed.DASHSCOPE_API_KEY) {
      API_KEY = parsed.DASHSCOPE_API_KEY;
      console.log('Using DASHSCOPE_API_KEY from .env file.');
    } else {
      dotenv.config();
    }
  } else {
    dotenv.config();
  }
} catch (e) {
  dotenv.config();
}

if (!API_KEY) {
  API_KEY = process.env.DASHSCOPE_API_KEY || null;
}

const BASE_URL = process.env.DASHSCOPE_BASE_URL ||
  'https://dashscope-intl.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation';
const OUTPUT_DIR = path.join(process.cwd(), 'output');
const IMAGE_EXTS = ['.jpg', '.jpeg', '.png', '.webp', '.bmp', '.tiff', '.tif'];

let PROMPT = '';
if (fs.existsSync(PROMPT_PATH)) {
  try {
    PROMPT = fs.readFileSync(PROMPT_PATH, 'utf8').trim();
    console.log('Loaded prompt from Prompt.txt');
  } catch (e) {
    console.error('Error reading Prompt.txt, using default prompt:', e.message);
  }
}

if (!PROMPT) {
  PROMPT = `Create a MAXIMUM photorealistic image based on the 3D image. Add a natural feel to the photograph. Time of day should be sunny. Do not change the shape of the furniture or add other furniture or furniture details. High contrast. No blown-out highlights. Medium brightness. Natural color correction. Be sure to add soft shadows to objects.

There should be no artificial 3D effect; the photo should be as photorealistic as possible.

Leave everything else as is; do not change anything.

Tags: photorealistic, photo, photorealistic interior, 85mm lens, soft natural lighting, high detail, 4K.`;
}

function timestamp() {
  const d = new Date();
  const YYYY = d.getFullYear();
  const MM = String(d.getMonth() + 1).padStart(2, '0');
  const DD = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  const ss = String(d.getSeconds()).padStart(2, '0');
  return `${YYYY}${MM}${DD}_${hh}${mm}${ss}`;
}

function findNewestImage(dirPath) {
  if (!fs.existsSync(dirPath)) return null;
  const files = fs.readdirSync(dirPath);
  const imageFiles = files
    .map(f => path.join(dirPath, f))
    .filter(f => {
      const ext = path.extname(f).toLowerCase();
      return IMAGE_EXTS.includes(ext) && fs.statSync(f).isFile();
    });

  if (imageFiles.length === 0) return null;

  imageFiles.sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs);
  return imageFiles[0];
}

function findInputImage() {
  let imagePath = findNewestImage(INPUT_DIR);
  if (imagePath) {
    console.log(`Found newest image in input/: ${path.basename(imagePath)}`);
    return imagePath;
  }

  const files = fs.readdirSync(process.cwd());
  files.sort();
  for (const f of files) {
    const ext = path.extname(f).toLowerCase();
    const fullPath = path.join(process.cwd(), f);
    if (IMAGE_EXTS.includes(ext) && fs.statSync(fullPath).isFile()) {
      console.log(`Found image in current directory: ${f}`);
      return fullPath;
    }
  }
  return null;
}

function encodeFileAsDataURI(filePath) {
  const buf = fs.readFileSync(filePath);
  let mimeType = mime.lookup(filePath) || 'image/png';
  const b64 = buf.toString('base64');
  return `data:${mimeType};base64,${b64}`;
}

function findImageField(obj) {
  if (obj == null) return null;
  if (typeof obj === 'string') {
    if (obj.startsWith('data:') || obj.startsWith('http')) return obj;
    return null;
  }
  if (Array.isArray(obj)) {
    for (const item of obj) {
      const r = findImageField(item);
      if (r) return r;
    }
    return null;
  }
  if (typeof obj === 'object') {
    for (const k of Object.keys(obj)) {
      if (k === 'image' && typeof obj[k] === 'string') return obj[k];
      const r = findImageField(obj[k]);
      if (r) return r;
    }
  }
  return null;
}

async function downloadUrlToFile(url, outBasePath) {
  const tmpResp = await axios.get(url, { responseType: 'stream', timeout: 120000 });
  let ext = path.extname(new URL(url).pathname) || '';
  if (!ext) {
    const ct = tmpResp.headers['content-type'];
    if (ct) {
      ext = '.' + (ct.split('/')[1] || 'bin');
    } else {
      ext = '.png';
    }
  }
  const outPath = outBasePath + ext;
  const writer = fs.createWriteStream(outPath);
  await new Promise((resolve, reject) => {
    tmpResp.data.pipe(writer);
    let errored = false;
    writer.on('error', err => { errored = true; reject(err); });
    writer.on('close', () => { if (!errored) resolve(); });
  });
  return outPath;
}

function saveDataUriToFile(dataUri, outBasePath) {
  const [header, b64] = dataUri.split(',', 2);
  const mimePart = header.split(';')[0];
  let mimeType = 'image/png';
  if (mimePart.startsWith('data:')) mimeType = mimePart.slice(5);
  const ext = mime.extension(mimeType) ? '.' + mime.extension(mimeType) : '.png';
  const buf = Buffer.from(b64, 'base64');
  const outPath = outBasePath + ext;
  fs.writeFileSync(outPath, buf);
  return outPath;
}

(async () => {
  try {
    if (!API_KEY) {
      console.error('Error: DASHSCOPE_API_KEY is not set (neither in .env nor in environment variables).');
      process.exit(1);
    }

    const inputImage = findInputImage();
    if (!inputImage) {
      console.error('No image found in input/ folder or current directory. Supported extensions:', IMAGE_EXTS.join(', '));
      process.exit(1);
    }

    if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

    const dataUri = encodeFileAsDataURI(inputImage);

    const requestBody = {
      model: 'qwen-image-edit',
      input: {
        messages: [
          {
            role: 'user',
            content: [
              { image: dataUri },
              { text: PROMPT }
            ]
          }
        ]
      },
      parameters: {
        negative_prompt: '',
        watermark: false
      }
    };

    const ts = timestamp();
    const reqLogPath = path.join(OUTPUT_DIR, `request_${ts}.req.json`);
    const respLogPath = path.join(OUTPUT_DIR, `response_${ts}.resp.json`);
    fs.writeFileSync(reqLogPath, JSON.stringify(requestBody, null, 2), { encoding: 'utf8' });

    console.log(`Sending request to ${BASE_URL} ...`);
    let resp;
    try {
      resp = await axios.post(BASE_URL, requestBody, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`
        },
        timeout: 300000
      });
    } catch (err) {
      if (err.response && err.response.data) {
        fs.writeFileSync(respLogPath, JSON.stringify(err.response.data, null, 2), { encoding: 'utf8' });
        console.error(`Request failed: HTTP ${err.response.status}. Response saved to ${respLogPath}`);
      } else {
        console.error('Request error:', err.message);
      }
      process.exit(1);
    }

    const respJson = resp.data;
    fs.writeFileSync(respLogPath, JSON.stringify(respJson, null, 2), { encoding: 'utf8' });

    let imageField = null;
    try {
      if (respJson && respJson.output && respJson.output.choices && respJson.output.choices[0]) {
        const c = respJson.output.choices[0];
        if (c.message && Array.isArray(c.message.content) && c.message.content[0]) {
          imageField = c.message.content[0].image || null;
        }
      }
    } catch (e) {
      imageField = null;
    }
    if (!imageField) imageField = findImageField(respJson);

    if (!imageField) {
      console.error('No image found in response. See saved response:', respLogPath);
      process.exit(1);
    }

    const outBase = path.join(OUTPUT_DIR, `generated_${ts}`);
    let savedPath;
    if (typeof imageField === 'string' && imageField.startsWith('data:')) {
      savedPath = saveDataUriToFile(imageField, outBase);
    } else if (typeof imageField === 'string' && (imageField.startsWith('http://') || imageField.startsWith('https://'))) {
      savedPath = await downloadUrlToFile(imageField, outBase);
    } else {
      try {
        const maybeBuf = Buffer.from(imageField, 'base64');
        const isPng = maybeBuf.slice(0, 8).toString('hex').startsWith('89504e47');
        const ext = isPng ? '.png' : '.bin';
        savedPath = outBase + ext;
        fs.writeFileSync(savedPath, maybeBuf);
      } catch (e) {
        savedPath = outBase + '.txt';
        fs.writeFileSync(savedPath, String(imageField), { encoding: 'utf8' });
      }
    }

    console.log('Done.');
    console.log('Input image:', inputImage);
    console.log('Saved generated image to:', savedPath);
    console.log('Saved request log to:', reqLogPath);
    console.log('Saved response log to:', respLogPath);

  } catch (err) {
    console.error('Unexpected error:', err);
    process.exit(1);
  }
})();
