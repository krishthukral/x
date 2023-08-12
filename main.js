// await ext.windows.create({
  
//   })
  console.log('Hello World!')

ext.runtime.onEnable.addListener(() => {
  console.log('Extension Enabled')
})

let tabOne = null
let windowOne = null
let websessionOne = null
let webviewOne = null

ext.runtime.onExtensionClick.addListener(async () => {
  console.log('Extension Clicked')
  if (!tabOne) {
    tabOne = await ext.tabs.create({ text: 'Tutorial Tab', mutable: true, muted: false })
    windowOne = await ext.windows.create({
      title: 'Frameless window',
      frame: false,
      opacity: 0.2,
      transparency: true
    })
    websessionOne = await ext.websessions.create({ partition: 'Tutorial Extension', persistent: true, global: false, cache: true });
    const windowOneSize = await ext.windows.getSize(windowOne.id)
    webviewOne = await ext.webviews.create({
      window: windowOne,
      websession: websessionOne,
      bounds: { x: 0, y: 25, width: windowOneSize.width, height: windowOneSize.height - 25 },
      autoResize: { width: true, height: true }
    })
    await ext.webviews.loadFile(webviewOne.id, "index.html")
  }
})

ext.tabs.onClickedMute.addListener(async (_event, tab) => {
  await ext.tabs.update(tab.id, { muted: !tab.muted })
  if (webviewOne && webviewOne.id) {
    await ext.webviews.setAudioMuted(webviewOne.id, !tab.muted)
  }
})

ext.tabs.onClicked.addListener(async () => {
  if (windowOne && windowOne.id) {
    await ext.windows.restore(windowOne.id)
    await ext.windows.focus(windowOne.id)
  }
})

ext.tabs.onClickedClose.addListener(async () => {
  if (tabOne && tabOne.id) {
    await ext.tabs.remove(tabOne.id)
    tabOne = null
  }
  if (windowOne && windowOne.id) {
    await ext.windows.remove(windowOne.id)
    windowOne = null
  }
})

ext.windows.onClosed.addListener(async () => {
  if (tabOne && tabOne.id) {
    await ext.tabs.remove(tabOne.id)
    tabOne = null
  }
})

ext.webviews.onPageTitleUpdated.addListener(async (_event, details) => {
  if (windowOne && windowOne.id) {
    await ext.windows.setTitle(windowOne.id, details.title)
  }
  if (tabOne && tabOne.id) {
    await ext.tabs.update(tabOne.id, { text: details.title })
  }
})