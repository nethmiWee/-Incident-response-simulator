module.exports = (req, res, next) => {
  const failNow = Math.random() < 0.1; // 10% failure rate
  if (failNow) return res.status(503).send({ error: 'Device offline' });
  const delay = Math.random() * 3000;
  return setTimeout(next, delay);
};
