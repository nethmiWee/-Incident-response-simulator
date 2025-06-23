const express = require('express');
const http = require('http'); // ⬅️ New
const socketIo = require('socket.io'); // ⬅️ New
const cors = require('cors');
const bodyParser = require('body-parser'); 

const radioRoutes = require('./radio/radio.controller');
const videoRoutes = require('./video/video.controller');
const accessRoutes = require('./access/access.controller');
const chaosMiddleware = require('./chaos/chaos.middleware');
const { simulateIoTTraffic, classifyAndTrigger, stopSimulation } = require('./simulator/trafficSimulator');

const app = express();
const server = http.createServer(app); // ⬅️ New
const io = socketIo(server, { cors: { origin: '*' } }); // ⬅️ New

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
app.use(chaosMiddleware);

app.use('/api/radio', radioRoutes);
app.use('/api/video', videoRoutes);
app.use('/api/access', accessRoutes);

let simulatorInterval;
let result = 'Waiting for classification...';

// Provide io to trafficSimulator
const { setSocket } = require('./simulator/trafficSimulator');
setSocket(io);

app.post('/api/start-simulator', async (req, res) => {
    if (!simulatorInterval) {
        simulatorInterval = await simulateIoTTraffic();
        res.status(200).send({ message: 'Simulator started' });
    } else {
        res.status(400).send({ message: 'Simulator already running' });
    }
});

app.post('/api/stop-simulator', (req, res) => {
    if (simulatorInterval) {
        stopSimulation();
        clearInterval(simulatorInterval);
        simulatorInterval = null;
        res.status(200).send({ message: 'Simulator stopped' });
    } else {
        res.status(400).send({ message: 'Simulator not running' });
    }
});

app.post('/api/classify-trigger', async (req, res) => {
    const sensorData = req.body;
    result = await classifyAndTrigger(sensorData);
    res.status(200).send({ message: 'Incident processed based on prediction' });
});

app.get('/api/latest-classification', (req, res) => {
    res.json({ message: result || 'Waiting for classification...' });
});

// Start the server with socket.io
const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

module.exports = app;
