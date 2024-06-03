const COUNT_KEY = 'proton_count';

const toPromise = (callback) => {
    const promise = new Promise((resolve, reject) => {
        try {
            callback(resolve, reject);
        }
        catch (err) {
            reject(err);
        }
    });
    return promise;
}

class CountService {

	
    static getCount = async () => {
        const promise = toPromise((resolve, reject) => {
            chrome.storage.local.get([COUNT_KEY], (items) => {
                if (chrome.runtime.lastError)
                    reject(chrome.runtime.lastError);
                resolve(items[COUNT_KEY] ?? 0);
            });
        });

        return promise;
    }
    
    static saveCount = async (count) => {
        const promise = toPromise((resolve, reject) => {
            chrome.storage.local.set({ [COUNT_KEY]: count }, () => {          
                if (chrome.runtime.lastError)
                    reject(chrome.runtime.lastError);
                resolve(count);
            });
        });
        return promise;
    }
    
    static clearCount = () => {
        const promise = toPromise((resolve, reject) => {
            chrome.storage.local.remove([COUNT_KEY], () => {
                if (chrome.runtime.lastError)
                    reject(chrome.runtime.lastError);
                resolve();
            });
        });
        return promise;
    }

}