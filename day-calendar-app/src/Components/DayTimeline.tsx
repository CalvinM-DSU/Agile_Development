import './DayTimeline.css'

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

function DayTimeline() {
  return (
    <section className="day-timeline">
      <h2>Daily Timeline</h2>
      <div className="timeline">
        {timeSlots.map((time) => (
          <div className="time-slot" key={time}>
            <div className="time-label">{time}</div>
            <div className="time-content"></div>
          </div>
        ))}
      </div>
    </section>
  )
}

export default DayTimeline