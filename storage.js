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
        chrome.storage.local.set({ [CountStorage.UNREAD_COUNT_KEY]: count }, (error) => { });
    }
    static clearCount() {
        chrome.storage.local.remove([CountStorage.UNREAD_COUNT_KEY], (error) => { });
    }
}