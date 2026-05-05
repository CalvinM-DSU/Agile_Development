const mongoose = require('mongoose')

const ScheduleSchema = new mongoose.Schema({
  date: { type: String, required: true, unique: true },
  blocks: { type: Array, default: [] },
})

module.exports = mongoose.model('Schedule', ScheduleSchema)