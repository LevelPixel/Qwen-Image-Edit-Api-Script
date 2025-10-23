<div align="center">

# 🧠 Qwen Image Edit — API Scripts

[![Alibaba Cloud](https://img.shields.io/badge/Alibaba%20Cloud-FF6A00?logo=alibabacloud&logoColor=white)](https://www.alibabacloud.com)
[![Qwen Model](https://img.shields.io/badge/Qwen-Image%20Edit-blueviolet?logo=alibabacloud&logoColor=white)](https://modelscope.cn/models/qwen)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)
[![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20Linux-lightgrey)](#)

</div>

This repository contains helper scripts for running **Qwen Image Edit** models via **Alibaba Cloud API**.<br>
The scripts are written in JavaScript and Node.js, with a portable version of NPM, which is installed automatically along with the scripts.<br>
Follow this guide to set up your environment, register your API key, and start generating AI-edited images.<br>

---

## 🔑 API Key Registration

Before using the scripts, you must create and activate an **API Key** in your **Alibaba Cloud** account.

📘 **Official documentation:**  
[How to Get an API Key →](https://www.alibabacloud.com/help/en/model-studio/get-api-key)

---

### Step-by-Step Setup

<table>
  <thead>
    <tr>
      <th align="center" width="8%">Step</th>
      <th align="left" width="30%">Action</th>
      <th align="left" width="62%">Link / Notes</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td align="center"><b>1</b></td>
      <td><b>Create an Account</b><br>Register your <b>Alibaba Cloud</b> account.</td>
      <td>
        🔗 <a href="https://modelstudio.console.alibabacloud.com/?tab=playground#/efm/prompt">Model Studio Registration</a><br><br>
        ⚠️ <b>ATTENTION!</b><br>
        Make sure you are on the <b>International Edition</b> of the site — not the Mainland China version.<br>
        You can switch it at the <b>top-right</b> of the page.<br><br>
        To register, click <b>“Log In”</b> (top-right).<br>
        Verification requires a <b>credit/debit card</b> or <b>PayPal</b>, and a <b>phone number</b>.
      </td>
    </tr>
    <tr>
      <td align="center"><b>2</b></td>
      <td><b>Create API Key</b><br>Open the API Key page.</td>
      <td>
        🔗 <a href="https://modelstudio.console.alibabacloud.com/?tab=playground#/api-key">Create API Key</a><br><br>
        Click <b>“Create API Key”</b> at the <b>top-right corner</b> of the page.
      </td>
    </tr>
    <tr>
      <td align="center"><b>3</b></td>
      <td><b>Enable Free Quota</b><br>Activate the model quota.</td>
      <td>
        🔗 <a href="https://modelstudio.console.alibabacloud.com/?tab=doc#/doc/?type=model&url=2840914_2&modelId=qwen-image-edit">Qwen Image Edit Model</a><br><br>
        On the model page, toggle <b>“Free Quota Only”</b> (middle-right switch).<br>
        You will receive <b>100 free generations</b>.
      </td>
    </tr>
    <tr>
      <td align="center"><b>4</b></td>
      <td><b>Open <code>.env</code> File</b><br>Edit environment configuration.</td>
      <td>In the script folder, open <code>.env</code> using <b>Notepad</b> or any text editor.</td>
    </tr>
    <tr>
      <td align="center"><b>5</b></td>
      <td><b>Copy API Key</b><br>Get your key from the API Key list.</td>
      <td>
        🔗 <a href="https://modelstudio.console.alibabacloud.com/?tab=playground#/api-key">Your API Keys</a><br><br>
        If no key is displayed, click <b>“Create API Key”</b> again to generate one.
      </td>
    </tr>
    <tr>
      <td align="center"><b>6</b></td>
      <td><b>Paste in <code>.env</code></b><br>Save your configuration.</td>
      <td>
        Add the following line inside your <code>.env</code> file:<br><br>
        <pre><code>DASHSCOPE_API_KEY="sk-..."</code></pre>
        Save and close the file.
      </td>
    </tr>
  </tbody>
</table>

Once done, proceed to [⚙ Script Usage](#-script-usage).

---

## ⚙ Script Usage

Choose your operating system below:

- [🧮 Windows](#-windows-instructions)
- [🐧 Linux](#-linux-instructions)

---

### 🧮 Windows Instructions

#### Step-by-Step

| Step | Description |
|------|--------------|
| **W.1** | Run `install_portable_npm_WINDOWS.bat` — installs dependencies and prepares the script. |
| **W.2** | <span style="color:gray">*(Optional)*</span> Edit your prompt in `Prompt.txt`. If missing, a **default interior generation prompt** is used. |
| **W.3** | Add an image to the `input` folder. Supported: `.png`, `.jpg`, `.jpeg`. If multiple exist, the **newest** one is used. |
| **W.4** | Run `run_with_portable_npm_WINDOWS.bat` and wait **10–15 seconds**. The script will close automatically. |
| **W.5** | Find generated images and metadata in the `output` folder. |

> ⚠️ **If nothing appears in `output`**, check your API setup and dependencies.

You may repeat **W.2–W.4** to regenerate images — only the **most recent** one from `input` will be processed.

---

### 🐧 Linux Instructions

#### Step-by-Step

| Step | Description |
|------|--------------|
| **L.1** | Open a terminal inside the script folder. |
| **L.2** | Make scripts executable: `chmod +x install_portable_npm_LINUX.sh && chmod +x run_with_portable_npm_LINUX.sh` |
| **L.3** | Run the installer: `./install_portable_npm_LINUX.sh` |
| **L.4** | <span style="color:gray">*(Optional)*</span> Edit your prompt in `Prompt.txt`. If missing, a **default interior generation prompt** is used. |
| **L.5** | Add an image to the `input` folder. Supported: `.png`, `.jpg`, `.jpeg`. The script picks the **latest** one automatically. |
| **L.6** | Run the generator: `./run_with_portable_npm_LINUX.sh` |
| **L.7** | Generated results and API metadata will appear in the `output` folder. |

> ⚠️ **If output is missing**, verify your environment and API Key configuration.

You can repeat **L.4–L.6** to re-run generation for new or modified images.

---

## 🧹 Optional Cleanup

If you only use one platform, you can safely delete the files for the other:

| Platform | Files You Can Remove |
|-----------|----------------------|
| 🧮 **Windows** | All `*_LINUX.sh` files |
| 🐧 **Linux** | All `*_WINDOWS.bat` files |

---

## 💰 Free Quota & Billing Notice

After your **Free Quota** expires, requests will automatically switch to **paid usage**.  
Each generation will incur a small cost depending on your **Alibaba Cloud account** and **billing plan**.

<div align="center">


Made with ❤️ for developers using [Qwen Image Edit](https://modelstudio.console.alibabacloud.com/?tab=doc#/doc/?type=model&url=2840914_2&modelId=qwen-image-edit).

Copyright (c) 2025-present Level Pixel
</div>
