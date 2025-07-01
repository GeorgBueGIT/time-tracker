import { useState, useEffect } from 'react'
import './App.css'
import { ClearOutlined, PlusCircleOutlined } from '@ant-design/icons'
import { TimePicker, Input } from 'antd';
import dayjs from 'dayjs'
import { Tooltip } from 'antd'

const { TextArea } = Input;

type TimeRange = {
  start: string
  end: string
}

type Entry = {
  project: string
  ticket?: string
  times: TimeRange[]
  comment?: string
}

function App() {

  const [entries, setEntries] = useState<Entry[]>(() => {
    const saved = localStorage.getItem('entries')
    return saved ? JSON.parse(saved) : [{ project: '', ticket: '', times: [{ start: '', end: '' }], comment: '' }]
  })

  useEffect(() => {
    const totalMinutes = Object.values(calculateProjectTimes()).reduce((a, b) => a + b, 0);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    document.title = `${hours}h ${minutes}min - Time Tracker`;
  }, [entries]);


  useEffect(() => {
    const savedEntries = localStorage.getItem('entries')
    if (savedEntries) {
      setEntries(JSON.parse(savedEntries))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('entries', JSON.stringify(entries))
  }, [entries])

  const calculateProjectTimes = () => {
    const result: Record<string, number> = {}
    for (const entry of entries) {
      const time = entry.times.reduce((sum, { start, end }) => {
        if (!start || !end) return sum
        const [sh, sm] = start.split(':').map(Number)
        const [eh, em] = end.split(':').map(Number)
        const startMins = sh * 60 + sm
        const endMins = eh * 60 + em
        return sum + Math.max(0, endMins - startMins)
      }, 0)
      if (entry.project) {
        result[entry.project] = (result[entry.project] || 0) + time
      }
    }
    return result
  }

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

  const removeEntry = (indexToRemove: number) => {
    setEntries(entries.filter((_, i) => i !== indexToRemove))
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

  const updateTicket = (entryIndex: number, value: string) => {
    const updated = [...entries]
    updated[entryIndex].ticket = value
    setEntries(updated)
  }

  const projectColor = (index: number): string => {
    const colors = [
      '#4F46E5', // Indigo
      '#10B981', // Emerald
      '#F59E0B', // Amber
      '#EF4444', // Red
      '#3B82F6', // Blue
      '#8B5CF6', // Violet
      '#EC4899', // Pink
    ]
    return colors[index % colors.length]
  }

  const renderProjectProgress = () => {
    const projectTimes = calculateProjectTimes()
    const totalMinutes = Object.values(projectTimes).reduce((a, b) => a + b, 0)
    const maxMinutes = 8 * 60 // 8 Stunden

    return (
      <div className="mb-4">
        <div className="d-flex justify-content-between align-items-center mb-1">
          <strong>Total: {Math.floor(totalMinutes / 60)}h {totalMinutes % 60}min / 8h</strong>
        </div>
        <div className="d-flex rounded overflow-hidden" style={{ height: 24, background: '#f0f0f0' }}>
          {Object.entries(projectTimes).map(([project, minutes], index) => {
            const width = `${(minutes / maxMinutes) * 100}%`
            return (
              <Tooltip
                key={project}
                title={`${project}: ${Math.floor(minutes / 60)}h ${minutes % 60}min`}
              >
                <div
                  style={{
                    width,
                    backgroundColor: projectColor(index),
                    transition: 'width 0.3s',
                    height: '100%',
                    cursor: 'pointer'
                  }}
                />
              </Tooltip>
            )
          })}

        </div>
      </div>
    )
  }

  const renderEntries = () => {
    return (
      <>
        <div className="Entry-container col-12 p-0">
          {entries.map((entry, entryIndex) => (
            <div
              key={entryIndex}
              className="border rounded p-3 mb-4 bg-light d-flex align-items-start gap-3 flex-wrap"
            >
              <div className="d-flex flex-column flex-shrink-0" style={{ width: 350 }}>
                <Input
                  value={entry.project}
                  onChange={(e) => updateProject(entryIndex, e.target.value)}
                  placeholder="Project"
                />

                <Input
                  value={entry.ticket}
                  onChange={(e) => updateTicket(entryIndex, e.target.value)}
                  placeholder="Ticket-Link"
                  className="mt-1"
                  type="url"
                />

                {entry.ticket && (
                  <a
                    href={entry.ticket}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="d-block mt-1 text-primary text-decoration-underline"
                  >
                    Open Ticket
                  </a>
                )}
              </div>

              <div className="d-flex flex-column gap-1">
                {entry.times.map((range, timeIndex) => (
                  <div key={timeIndex} className="d-flex gap-2">
                    <TimePicker
                      format="HH:mm"
                      minuteStep={5}
                      inputReadOnly={false}
                      value={range.start ? dayjs(range.start, 'HH:mm') : null}
                      onChange={(value) =>
                        handleTimeChange(
                          entryIndex,
                          timeIndex,
                          'start',
                          value?.format('HH:mm') || ''
                        )
                      }
                    />
                    <TimePicker
                      format="HH:mm"
                      minuteStep={5}
                      inputReadOnly={false}
                      use12Hours={false}
                      value={range.end ? dayjs(range.end, 'HH:mm') : null}
                      onChange={(value) =>
                        handleTimeChange(
                          entryIndex,
                          timeIndex,
                          'end',
                          value?.format('HH:mm') || ''
                        )
                      }
                    />
                  </div>
                ))}

                <button
                  className="btn btn-sm btn-outline-primary mt-1"
                  onClick={() => addTimeRange(entryIndex)}
                >
                  + Time Slot
                </button>
              </div>

              <p className="m-0"><strong>{calculateTotalTime(entry.times)}</strong></p>

              <TextArea
                value={entry.comment}
                onChange={(e) => updateComment(entryIndex, e.target.value)}
                autoSize={{ minRows: 4, maxRows: 6 }}
                style={{ minWidth: '250px', flex: 1 }}
                className="flex-grow-1"
              />
              <button
                className="btn btn-sm btn-outline-danger align-self-start"
                onClick={() => removeEntry(entryIndex)}
              >
                Remove
              </button>


            </div>
          ))}
        </div>

        <div className="d-flex gap-2">
          <button className="btn btn-success" onClick={addEmptyEntry}>
            <PlusCircleOutlined /> New Entry
          </button>
          <button className="btn btn-danger" onClick={clearEntries}>
            <ClearOutlined /> Clear
          </button>
        </div>
      </>
    )
  }

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center px-3 py-5">
      <div className="wrapper">
        {renderProjectProgress()}
        <h1 className="mb-4">Track your time</h1>
        {renderEntries()}
      </div>
    </div>
  )
}

export default App
