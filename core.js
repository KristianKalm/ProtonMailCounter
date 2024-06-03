getAllTabs = async () => {
    const query = { currentWindow: true };
    const tabs = await new Promise((resolve, reject) => {
        chrome.tabs.query(query, (result) => {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
            } else {
                resolve(result);
            }
        });
    });
    return tabs;
}

const TIMEOUT_CLEAR_BADGE = 1000;
let timeoutId;
const clearBadge = async (count) => {
  // Clear previous timeout if it exists
  if (timeoutId) {
    clearTimeout(timeoutId);
  }

  // Set a new timeout
  timeoutId = setTimeout(async () => {
	await chrome.action.setBadgeText({ text: '' });
  }, TIMEOUT_CLEAR_BADGE);
};


const showBadge = async (count) => {
    clearTimeout(timeoutId);
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

function reloadCountInBackground() {
    try {
        chrome.tabs.create({ url: PROTON_DOMAIN, pinned: true, active: false  }, (tab) => {
        const tabId = tab.id;
        setTimeout(() => {
            updateCountAndShowBadge();
            chrome.tabs.remove(tabId);
        }, 5000);
        });
    } catch (error) {
        console.error("An error occurred:", error);
    }
}

updateCountAndShowBadge = async () => {
    const tabs = await getAllTabs();
    let matchedTab = null;
    
    for (const tab of tabs) {
        if (tab.url.includes(PROTON_DOMAIN_MAIL) && tab.url.includes(PROTON_DOMAIN_INBOX)) {
            matchedTab = tab;
            break;
        }
    }
    
    if (matchedTab) {
        const count = extractNumber(matchedTab.title);
        await CountStorage.saveCount(count);
        if (count == 0) {
            clearBadge();
        } else {
            showBadge(count);
        }
    } else {
        showStoredCount()
    }
}


function extractNumber(text) {
    const match = text.match(/\((\d+)\)/);
    return match ? parseInt(match[1], 10) : 0;
}

const UNREAD_COUNT = 'proton_unread_count';
class CountStorage {
    
    static getCount(callback) {        
        chrome.storage.local.get([UNREAD_COUNT], (result) => {
            const count = result[UNREAD_COUNT];
            if (typeof count === 'undefined') {
                callback(0); 
            } else {
                callback(count);
            }
        });
    }
    
    static saveCount(count) {        
        chrome.storage.local.set({ [UNREAD_COUNT]: count }, (error) => {});
    }

    static clearCount() {
        chrome.storage.local.remove([UNREAD_COUNT], (error) => {});
    }

}