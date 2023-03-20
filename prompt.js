const promptHtml = `
<div id="snap-memo-overlay">
  <div id="snap-memo-prompt">
    <h3>Enter your comment:</h3>
    <textarea id="snap-memo-comment" autofocus></textarea>
    <div id="snap-memo-actions">
      <button id="snap-memo-save">Save</button>
      <button id="snap-memo-cancel">Cancel</button>
    </div>
  </div>
</div>
`;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "promptForComment") {
    const parser = new DOMParser();
    const promptEl = parser
      .parseFromString(promptHtml, "text/html")
      .querySelector("#snap-memo-overlay");
    document.body.appendChild(promptEl);

    const styleEl = document.createElement("link");
    styleEl.setAttribute("rel", "stylesheet");
    styleEl.setAttribute("href", chrome.runtime.getURL("prompt.css"));
    document.head.appendChild(styleEl);

    const commentEl = document.querySelector("#snap-memo-comment");
    const saveBtn = document.querySelector("#snap-memo-save");
    const cancelBtn = document.querySelector("#snap-memo-cancel");
    const focusableEls = Array.from(
      promptEl.querySelectorAll("button, textarea")
    );

    saveBtn.addEventListener("click", () => {
      sendResponse({ comment: commentEl.value });
      promptEl.remove();
      styleEl.remove();
    });

    cancelBtn.addEventListener("click", () => {
      sendResponse({ comment: null });
      promptEl.remove();
      styleEl.remove();
    });

    commentEl.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && e.shiftKey) {
        e.preventDefault();
        saveBtn.click();
      } else if (e.key === "Escape") {
        e.preventDefault();
        cancelBtn.click();
      } else if (e.key === "Tab") {
        e.preventDefault();
        const index = focusableEls.indexOf(document.activeElement);
        const nextIndex = (index + 1) % focusableEls.length;
        focusableEls[nextIndex].focus();
      }
    });

    focusableEls.forEach((el) => {
      el.addEventListener("focus", () => {
        focusableEls.forEach((el2) =>
          el2.classList.remove("snap-memo-focused")
        );
        el.classList.add("snap-memo-focused");
      });
    });

    promptEl.addEventListener("click", (e) => {
      if (e.target === promptEl) {
        cancelBtn.click();
      }
    });

    return true;
  }
});
