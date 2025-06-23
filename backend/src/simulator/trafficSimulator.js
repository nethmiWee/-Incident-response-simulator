// backend/src/simulator/trafficSimulator.js

const axios = require('axios');
const csv = require('csvtojson');
const _ = require('lodash');
const fs = require('fs');
const unzipper = require('unzipper');
const path = require('path');

let io = null;

function setSocket(socket) {
    io = socket;
}

const datasetZipURL = 'https://github.com/adnandeakin/SIT719_Improved/raw/master/Processed_Combined_IoT_dataset.zip';
const datasetFileName = 'Processed_Combined_IoT_dataset.csv';
const datasetPath = path.join(__dirname, datasetFileName);
let keepRunning = true;  // flag to control the loop
let latestClassification = 'Waiting for classification...';

async function downloadAndExtractDataset() {
    try {
        console.log('Downloading IoT dataset zip...');
        const response = await axios({
            method: 'GET',
            url: datasetZipURL,
            responseType: 'stream'
        });

        const zipPath = path.join(__dirname, 'dataset.zip');
        const writer = fs.createWriteStream(zipPath);

        response.data.pipe(writer);

        await new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
        });

        console.log('Extracting dataset...');
        await fs.createReadStream(zipPath)
            .pipe(unzipper.Extract({ path: __dirname }))
            .promise();

        console.log('Dataset extracted.');
    } catch (error) {
        console.error('Error downloading or extracting dataset:', error);
    }
}

async function loadDataset() {
    try {
        if (!fs.existsSync(datasetPath)) {
            await downloadAndExtractDataset();
        }

        const dataset = await csv().fromFile(datasetPath);
        console.log(`Dataset loaded: ${dataset.length} rows`);

        return dataset;
    } catch (error) {
        console.error('Error loading dataset:', error);
        return [];
    }
}
async function classifyAndTrigger(sensorData) {
    try {
        const response = await axios.post('http://localhost:5000/predict', sensorData);
        const prediction = response.data.prediction;

        console.log('Prediction result:', prediction);

        if (prediction === 1) {
            console.log('🚨 Emergency Detected! Triggering alerts...');
            latestClassification = '🚨 Emergency Detected!';
            await axios.post('http://localhost:3000/api/radio/alert', { incidentType: 'emergency', timestamp: Date.now() });
            await axios.post('http://localhost:3000/api/video/trigger', { cameraId: 1, timestamp: Date.now() });
            await axios.post('http://localhost:3000/api/access/lockdown', { doors: ['A1', 'B2'], timestamp: Date.now() });
        } else {
            console.log('✅ Normal traffic detected.');
            latestClassification = '✅ Normal traffic detected.';
        }

        // 🔥 Emit to all connected clients
        if (io) {
            io.emit('classificationUpdate', latestClassification);
        }

        return latestClassification;

    } catch (error) {
        console.error('Error during classification:', error.message);
        return 'Error during classification.';
    }
}


async function simulateIoTTraffic() {
    const dataset = await loadDataset();
    if (dataset.length === 0) return;

    const shuffledData = _.shuffle(dataset);
    let index = 0;

    keepRunning = true; // reset flag on start

    const interval = setInterval(async () => {
        if (!keepRunning) {
            clearInterval(interval);
            console.log('Simulator interval cleared.');
            return;
        }

        if (index >= shuffledData.length) index = 0;

        const sample = shuffledData[index];
        console.log('Sending IoT sample:', sample);

        try {
            await axios.post('http://localhost:3000/api/classify-trigger', sample);
            console.log('Sample sent for classification.');
        } catch (error) {
            console.error('Error sending sample:', error.message);
        }

        index++;
    }, 3000);

    return interval;
}

function stopSimulation() {
    keepRunning = false;
}

module.exports = { simulateIoTTraffic, stopSimulation, classifyAndTrigger, setSocket };