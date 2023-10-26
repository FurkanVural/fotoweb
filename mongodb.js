const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const app = express();
const port = 3001;
const mysql = require('mysql2');
const pako = require('pako');
const zlib = require('zlib');
const crypto = require('crypto');
// MongoDB connection setup
mongoose.connect('mongodb://localhost:27017/mongodb', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// MySQL connection setup
const mysqlDb = mysql.createConnection({
  host: 'localhost',
  user: 'your_mysql_user',
  password: 'your_password',
  database: 'photo_app',
});

mysqlDb.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL');
});

// Define the schema for storing photos in MongoDB
const photoSchema = new mongoose.Schema({
  title: String,
  imageBase64: String,
  owner: String, // Added owner field
  uploadDate: Date, // Added uploadDate field
});

const Photo = mongoose.model('Photo', photoSchema);

// Configure Multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Serve the HTML upload form
app.get('/', (req, res) => {
  res.sendFile(path.join('/home/ec2-user/fotoweb/', 'public', 'index.html'));
});

// Handle photo uploads and store in both MongoDB and MySQL
app.post('/upload/photo', upload.single('photo'), async (req, res) => {
  const title = req.body.title;
  const imageBase64 = req.file.buffer.toString('base64');
  const owner = req.body.owner; // Get the owner from the form
  const uploadDate = new Date();
  const photoHash = crypto.createHash('sha256').update(imageBase64).digest('hex');
    // Check if a photo with the same hash already exists in MongoDB
  const existingPhoto = await Photo.findOne({ imageHash: photoHash });

  if (existingPhoto) {
    console.log('Duplicate photo detected.');
    res.status(400).send('Duplicate photo detected.');
    return;
  }

  // Save the photo to MongoDB
  const newPhoto = new Photo({
    title: title,
    imageBase64: imageBase64,
    owner: owner, // Save owner
    uploadDate: uploadDate, // Save upload date
    imageHash: photoHash,  
});

  try {
    await newPhoto.save();
    console.log('Photo saved in MongoDB');
  } catch (err) {
    console.error('Error saving photo to MongoDB:', err);
  }

  // Insert photo information into MySQL
  const photoData = {
    title: title,
    uploadDate: uploadDate,
    owner: owner,
    size: req.file.size,
  };

  mysqlDb.query('INSERT INTO photos SET ?', photoData, (err, results) => {
    if (err) {
      console.error('Error inserting photo into MySQL:', err);
      res.status(500).send('Internal Server Error');
    } else {
      console.log('Photo saved in MySQL');
      res.status(200).send('Photo uploaded successfully.');
    }
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
