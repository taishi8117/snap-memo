chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getContent") {
    const content = {
      text: document.body.innerText,
      images: Array.from(document.images, (img) => img.src),
    };
    console.log("content: ", content);
    sendResponse({ content });
  }
});
