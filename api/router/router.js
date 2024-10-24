const express = require('express');
const { getUsers,addRole, registerUser, loginUser, saveSensorData, getSensors, getRoles, adddesignation, getdesignation, deleteRole, DeleteDesignation, test } = require('../controllers/controller');

const router = express.Router();

// Define routes
router.get('/users', getUsers);
router.post('/users/register', registerUser);
router.post('/users/login', loginUser);
router.post('/users/sensor', saveSensorData);
router.get('/users/sensorData', getSensors);
router.post('/users/addrole', addRole);
router.get('/users/getRoles', getRoles);
router.post('/users/adddesignation', adddesignation);
router.get('/users/getdesignation', getdesignation);
router.delete('/users/deleteRole/:id', deleteRole);
router.delete('/users/deleteDesignation/:id', DeleteDesignation);
router.get('/split', test);

module.exports = router;