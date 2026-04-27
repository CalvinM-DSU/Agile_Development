import { useEffect, useState } from 'react'
import type { DurationOption, PriorityOption, TimeBlock } from './DragHelpers'

type EditEventModalProps = {
  block: TimeBlock
  timeSlots: string[]
  onClose: () => void
  onSave: (updatedBlock: TimeBlock) => void
}

function EditEventModal({
  block,
  timeSlots,
  onClose,
  onSave,
}: EditEventModalProps) {
  const [time, setTime] = useState(block.time)
  const [duration, setDuration] = useState<DurationOption>(block.duration)
  const [priority, setPriority] = useState<PriorityOption>(block.priority)
  const [details, setDetails] = useState(block.details)

  useEffect(() => {
    setTime(block.time)
    setDuration(block.duration)
    setPriority(block.priority)
    setDetails(block.details)
  }, [block])

  function handleSave() {
    const trimmedDetails = details.trim()

    if (!trimmedDetails) return

    onSave({
      ...block,
      time,
      duration,
      priority,
      details: trimmedDetails,
    })
  }

  return (
    <div className="popup-overlay" onClick={onClose}>
      <div
        className="popup-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-event-title"
      >
        <div className="popup-header">
          <h3 id="edit-event-title">Edit Event</h3>
          <button
            type="button"
            className="popup-close"
            onClick={onClose}
            aria-label="Close edit modal"
          >
            ×
          </button>
        </div>

        <div className="edit-form">
          <div className="control-group">
            <label htmlFor="edit-time">Start time</label>
            <select
              id="edit-time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            >
              {timeSlots.map((slot) => (
                <option key={slot} value={slot}>
                  {slot}
                </option>
              ))}
            </select>
          </div>

          <div className="control-group">
            <label htmlFor="edit-duration">Duration</label>
            <select
              id="edit-duration"
              value={duration}
              onChange={(e) =>
                setDuration(Number(e.target.value) as DurationOption)
              }
            >
              <option value={10}>10 minutes</option>
              <option value={15}>15 minutes</option>
              <option value={30}>30 minutes</option>
              <option value={45}>45 minutes</option>
              <option value={60}>1 hour</option>
            </select>
          </div>

          <div className="control-group">
            <label htmlFor="edit-priority">Priority</label>
            <select
              id="edit-priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value as PriorityOption)}
            >
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          <div className="control-group">
            <label htmlFor="edit-details">Event details</label>
            <input
              id="edit-details"
              type="text"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Enter event details"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSave()
              }}
            />
          </div>

          <div className="edit-actions">
            <button type="button" className="edit-cancel-button" onClick={onClose}>
              Cancel
            </button>
            <button type="button" className="add-block-button" onClick={handleSave}>
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EditEventModal