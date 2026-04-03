import type { ExtensionMessage } from "./types";

// Send Message from content script or popup -> Service Worker
export const sendMessage = async (message: ExtensionMessage): Promise<unknown> => {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(message, (response) => {
      if (chrome.runtime.lastError) {
        return reject(chrome.runtime.lastError);
      }
      resolve(response);
    });
  });
};

// Send Message from Service Worker -> specific tab's content script
export const sendMessageToTab = async (
  tabId: number,
  message: ExtensionMessage
): Promise<unknown> => {
  return new Promise((resolve, reject) => {
    chrome.tabs.sendMessage(tabId, message, (response) => {
      if (chrome.runtime.lastError) {
        return reject(chrome.runtime.lastError);
      }
      resolve(response);
    });
  });
};