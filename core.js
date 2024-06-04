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



const showBadge = async (count) => {
    clearTimeout(inboxTitleLoadingTimeoutId);
    await chrome.action.setBadgeBackgroundColor({ color: '#6d4aff' });
    await chrome.action.setBadgeTextColor({ color: '#fff' });
    await chrome.action.setBadgeText({ text: count.toString() });
};

showStoredCount = async () => {
    CountStorage.getCount((savedCount) => {
        if (savedCount !== null && savedCount !== 0) {
            showBadge(savedCount);
        }
    });
}

isProtonMailTabOpen = async () => {
    const tabs = getAllTabs();
    let matchedTab = null;
    for (const tab of tabs) {
        if (isCurrentTabProtonMailInbox(tab.url)) {
            matchedTab = tab;
            break;
        }
    }
    return matchedTab
}

const LOADING_TIME_FOR_PROTON_MAIL_INBOX = 5000;
reloadCountInBackground = async () => {
    if(await isProtonMailTabOpen()){
        return;
    }
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        if (tabs.length > 0) {
            try {
                chrome.tabs.create({
                    url: PROTON_DOMAIN,
                    pinned: true,
                    active: false
                }, (tab) => {
                    console.log("Backgroud tab opened");
                    if (chrome.runtime.lastError) {
                        console.error(`Error creating tab: ${chrome.runtime.lastError.message}`);
                        return;
                    }
                    if (!tab) {
                        console.error('Tab is undefined');
                        return;
                    }
                    const tabId = tab.id;
                    setTimeout(() => {
                        try {
                            console.log("Backgroud tab closed");
                            updateCountAndShowBadge();
                            chrome.tabs.remove(tabId);
                        }catch (error) {
                            console.error("An error occurred:", error);
                        }
                    }, LOADING_TIME_FOR_PROTON_MAIL_INBOX);
                });
            }
            catch (error) {
                console.error("An error occurred:", error);
            }
        } else {
          console.log("No active tab found.");
        }
      });

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
    }
    else {
        showStoredCount()
    }
}

function parseUnreadCountFromTabTitle(text) {
    const match = text.match(/\((\d+)\)/);
    return match ? parseInt(match[1], 10) : 0;
}
function isCurrentTabProtonMailInbox(url){
    return url.includes("mail.proton.me") && url.includes("inbox")
}

const LOADING_TIME_FOR_INBOX_TITLE_UPDATE = 1000;
let inboxTitleLoadingTimeoutId;
const clearBadge = async (count) => {
    if (inboxTitleLoadingTimeoutId) {
        clearTimeout(inboxTitleLoadingTimeoutId);
    }
    inboxTitleLoadingTimeoutId = setTimeout(async () => {
        await chrome.action.setBadgeText({ text: '' });
    }, LOADING_TIME_FOR_INBOX_TITLE_UPDATE);
};

class CountStorage {
    static UNREAD_COUNT_KEY = 'proton_unread_count';
    static getCount(callback) {
        chrome.storage.local.get([CountStorage.UNREAD_COUNT_KEY], (result) => {
            const count = result[CountStorage.UNREAD_COUNT_KEY];
            if (typeof count === 'undefined') {
                callback(0);
            }
            else {
                callback(count);
            }
        });
    }

    static saveCount(count) {
        chrome.storage.local.set({
            [CountStorage.UNREAD_COUNT_KEY]: count
        }, (error) => {});
    }
    static clearCount() {
        chrome.storage.local.remove([CountStorage.UNREAD_COUNT_KEY], (error) => {});
    }
}