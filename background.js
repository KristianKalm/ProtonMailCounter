importScripts('config.js', 'storage.js', 'core.js');

onInstalled = async (tabId, changeInfo, tab) => {
  checkOrCreateAlarm()
  await updateCountAndShowBadge();
}

onUpdated = async (tabId, changeInfo, tab) => {
  checkOrCreateAlarm()
  await updateCountAndShowBadge();
}

onClicked = (tab) => {
  chrome.tabs.create({ url: PROTON_DOMAIN });
}

onAlarm = (alarm) => {
  if (alarm.name == ALARM_NAME) {
    refreshCountInBackground();
  }
}

chrome.runtime.onInstalled.addListener(onInstalled);
chrome.tabs.onUpdated.addListener(onUpdated);
chrome.action.onClicked.addListener(onClicked);
chrome.alarms.onAlarm.addListener(onAlarm);