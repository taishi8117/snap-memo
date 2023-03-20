# SnapMemo Chrome Extension

SnapMemo is a Chrome extension that allows users to save their comments and content from any web page. The extension captures the user's comments, the page URL, and the text and image content of the web page, and sends the data to a pre-configured endpoint in JSON format.

![SnapMemo Screenshot](./screenshot.png)

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)

## Features

- Save comments on any web page
- Captures the URL, text, and images of the web page
- Stores comments with a timestamp
- Sends data to a pre-configured API endpoint

## Installation

1. Clone the repository: `git clone https://github.com/taishi8117/snap-memo.git`

2. Open Chrome, navigate to `chrome://extensions`, enable "Developer mode", click "Load unpacked", and select the `snap-memo` folder.

## Configuration

Modify the `config.json` file to set your desired API endpoint URL:

```json
{
  "apiUrl": "https://your-pre-configured-endpoint.com/api/save"
}
```

---

This project was almost entirely written by GPT-4.
