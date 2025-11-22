// --- EXISTING LOGIC ---
chrome.commands.onCommand.addListener((command) => {
  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    // Added a safety check (tabs[0]) to prevent errors if no tab is found
    if (tabs.length > 0) {
        chrome.tabs.sendMessage(tabs[0].id, {type: "COMMAND", command});
    }
  });
});

// --- NEW LOGIC: FAKEMAIL SWITCHER ---
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "ACTIVATE_FAKEMAIL") {
    const targetUrl = "https://www.fakemail.net/";
    
    // Find tab matching fakemail.net
    chrome.tabs.query({url: "*://www.fakemail.net/*"}, (tabs) => {
      if (tabs.length > 0) {
        // FOUND: Refresh to main URL and switch to it
        const tab = tabs[0];
        chrome.tabs.update(tab.id, {active: true, url: targetUrl});
        chrome.windows.update(tab.windowId, {focused: true});
      } else {
        // NOT FOUND: Create new
        chrome.tabs.create({url: targetUrl});
      }
    });
  }
});