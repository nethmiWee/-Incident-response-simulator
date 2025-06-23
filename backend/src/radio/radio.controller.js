const express = require('express');
const router = express.Router();

router.post('/alert', (req, res) => {
  console.log('Radio alert received:', req.body);
  res.status(200).send({ message: 'Radio alert processed' });
});

module.exports = router; 