chrome.runtime.onMessage.addListener((msg) => {
  if (msg.action !== "start-fiverr-process") return
  main()
})

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name !== "create-tab") return

  if (!(await check())) return
  createRandomTab()

  await chrome.alarms.clear("create-tab")

  chrome.alarms.create("create-tab", {
    delayInMinutes: await getRandomMinutes()
  })
})

async function getRandomMinutes() {
  const { upperLimit, lowerLimit } = await chrome.storage.local.get([
    "upperLimit",
    "lowerLimit"
  ])

  const randomMinute =
    Math.random() * (Number(upperLimit) - Number(lowerLimit)) +
    Number(lowerLimit)

  chrome.storage.local.set({ alarmTime: Date.now() + randomMinute * 60 * 1000 })
  return randomMinute
}

async function main() {
  createRandomTab()

  chrome.alarms.create("create-tab", {
    delayInMinutes: await getRandomMinutes()
  })
}
async function check() {
  const { isRunning } = await chrome.storage.local.get(["isRunning"])
  if (isRunning === false) {
    chrome.alarms.clear("create-tab")
    return false
  }
  return true
}

async function createRandomTab() {
  if (!(await check())) return
  const { links: linksStorage } = await chrome.storage.local.get(["links"])

  if (!linksStorage) return

  const links = linksStorage.split(",").map((link) => link.trim())
  const randomValue = Math.floor(Math.random() * links.length)

  const randomLink = links[randomValue]

  const tabId = await getTabData()
  if (tabId)
    chrome.tabs.update(tabId, { url: randomLink })

  else {

    const tab = await chrome.tabs.create({
      url: randomLink,
      active: false
    })

    chrome.storage.local.set({ tabId: tab.id })

  }
}

async function getTabData() {
  try {

    const { tabId: id } = await chrome.storage.local.get(["tabId"])

    if (!id) return false
    await chrome.tabs.get(id)

    return id

  } catch (error) {

    console.log(error)
    return false

  }
}
