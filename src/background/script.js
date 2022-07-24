chrome.runtime.onInstalled.addListener(details => {
  if (details.reason == 'install') {
    chrome.storage.local.set({
      isAutoRead: true,
      generateQRcodeValue: 'https://prohetamine.ru',
      route: 'home'
    })
  }
})

chrome.runtime.onStartup.addListener(function() {
  chrome.alarms.create({ delayInMinutes: 0.01, periodInMinutes: 0.01 })
})

chrome.alarms.onAlarm.addListener(async alarm => {
  const { isAutoRead } = await chrome.storage.local.get('isAutoRead')

  try {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true })

    const tabUrl = tabs[0].url

    if (isAutoRead) {
      chrome.tabs.captureVisibleTab(null, {}, dataUrl => {
        chrome.storage.local.set({ tabUrl, dataUrl, isAuto: true })
      })
    } else {
      chrome.storage.local.set({ tabUrl, dataUrl: 'null', isAuto: true })
    }
  } catch (e) {}
})
