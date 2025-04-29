const express = require('express');
const router = express.Router();
const Worker = require('../models/worker');

// Submit Worker Form
router.post('/submit', async (req, res) => {
  const { name, location, skills, yearsofexperience, dailyrate, availability } = req.body;
  const worker = new Worker({ name, location, skills, yearsofexperience, dailyrate, availability});
  await worker.save();
  res.json({ message: 'Worker form submitted' });
});

module.exports = router;
