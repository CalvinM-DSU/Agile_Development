const router = require('express').Router()
const Schedule = require('../models/Schedule')

router.get('/:date', async (req, res) => {
  try {
    const schedule = await Schedule.findOne({ date: req.params.date })
    res.json(schedule || { blocks: [] })
  } catch (err) {
    console.error('GET ERROR:', err)
    res.status(500).json({ error: 'Server error' })
  }
})

router.post('/', async (req, res) => {
  try {
    const { date, blocks } = req.body

    const schedule = await Schedule.findOneAndUpdate(
      { date },
      { blocks },
      { upsert: true, returnDocument: 'after' }
    )

    res.json(schedule)
  } catch (err) {
    console.error('POST ERROR:', err)
    res.status(500).json({ error: 'Server error' })
  }
})

module.exports = router