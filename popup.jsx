import { useEffect, useState } from "react"

import "./popup.css"

const popup = () => {
  const [links, setLinks] = useState("")
  const [state, setState] = useState(false)
  const [upperLimit, setUpperLimit] = useState(0)
  const [lowerLimit, setLowerLimit] = useState(0)
  const [alarmTime, setAlarmTime] = useState("")
  const [timeLeft, setTimeLeft] = useState("")

  useEffect(() => {
    chrome.storage.local
      .get(["links", "isRunning", "upperLimit", "lowerLimit", "alarmTime"])
      .then((data) => {
        setLinks(data.links)
        setState(!!data.isRunning)
        setUpperLimit(data.upperLimit)
        setLowerLimit(data.lowerLimit)
        setAlarmTime(data.alarmTime)
      })

    chrome.storage.onChanged.addListener((changes, area) => {
      if (area === "local")
        if (changes.alarmTime) setAlarmTime(changes.alarmTime.newValue)

    })

  }, [])

  useEffect(() => {
    if (!alarmTime) return

    const interval = setInterval(() => {
      const timeLeft = new Date(new Date(alarmTime) - Date.now()).toISOString().slice(11, 19)
      setTimeLeft(timeLeft)
    }, 1000)

    return () => clearInterval(interval)
  }, [alarmTime])

  function handleStart() {
    chrome.storage.local.set({ isRunning: true })
    setState(true)
    chrome.runtime.sendMessage({ action: "start-fiverr-process" })
  }

  function handleStop() {
    setState(false)
    chrome.storage.local.set({ isRunning: false })
  }

  function handleSave() {
    chrome.storage.local.set({ links, upperLimit, lowerLimit })
  }

  return (
    <div className="main">
      {!!state && <span className="alarm-time">{timeLeft}</span>}
      <span className="state">{!!state ? "Running" : "Stopped"}</span>

      <div className="time-limit">
        <button onClick={handleStart}>Start</button>
        <button onClick={handleStop} className="stop-button">Stop</button>
      </div>

      <textarea
        type="text"
        name="links"
        value={links}
        onChange={(e) => setLinks(e.target.value)}
      />
      <h2>Time Range (m)</h2>
      <div className="time-limit">
        <input
          type="number"
          name="upper-limit"
          value={upperLimit}
          onChange={(e) => setUpperLimit(e.target.value)}
        />
        <span>-</span>
        <input
          type="number"
          name="lower-limit"
          value={lowerLimit}
          onChange={(e) => setLowerLimit(e.target.value)}
        />
      </div>
      <button onClick={handleSave} className="save-button">Save</button>
    </div>
  )
}

export default popup
