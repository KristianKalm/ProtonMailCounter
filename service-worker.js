const PROTON_DOMAIN = "https://mail.proton.me/";

const ALARM_NAME = "checkUnreadCount";
const ALARM_TIME_MINUTES = 5;

importScripts('core.js');
let updateTimer;

chrome.runtime.onInstalled.addListener(() => {
    showStoredCount();
    checkOrCreateAlarm();
});

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  checkOrCreateAlarm()
  await updateCountAndShowBadge();
});
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  checkOrCreateAlarm()
  await updateCountAndShowBadge();
});

chrome.action.onClicked.addListener((tab) => {
  chrome.tabs.create({ url: PROTON_DOMAIN });
});

function checkOrCreateAlarm(){
  chrome.alarms.get(ALARM_NAME, function(alarm) {
    if (!alarm) {
        chrome.alarms.create(ALARM_NAME, {
            when: Date.now(),
            periodInMinutes: ALARM_TIME_MINUTES
        });
    }else{
      console.log("Alarm exists "+JSON.stringify(alarm))
    }
  });
}

// event: alarm raised
function onAlarm(alarm) {
  if(alarm.name == ALARM_NAME){
      console.log("Refresh triggerd "+Date.now())
      reloadCountInBackground();
  }
}

chrome.alarms.onAlarm.addListener(onAlarm);