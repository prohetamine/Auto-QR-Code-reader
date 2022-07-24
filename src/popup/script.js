const domload = () => new Promise(res => window.onload = res)

const dataURItoBlob = dataURI => {
  const byteString = atob(dataURI.split(',')[1]);
  const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0]
  const ab = new ArrayBuffer(byteString.length)
  const ia = new Uint8Array(ab)
  for (var i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i)
  }
  const bb = new Blob([ab])
  return bb
}

const saveQRcode = qrcode => {
  const canvas = document.createElement('canvas')
      , ctx = canvas.getContext('2d')

  canvas.width = 266
  canvas.height = 266
  ctx.fillRect(0, 0, 266, 266)
  ctx.drawImage(qrcode._oDrawing._elImage, 5, 5, 256, 256)

  const imgData = ctx.getImageData(0, 0, 266, 266)
      , data = imgData.data

  for (let i = 0; i < data.length; i += 4) {
    data[i+0] = 255 - data[i+0]
    data[i+1] = 255 - data[i+1]
    data[i+2] = 255 - data[i+2]
  }

  ctx.putImageData(imgData, 0, 0)

  const base64 = canvas.toDataURL('image/jpg')

  const url = window.webkitURL || window.URL || window.mozURL || window.msURL
  const a = document.createElement('a')
  a.download = 'qrcode.jpg'
  a.href = url.createObjectURL(dataURItoBlob(base64, 'jpg'))
  a.dataset.downloadurl = ['jpg', a.download, a.href].join(':')
  a.click()
}

;(async () => {
  await domload()

  const home                  = document.querySelector('.home')
      , gencode               = document.querySelector('.gencode')
      , homeLink              = document.querySelector('.home > .link')
      , gencodeLink           = document.querySelector('.gencode > .link')
      , autoReadButton        = document.querySelector('.home > .button')
      , autoReadButtonBall    = document.querySelector('.home > .button > .ball')
      , bigButton             = document.querySelector('.home > .big-button')
      , download              = document.querySelector('.gencode > .download')
      , input                 = document.querySelector('.gencode > input')
      , linkButton            = document.querySelector('.gencode > .link-button')
      , textButton            = document.querySelector('.gencode > .text-button')
      , qrcodeNode            = document.getElementById('qrcode')

  const { route, isAutoRead, generateQRcodeValue } = await chrome.storage.local.get(['route', 'isAutoRead', 'generateQRcodeValue'])

  input.value = generateQRcodeValue
  autoReadButtonBall.style.animationName = isAutoRead ? 'on' : 'off'

  if (route !== 'home') {
    home.style.animationDuration = '0s'
    gencode.style.animationDuration = '0s'
    home.style.animationName = 'hide'
    gencode.style.animationName = 'show'
  }

  bigButton.addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      try {
        const tabUrl = tabs[0].url

        chrome.tabs.captureVisibleTab(null, {}, dataUrl => {
          chrome.storage.local.set({ tabUrl, dataUrl, isAuto: false })
        })
      } catch (e) {}
    })
  })

  homeLink.addEventListener('click', async () => {
    home.style.animationName = 'hide'
    gencode.style.animationName = 'show'
    home.style.animationDuration = '1s'
    gencode.style.animationDuration = '1s'
    await chrome.storage.local.set({ route: 'gencode' })
  })

  gencodeLink.addEventListener('click', async () => {
    home.style.animationName = 'show'
    gencode.style.animationName = 'hide'
    home.style.animationDuration = '1s'
    gencode.style.animationDuration = '1s'
    await chrome.storage.local.set({ route: 'home' })
  })

  autoReadButton.addEventListener('click', async () => {
    const { isAutoRead } = await chrome.storage.local.get('isAutoRead')
    await chrome.storage.local.set({ isAutoRead: !isAutoRead })
    autoReadButtonBall.style.animationName = !isAutoRead ? 'on' : 'off'
  })

  const qrcode = new QRCode(
    document.getElementById('qrcode'),
    {
      text: generateQRcodeValue,
      colorDark : "#ffffff",
      colorLight : "#ffffff00",
      correctLevel : QRCode.CorrectLevel.H
    }
  )

  download.addEventListener('click', () => {
    saveQRcode(qrcode)
  })

  qrcodeNode.addEventListener('click', () => {
    saveQRcode(qrcode)
  })

  input.addEventListener('input', async ({ target: { value } }) => {
    await chrome.storage.local.set({ generateQRcodeValue: value })
    qrcode.makeCode(value)
  })

  linkButton.addEventListener('click', async () => {
    await chrome.storage.local.set({ generateQRcodeValue: 'https://' })
    input.value = 'https://'
    qrcode.makeCode('https://')
  })

  textButton.addEventListener('click', async () => {
    await chrome.storage.local.set({ generateQRcodeValue: '' })
    input.value = ''
    qrcode.makeCode('')
  })
})()
