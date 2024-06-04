let inboxTitleLoadingTimeoutId;

getAllTabs = async () => {
    const query = {
        currentWindow: true
    };
    const tabs = await new Promise((resolve, reject) => {
        chrome.tabs.query(query, (result) => {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
            }
            else {
                resolve(result);
            }
        });
    });
    return tabs;
}

showBadge = async (count) => {
    clearTimeout(inboxTitleLoadingTimeoutId);
    await chrome.action.setBadgeBackgroundColor({ color: '#6d4aff' });
    await chrome.action.setBadgeTextColor({ color: '#fff' });
    await chrome.action.setBadgeText({ text: count.toString() });
};

showCountFromStorage = async () => {
    CountStorage.getCount((savedCount) => {
        if (savedCount !== null && savedCount !== 0) {
            showBadge(savedCount);
        }
    });
}

isProtonMailTabOpen = async () => {
    const tabs = await getAllTabs();
    let matchedTab = null;
    for (const tab of tabs) {
        if (isCurrentTabProtonMailInbox(tab.url)) {
            matchedTab = tab;
            break;
        }
    }
    return matchedTab
}

checkOrCreateAlarm = async () => {
    chrome.alarms.get(ALARM_NAME, function (alarm) {
        if (!alarm) {
            chrome.alarms.create(ALARM_NAME, {
                when: Date.now(),
                periodInMinutes: ALARM_TIME_MINUTES
            });
        } else {
            let time = new Date(alarm.scheduledTime);
            console.log("Alarm exists " + time.toLocaleString())
        }
    });
}

refreshCountInBackground = async () => {
    let inboxOpened = await isProtonMailTabOpen()
    if (inboxOpened) {
        console.log("Background tab skipped, inbox is open already");
        return;
    }
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        if (tabs.length > 0) {
            try {
                chrome.tabs.create({
                    url: PROTON_DOMAIN,
                    pinned: true,
                    active: false
                }, (tab) => {
                    console.log("Backgroud tab opened");
                    if (!tab) {
                        console.error('Backgroud tab is undefined');
                        return;
                    }
                    closeTab(tab.id)
                });
            } catch (error) {
                console.error("An error occurred:", error);
            }
        } else {
            console.log("No active tab found.");
        }
    });
}

closeTab = async (tabId) => {
    try {
        await delay(LOADING_TIME_FOR_PROTON_MAIL_INBOX);
        if (chrome.runtime.lastError) {
            console.error(`Error creating tab: ${chrome.runtime.lastError.message}`);
            return;
        }
        updateCountAndShowBadge();
        chrome.tabs.remove(tabId);
        console.log("Backgroud tab closed");
    } catch (error) {
        console.error("Error closing background tab:", error);
    }
}

updateCountAndShowBadge = async () => {
    const tabs = await getAllTabs();
    let matchedTab = null;

    for (const tab of tabs) {
        if (isCurrentTabProtonMailInbox(tab.url)) {
            matchedTab = tab;
            break;
        }
    }

    if (matchedTab) {
        const count = parseUnreadCountFromTabTitle(matchedTab.title);
        CountStorage.saveCount(count);
        if (count == 0) {
            clearBadge();
        }
        else {
            showBadge(count);
        }
    } else {
        showCountFromStorage()
    }
}

function parseUnreadCountFromTabTitle(text) {
    const match = text.match(/\((\d+)\)/);
    return match ? parseInt(match[1], 10) : 0;
}

function isCurrentTabProtonMailInbox(url) {
    return url.includes("mail.proton.me") && url.includes("inbox")
}

const clearBadge = async (count) => {
    if (inboxTitleLoadingTimeoutId) {
        clearTimeout(inboxTitleLoadingTimeoutId);
    }
    inboxTitleLoadingTimeoutId = setTimeout(async () => {
        await chrome.action.setBadgeText({ text: '' });
    }, LOADING_TIME_FOR_INBOX_TITLE_UPDATE);
};

