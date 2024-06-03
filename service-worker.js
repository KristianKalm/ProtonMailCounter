const PROTON_DOMAIN = "https://mail.proton.me/"
const PROTON_DOMAIN_MAIL = "mail.proton.me"
const PROTON_DOMAIN_INBOX = "inbox"

// 5 minutes
const UPDATE_FREQUENCY = 5 * 60 * 1000

importScripts('core.js');
let updateTimer;

chrome.runtime.onInstalled.addListener(() => {
    console.log("onInstalled");
    showStoredCount();
    reloadCountInBackground();
    setInterval(reloadCountInBackground, UPDATE_FREQUENCY);
});

chrome.action.onClicked.addListener((tab) => {
  chrome.tabs.create({ url: PROTON_DOMAIN });
});

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
	await updateCountAndShowBadge();
});

chrome.tabs.onCreated.addListener(async tab => {
    await updateCountAndShowBadge();
});

