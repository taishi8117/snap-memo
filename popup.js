document.getElementById("comments").focus();

document.getElementById("save").addEventListener("click", saveComments);
document.getElementById("save").addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    saveComments();
  }
});

async function saveComments() {
  const comments = document.getElementById("comments").value;
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  chrome.runtime.sendMessage(
    {
      action: "save",
      data: { tabId: tab.id, comments },
    },
    (res) => {
      if (res) {
        console.log("snap-memo", res);
      }
      window.close();
    }
  );
}
