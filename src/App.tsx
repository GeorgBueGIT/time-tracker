import { useState, useEffect } from 'react'
import './App.css'
import { ClearOutlined, PlusCircleOutlined } from '@ant-design/icons'
import { TimePicker, Input } from 'antd';
import dayjs from 'dayjs'


const { TextArea } = Input;

type TimeRange = {
  start: string
  end: string
}

type Entry = {
  project: string
  times: TimeRange[]
  comment?: string
}


function App() {

  const [entries, setEntries] = useState<Entry[]>(() => {
    const saved = localStorage.getItem('entries')
    return saved ? JSON.parse(saved) : [{ project: '', times: [{ start: '', end: '' }], comment: '' }]
  })



  useEffect(() => {
    const savedEntries = localStorage.getItem('entries')
    if (savedEntries) {
      setEntries(JSON.parse(savedEntries))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('entries', JSON.stringify(entries))
  }, [entries])



  const addEmptyEntry = () => {
    const newEntry: Entry = {
      project: '',
      times: [{ start: '', end: '' }],
      comment: ''
    }
    setEntries([...entries, newEntry])
  }

  const calculateTotalTime = (times: TimeRange[]): string => {
    let totalMinutes = 0
    for (const { start, end } of times) {
      if (!start || !end) continue
      const startParts = start.split(':').map(Number)
      const endParts = end.split(':').map(Number)
      if (startParts.length !== 2 || endParts.length !== 2) continue

      const startMins = startParts[0] * 60 + startParts[1]
      const endMins = endParts[0] * 60 + endParts[1]

      if (endMins > startMins) {
        totalMinutes += endMins - startMins
      }
    }
    const h = Math.floor(totalMinutes / 60)
    const m = totalMinutes % 60
    return `${h}h ${m}min`
  }

  const clearEntries = () => {
    const confirmed = window.confirm("Are you sure you want to clear all entries? This action cannot be undone.");
    if (confirmed) {
      setEntries([
        {
          project: '',
          times: [{ start: '', end: '' }],
          comment: ''
        }
      ])
    }

  }

  const addTimeRange = (entryIndex: number) => {
    const updated = [...entries]
    updated[entryIndex].times.push({ start: '', end: '' })
    setEntries(updated)
  }

  const handleTimeChange = (entryIndex: number, timeIndex: number, field: 'start' | 'end', value: string) => {
    const updated = [...entries]
    updated[entryIndex].times[timeIndex][field] = value
    setEntries(updated)
  }

  const updateProject = (entryIndex: number, value: string) => {
    const updated = [...entries]
    updated[entryIndex].project = value
    setEntries(updated)
  }

  const updateComment = (entryIndex: number, value: string) => {
    const updated = [...entries]
    updated[entryIndex].comment = value
    setEntries(updated)
  }



  const renderEntries = () => {
    return (
      <>
        <div className='Entry-container col-12'>
          {entries.map((entry, entryIndex) => (
            <div key={entryIndex}>
              <Input
                value={entry.project}
                onChange={(e) => updateProject(entryIndex, e.target.value)}
                placeholder="Project"
              />

              {entry.times.map((range, timeIndex) => (
                <div key={timeIndex} className="d-flex gap-2">
                  <TimePicker
                    format="HH:mm"
                    value={range.start ? dayjs(range.start, 'HH:mm') : null}
                    onChange={(value) => handleTimeChange(entryIndex, timeIndex, 'start', value?.format('HH:mm') || '')}
                  />
                  <TimePicker
                    format="HH:mm"
                    value={range.end ? dayjs(range.end, 'HH:mm') : null}
                    onChange={(value) => handleTimeChange(entryIndex, timeIndex, 'end', value?.format('HH:mm') || '')}
                  />
                </div>
              ))}

              <button onClick={() => addTimeRange(entryIndex)}>+ Zeitintervall</button>
              <p><strong>Gesamtzeit:</strong> {calculateTotalTime(entry.times)}</p>

              <TextArea
                value={entry.comment}
                onChange={(e) => updateComment(entryIndex, e.target.value)}
              />
            </div>
          ))}

        </div>
        <button className="col-2" onClick={addEmptyEntry}><PlusCircleOutlined /></button>
        <button className="col-2" onClick={clearEntries}><ClearOutlined /></button>
      </>
    )
  }

  return (
    <div className='d-flex vh-100 vw-100 align-items-center justify-content-center'>
      <div className='row'>
        <h1> Track your time </h1>
        {renderEntries()}
      </div>
    </div>
  )
}

export default App
