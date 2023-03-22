chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getContent") {
    const selection = window.getSelection();
    const selectedText = selection?.toString() || null;

    const content = {
      title: document.title,
      url: window.location.href,
      viewedAt: new Date().toISOString(),
      author: document.querySelector('meta[name="author"]')?.content,
      description: document.querySelector('meta[name="description"]')?.content,
      keywords: document.querySelector('meta[name="keywords"]')?.content,
      language: document.documentElement.lang,
      publisher: document.querySelector('meta[property="og:publisher"]')
        ?.content,
      lastModified: new Date(document.lastModified).toISOString(),
      contentType: document.contentType,
      contentLength: document.documentElement.innerHTML.length,
      innerHTML: document.documentElement.innerHTML,
      text: document.body.innerText,
      images: Array.from(document.images, (img) => img.src),
      selectedText: selectedText,
    };

    sendResponse({ content });
  }
});
