const express = require('express');
const { getUsers, registerUser, loginUser, saveSensorData, getSensors } = require('../controllers/controller');
const router = express.Router();

// Define routes
router.get('/users', getUsers);
router.post('/users/register', registerUser);
router.post('/users/login', loginUser);
router.post('/users/sensor', saveSensorData);
router.get('/users/sensorData', getSensors);

module.exports = router;