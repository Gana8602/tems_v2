const { sql } = require('../db');
const bcrypt = require('bcrypt');

// Get all users
const getUsers = async (req, res) => {
    try {
        const result = await sql.query`SELECT * FROM users`;
        res.json(result.recordset); // SQL Server returns result in `recordset`
    } catch (err) {
        res.status(500).send(err);
    }
};

// Register new user
const registerUser = async (req, res) => {
    console.log('Received data:', req.body); // Debugging

    const { username, email, password } = req.body;
    if (!username || !email || !password) {
        return res.status(400).json({ message: 'Invalid input data' });
    }

    // Hash the password before storing it
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const query = `INSERT INTO users (username, email, password) VALUES (@username, @email, @password)`;

        // Prepare the statement
        const request = new sql.Request();
        request.input('username', sql.VarChar, username);
        request.input('email', sql.VarChar, email);
        request.input('password', sql.VarChar, hashedPassword);

        const result = await request.query(query);
        res.status(201).json({ id: result.rowsAffected[0], username, email });
    } catch (err) {
        console.error('Database error:', err);
        res.status(500).send(err);
    }
};

// Login user
const loginUser = async (req, res) => {
    const { userName, password } = req.body;

    if (!userName || !password) {
        return res.status(400).json({ message: 'Please provide both username and password' });
    }

    try {
        // Check for the user in the database
        const query = `SELECT * FROM users WHERE userName = @userName`;
        const request = new sql.Request();
        request.input('userName', sql.VarChar, userName);
        const result = await request.query(query);

        const user = result.recordset[0];

        // Check if the user exists
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Compare the hashed password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid password' });
        }

        // Return user data upon successful login
        res.json({
            id: user.id,
            userName: user.userName,
        });
    } catch (err) {
        console.error('Database error:', err);
        res.status(500).send(err);
    }
};


//save data
const saveSensorData = async (req, res) => {
    console.log('Received data:', req.body); // Debugging

    const {
        StationID,
        Date,
        Time,
        UTC_Time,
        LAT,
        LONG,
        BatteryVoltage,
        GPS_Date,
        S1_RelativeWaterLevel,
        S2_Bin1_Surface,
        S2_Bin4_Middle,
        S2_Bin7_Lower
    } = req.body;

    // Validate input
    if (!StationID || !Date || !Time || !UTC_Time || !LAT || !LONG || !BatteryVoltage || !GPS_Date || !S1_RelativeWaterLevel || !S2_Bin1_Surface || !S2_Bin4_Middle || !S2_Bin7_Lower) {
        return res.status(400).json({ message: 'Invalid input data' });
    }

    try {
        // Convert numerical values to strings
        const stringLAT = String(LAT);
        const stringLONG = String(LONG);
        const stringBatteryVoltage = String(BatteryVoltage);
        const stringS1_RelativeWaterLevel = String(S1_RelativeWaterLevel);
        const stringS2_Bin1_Surface = String(S2_Bin1_Surface);
        const stringS2_Bin4_Middle = String(S2_Bin4_Middle);
        const stringS2_Bin7_Lower = String(S2_Bin7_Lower);

        // Define the SQL query to insert the data
        const query = `
            INSERT INTO SensorData (
                StationID, Date, Time, UTC_Time, LAT, LONG, BatteryVoltage, GPS_Date, S1_RelativeWaterLevel, S2_Bin1_Surface, S2_Bin4_Middle, S2_Bin7_Lower
            ) VALUES (
                @StationID, @Date, @Time, @UTC_Time, @LAT, @LONG, @BatteryVoltage, @GPS_Date, @S1_RelativeWaterLevel, @S2_Bin1_Surface, @S2_Bin4_Middle, @S2_Bin7_Lower
            )
        `;

        const request = new sql.Request();
        request.input('StationID', sql.VarChar, StationID);
        request.input('Date', sql.VarChar, Date);
        request.input('Time', sql.VarChar, Time);
        request.input('UTC_Time', sql.VarChar, UTC_Time);
        request.input('LAT', sql.VarChar, stringLAT); // Convert to string
        request.input('LONG', sql.VarChar, stringLONG); // Convert to string
        request.input('BatteryVoltage', sql.VarChar, stringBatteryVoltage); // Convert to string
        request.input('GPS_Date', sql.VarChar, GPS_Date);
        request.input('S1_RelativeWaterLevel', sql.VarChar, stringS1_RelativeWaterLevel); // Convert to string
        request.input('S2_Bin1_Surface', sql.VarChar, stringS2_Bin1_Surface); // Convert to string
        request.input('S2_Bin4_Middle', sql.VarChar, stringS2_Bin4_Middle); // Convert to string
        request.input('S2_Bin7_Lower', sql.VarChar, stringS2_Bin7_Lower); // Convert to string

        const result = await request.query(query);

        // Send response
        res.status(201).json({ message: 'Sensor data saved successfully', data: req.body });
    } catch (err) {
        console.error('Database error:', err);
        res.status(500).json({ message: 'Error saving data', error: err });
    }
};

//get all sensor data
const getSensors = async (req, res) => {
    try {
        const result = await sql.query`SELECT * FROM SensorData`;
        res.json(result.recordset); // SQL Server returns result in `recordset`
    } catch (err) {
        res.status(500).send(err);
    }
};




// module.exports = { saveSensorData };


module.exports = {
    getUsers,
    registerUser,
    loginUser,
    saveSensorData,
    getSensors,
};


//sample body data format for savestationdata
// {
//     "StationID": "CWPRS01",
//     "Date": "2024-10-03",
//     "Time": "11:30:31",
//     "UTC_Time": "06:00:00",
//     "LAT": 12.90935941869516,
//     "LONG": 77.59784407291754,
//     "BatteryVoltage": 12.4,
//     "GPS_Date": "11:30:00",
//     "S1_RelativeWaterLevel": 2.5,
//     "S2_Bin1_Surface": 3.4,
//     "S2_Bin4_Middle": 2.1,
//     "S2_Bin7_Lower": 4.2
//   }
  