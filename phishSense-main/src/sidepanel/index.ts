chrome.runtime.onMessage.addListener((message) => {
  if (message.type === 'OPEN_SIDE_PANEL') {
    // The background script will open the side panel,
    // and this content script will render the UI.
  }
});