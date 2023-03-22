async function fetchConfig() {
  const response = await fetch(chrome.runtime.getURL("config.json"));
  return await response.json();
}

chrome.commands.onCommand.addListener(async (command) => {
  if (command === "save_comment") {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    const url = tab.url;
    const timestamp = new Date().toISOString();

    chrome.tabs.sendMessage(
      tab.id,
      { action: "getContent" },
      async (response) => {
        if (!response) {
          return;
        }

        const content = response.content;
        chrome.tabs.sendMessage(
          tab.id,
          { action: "promptForComment" },
          async (response) => {
            const comment = response.comment;

            if (comment === null) {
              return;
            }

            try {
              const email = await new Promise((resolve, reject) => {
                chrome.identity.getProfileUserInfo(({ email }) => {
                  if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError.message);
                  } else {
                    resolve(email);
                  }
                });
              });

              const { apiUrl, key } = await fetchConfig();
              const payload = {
                username: email,
                url,
                comment,
                content,
                timestamp,
                key,
              };

              const response = await fetch(apiUrl, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
              });

              if (!response.ok) {
                alert("Error saving the comment.");
              }
            } catch (error) {
              console.error("Error:", error);
            }
          }
        );
      }
    );
  }
});
