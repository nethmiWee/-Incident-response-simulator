import { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';

function App() {
  const [simulatorRunning, setSimulatorRunning] = useState(false);
  const [latestClassification, setLatestClassification] = useState('Waiting for classification...');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const socket = io('http://localhost:3000');

    socket.on('connect', () => {
      console.log('Connected to server');
      setLoading(false);
    });

    socket.on('classificationUpdate', (newMessage) => {
      console.log('Received classification:', newMessage);
      setLatestClassification(newMessage);
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from server');
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const triggerEmergency = async () => {
    await axios.post('http://localhost:3000/api/radio/alert', { incidentType: 'fire', timestamp: Date.now() });
    await axios.post('http://localhost:3000/api/video/trigger', { cameraId: 1, timestamp: Date.now() });
    await axios.post('http://localhost:3000/api/access/lockdown', { doors: ['A1', 'B2'], timestamp: Date.now() });
    alert('Emergency triggered successfully!');
  };

  const startSimulator = async () => {
    try {
      await axios.post('http://localhost:3000/api/start-simulator');
      setSimulatorRunning(true);
      alert('IoT Traffic Simulator started!');
    } catch (error) {
      console.error('Error starting simulator:', error.message);
    }
  };

  const stopSimulator = async () => {
    try {
      await axios.post('http://localhost:3000/api/stop-simulator');
      setSimulatorRunning(false);
      alert('IoT Traffic Simulator stopped!');
    } catch (error) {
      console.error('Error stopping simulator:', error.message);
    }
  };

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', textAlign: 'center', marginTop: '50px' }}>
      <h1>🚨 Incident Response Simulator 🚨</h1>
      <div style={{ marginBottom: '20px' }}>
        <button onClick={triggerEmergency} style={{ marginRight: '10px' }}>Trigger Emergency</button>
        <button onClick={startSimulator} disabled={simulatorRunning} style={{ marginRight: '10px' }}>Start IoT Simulator</button>
        <button onClick={stopSimulator} disabled={!simulatorRunning}>Stop IoT Simulator</button>
      </div>

      <div style={{
        border: '2px solid #ccc',
        borderRadius: '10px',
        padding: '20px',
        width: '400px',
        margin: '0 auto',
        backgroundColor: '#f9f9f9'
      }}>
        <h2>Latest Classification</h2>
        {loading && <p style={{ fontStyle: 'italic', color: '#555' }}>Connecting to server...</p>}
        <p style={{
          fontSize: '18px',
          color: latestClassification.includes('Emergency') ? 'red' : 'green',
          fontWeight: 'bold'
        }}>
          {latestClassification}
        </p>
      </div>
    </div>
  );
}

export default App;
