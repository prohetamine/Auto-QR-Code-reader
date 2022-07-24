const domload = () => new Promise(res => window.onload = res)

const openQRCode = async () => {
  const { decodeText } = await chrome.storage.local.get('decodeText')
  try {
    const link = decodeText.match(/http(s?):\/\/.+/)[0]
    window.open(link)
  } catch (e) {
    const popupWindow = window.open('about:blank', 'text', 'width=500,height=360,left=80,top=80')
    popupWindow.document.write(decodeText)
  }
}

;(async () => {
  await domload()

  const main = document.createElement('div')
  main.className = 'auto-qr-code-reader_main'

  const qr_icon = document.createElement('div')
  qr_icon.className = 'auto-qr-code-reader_qr_icon'

  const text = document.createElement('div')
  text.className = 'auto-qr-code-reader_text'
  text.innerHTML = 'Open <b style="margin-left: 4px;">QR code</b> ?'

  const arrow = document.createElement('div')
  arrow.className = 'auto-qr-code-reader_arrow'

  document.querySelector('html').appendChild(main)

  main.appendChild(qr_icon)
  main.appendChild(text)
  main.appendChild(arrow)

  main.addEventListener('click', openQRCode)

  chrome.storage.local.onChanged.addListener(data => {
    chrome.storage.local.get(['tabUrl', 'isAuto']).then(async ({ tabUrl, isAuto }) => {
      if (data.dataUrl?.newValue && data.dataUrl.newValue !== data.dataUrl.oldValue && tabUrl === location.href) {
        QrScanner.scanImage(data.dataUrl.newValue)
          .then(async decodeText => {
            if (decodeText.length > 0) {
              await chrome.storage.local.set({ decodeText })
              if (isAuto) {
                main.style.bottom = '20px'
              } else {
                await openQRCode()
              }
            } else {
              await chrome.storage.local.set({ decodeText: '' })
              main.style.bottom = '-300px'
            }
          })
          .catch(async () => {
            await chrome.storage.local.set({ decodeText: '' })
            main.style.bottom = '-300px'
          })
      }
    })
  })
})()
