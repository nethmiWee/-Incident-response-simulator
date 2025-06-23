const express = require('express');
const router = express.Router();

router.post('/lockdown', (req, res) => {
  console.log('Lockdown initiated:', req.body);
  res.status(200).send({ message: 'Access points locked' });
});

module.exports = router;