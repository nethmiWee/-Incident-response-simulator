const express = require('express');
const router = express.Router();

router.post('/trigger', (req, res) => {
  console.log('Video system triggered:', req.body);
  res.status(200).send({ message: 'Video camera recording started' });
});

module.exports = router;
