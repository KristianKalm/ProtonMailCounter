importScripts('count.service.js');

function extractNumber(text) {
		const match = text.match(/\((\d+)\)/);
		return match ? parseInt(match[1], 10) : 0;
}
	
getActiveTab = async () => {
    const query = { active: true, currentWindow: true };
    const tabs = await new Promise((resolve, reject) => {
        chrome.tabs.query(query, (result) => {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
            } else {
                resolve(result);
            }
        });
    });
    return tabs[0];
}

clearBadge = async () => {
	await chrome.action.setBadgeText({ text: '' });
}
	
showBadge = async (count) => {
	await chrome.action.setBadgeBackgroundColor({ color: '#6d4aff' });
	await chrome.action.setBadgeTextColor ({ color: '#fff' });
	await chrome.action.setBadgeText({ text: count.toString() });
}

updateBadge = async () => {
	const tab = await getActiveTab();
	if(tab.url.includes("mail.proton.me") && tab.url.includes("inbox")){
		var count = extractNumber(tab.title);
		if(count == 0){
			clearBadge();
		}else{
			await CountService.saveCount(count);
			showBadge(count);
		}
	}else{
		const savedCount = await CountService.getCount(count);
		showBadge(savedCount);
	}
}



chrome.action.onClicked.addListener((tab) => {
  chrome.tabs.create({ url: 'https://mail.proton.me/' });
});

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
	await updateBadge();
});

chrome.tabs.onCreated.addListener(async tab => {
    await updateBadge();
});

