// Automatically inject sidebar when extension icon is clicked
chrome.action.onClicked.addListener(async (tab) => {
  // Check if we're on a Freshdesk page
  if (!tab.url.includes("freshdesk.com")) {
    // Show alert for non-Freshdesk pages
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        alert("⚠️ This extension only works on Freshdesk ticket pages.\n\nPlease navigate to a Freshdesk ticket first.");
      }
    });
    return;
  }

  try {
    // Check if panel already exists
    const [result] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => !!document.querySelector(".ai-panel")
    });

    if (result.result) {
      // Panel exists, just show it
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          const panel = document.querySelector(".ai-panel");
          if (panel) panel.style.display = "flex";
        }
      });
      return;
    }

    // Inject CSS first
    await chrome.scripting.insertCSS({
      target: { tabId: tab.id },
      files: ["styles.css"]
    });

    // Then inject all JavaScript files in order
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: [
        "utils/cleanText.js",
        "extractor.js",
        "ai.js",
        "ui.js",
        "content.js"
      ]
    });

    console.log("✅ Extension injected successfully");
  } catch (error) {
    console.error("❌ Injection error:", error);
  }
});
