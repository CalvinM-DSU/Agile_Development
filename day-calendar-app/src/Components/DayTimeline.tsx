import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import './DayTimeline.css'
import {
  moveBlockToTime,
  reorderBlocksWithinTime,
  type TimeBlock,
  type DurationOption,
  type PriorityOption,
} from './DragHelpers'
import EditEventModal from './EditEventModal'

import { useEffect } from 'react' // for backend integration

const timeSlots = [
  '10:00 AM',
  '11:00 AM',
  '12:00 PM',
  '1:00 PM',
  '2:00 PM',
  '3:00 PM',
  '4:00 PM',
  '5:00 PM',
  '6:00 PM',
]

const durationWidths: Record<DurationOption, string> = {
  10: '16.6667%',
  15: '25%',
  30: '50%',
  45: '75%',
  60: '100%',
}

const blockSpring = {
  type: 'spring' as const,
  damping: 30,
  stiffness: 220,
}

function DayTimeline() {
  const [selectedTime, setSelectedTime] = useState<string>('10:00 AM')
  const [selectedDuration, setSelectedDuration] = useState<DurationOption>(15)
  const [details, setDetails] = useState<string>('')
  const [priority, setPriority] = useState<PriorityOption>('medium')
  const [blocks, setBlocks] = useState<TimeBlock[]>([])
  const [selectedBlock, setSelectedBlock] = useState<TimeBlock | null>(null)
  const [editingBlock, setEditingBlock] = useState<TimeBlock | null>(null)
  const [draggedBlockId, setDraggedBlockId] = useState<number | null>(null)
  const [currentDate, setCurrentDate] = useState(
  new Date().toISOString().split('T')[0]) // YYYY-MM-DD
  const [loaded, setLoaded] = useState(false)

useEffect(() => {
  async function fetchSchedule() {
    const res = await fetch(
      `http://localhost:5000/api/schedule/${currentDate}`
    )

    const data = await res.json()
    setBlocks(data.blocks || [])
    setLoaded(true)
  }

  fetchSchedule()
}, [currentDate])

useEffect(() => {
  if (!loaded) return

  async function saveSchedule() {
    await fetch('http://localhost:5000/api/schedule', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        date: currentDate,
        blocks,
      }),
    })
  }

  saveSchedule()
}, [blocks, currentDate, loaded])

  function handleAddBlock() {
    const trimmedDetails = details.trim()

    if (!trimmedDetails) return

    const newBlock: TimeBlock = {
      id: Date.now(),
      time: selectedTime,
      duration: selectedDuration,
      details: trimmedDetails,
      priority,
    }

    setBlocks((currentBlocks) => [...currentBlocks, newBlock])
    setDetails('')
    setPriority('medium')
    setSelectedDuration(15)
    setSelectedTime('10:00 AM')
  }

  function handleBlockClick(block: TimeBlock) {
    setSelectedBlock(block)
  }

  function closePopup() {
    setSelectedBlock(null)
  }

  function openEditModal() {
    if (!selectedBlock) return
    setEditingBlock(selectedBlock)
  }

  function closeEditModal() {
    setEditingBlock(null)
  }

  function handleSaveEditedBlock(updatedBlock: TimeBlock) {
    setBlocks((currentBlocks) =>
      currentBlocks.map((block) =>
        block.id === updatedBlock.id ? updatedBlock : block
      )
    )

    setSelectedBlock(updatedBlock)
    setEditingBlock(null)
  }

  function handleDragStart(id: number) {
    setDraggedBlockId(id)
  }

  function handleDragEnd() {
    setDraggedBlockId(null)
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault()
  }

  function handleDropOnTime(time: string) {
    if (draggedBlockId === null) return

    setBlocks((currentBlocks) =>
      moveBlockToTime(currentBlocks, draggedBlockId, time)
    )

    setDraggedBlockId(null)
  }

  function handleDropOnBlock(targetBlock: TimeBlock) {
    if (draggedBlockId === null) return

    setBlocks((currentBlocks) => {
      const draggedBlock = currentBlocks.find(
        (block) => block.id === draggedBlockId
      )

      if (!draggedBlock) return currentBlocks

      if (draggedBlock.time !== targetBlock.time) {
        const movedBlocks = moveBlockToTime(
          currentBlocks,
          draggedBlockId,
          targetBlock.time
        )

        return reorderBlocksWithinTime(
          movedBlocks,
          draggedBlockId,
          targetBlock.id
        )
      }

      return reorderBlocksWithinTime(
        currentBlocks,
        draggedBlockId,
        targetBlock.id
      )
    })

    setDraggedBlockId(null)
  }

  function handleDeleteBlock(id: number) {
    setBlocks((prev) => prev.filter((block) => block.id !== id))

    if (selectedBlock?.id === id) {
      setSelectedBlock(null)
    }

    if (editingBlock?.id === id) {
      setEditingBlock(null)
    }
  }

  const visibleTimes = timeSlots.filter((time) =>
    blocks.some((block) => block.time === time)
  )

  const hiddenTimes = timeSlots.filter(
    (time) => !blocks.some((block) => block.time === time)
  )

  return (
    <section className="day-timeline">
      <h2>Daily Timeline</h2>

      <div className="timeline-controls">
        <div className="control-group">
          <label>Select Date</label>
          <input
            type="date"
            value={currentDate}
            onChange={(e) => setCurrentDate(e.target.value)}
          />
          <label htmlFor="start-time">Start time</label>
          <select
            id="start-time"
            value={selectedTime}
            onChange={(e) => setSelectedTime(e.target.value)}
          >
            {timeSlots.map((time) => (
              <option key={time} value={time}>
                {time}
              </option>
            ))}
          </select>
        </div>

        <div className="control-group">
          <label htmlFor="duration">Duration</label>
          <select
            id="duration"
            value={selectedDuration}
            onChange={(e) =>
              setSelectedDuration(Number(e.target.value) as DurationOption)
            }
          >
            <option value={10}>10 minutes</option>
            <option value={15}>15 minutes</option>
            <option value={30}>30 minutes</option>
            <option value={45}>45 minutes</option>
            <option value={60}>1 hour</option>
          </select>
        </div>

        <div className="control-group control-group-details">
          <label htmlFor="details">Event details</label>
          <input
            id="details"
            type="text"
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            placeholder="Enter event details"
            onKeyDown={(e) => e.key === 'Enter' && handleAddBlock()}
          />
        </div>

        <div className="control-group">
          <label htmlFor="priority">Priority</label>
          <select
            id="priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value as PriorityOption)}
          >
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        <button className="add-block-button" onClick={handleAddBlock}>
          Add block
        </button>
      </div>

      <AnimatePresence initial={false}>
        {visibleTimes.length === 0 ? (
          <motion.div
            key="empty-timeline"
            className="timeline timeline-empty"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="time-content">
              <span className="empty-state">
                No events yet. Add a block to show a time slot.
              </span>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="timeline"
            className="timeline"
            layout
            transition={blockSpring}
          >
            <AnimatePresence initial={false}>
              {visibleTimes.map((time) => {
                const blocksForTime = blocks.filter((block) => block.time === time)

                return (
                  <motion.div
                    key={time}
                    className="time-slot"
                    layout
                    transition={blockSpring}
                  >
                    <div className="time-label">{time}</div>

                    <motion.div
                      className="time-content"
                      layout
                      transition={blockSpring}
                      onDragOver={handleDragOver}
                      onDrop={() => handleDropOnTime(time)}
                    >
                      <AnimatePresence initial={false}>
                        {blocksForTime.map((block) => (
                          <motion.div
                            key={block.id}
                            role="button"
                            tabIndex={0}
                            draggable
                            layout
                            initial={{ opacity: 0, scale: 0.92 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.92 }}
                            transition={blockSpring}
                            onDragStart={() => handleDragStart(block.id)}
                            onDragEnd={handleDragEnd}
                            onDragOver={handleDragOver}
                            onDrop={(e) => {
                              e.stopPropagation()
                              handleDropOnBlock(block)
                            }}
                            onClick={() => handleBlockClick(block)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault()
                                handleBlockClick(block)
                              }
                            }}
                            className={`time-block priority-${block.priority}`}
                            style={{ width: durationWidths[block.duration] }}
                          >
                            <div className="priority-strip" aria-hidden="true"></div>

                            <div className="time-block-details">{block.details}</div>

                            <button
                              type="button"
                              className="delete-btn"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDeleteBlock(block.id)
                              }}
                              aria-label={`Delete ${block.details}`}
                            >
                              ✕
                            </button>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </motion.div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence initial={false}>
        {hiddenTimes.length > 0 && (
          <motion.div
            className="collapsed-times-panel"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            layout
          >
            <p className="collapsed-times-title">Unused time slots</p>

            <motion.div className="collapsed-times-grid" layout transition={blockSpring}>
              {hiddenTimes.map((time) => (
                <motion.div
                  key={time}
                  className="collapsed-time-dropzone"
                  layout
                  transition={blockSpring}
                  onDragOver={handleDragOver}
                  onDrop={() => handleDropOnTime(time)}
                >
                  <span>{time}</span>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {selectedBlock && (
        <div className="popup-overlay" onClick={closePopup}>
          <div
            className="popup-card"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="block-popup-title"
          >
            <div className="popup-header">
              <h3 id="block-popup-title">Event Details</h3>
              <button
                type="button"
                className="popup-close"
                onClick={closePopup}
                aria-label="Close popup"
              >
                ×
              </button>
            </div>

            <div className="popup-content">
              <p>
                <strong>Time:</strong> {selectedBlock.time}
              </p>
              <p>
                <strong>Duration:</strong>{' '}
                {selectedBlock.duration === 60
                  ? '1 hour'
                  : `${selectedBlock.duration} mins`}
              </p>
              <p>
                <strong>Priority:</strong> {selectedBlock.priority}
              </p>
              <p>
                <strong>Details:</strong> {selectedBlock.details}
              </p>

              <div className="popup-actions">
                <button
                  type="button"
                  className="edit-event-button"
                  onClick={openEditModal}
                >
                  Edit Event
                </button>

                <button
                  type="button"
                  className="delete-btn-popup"
                  onClick={() => handleDeleteBlock(selectedBlock.id)}
                >
                  Delete Event
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {editingBlock && (
        <EditEventModal
          block={editingBlock}
          timeSlots={timeSlots}
          onClose={closeEditModal}
          onSave={handleSaveEditedBlock}
        />
      )}
    </section>
  )
}

export default DayTimeline