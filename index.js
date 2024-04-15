const express = require('express');
const { db } = require('./db/db.js');
const bcrypt = require('bcrypt');
const router = require('./route/router.js');
const path = require('path');
const cookieParser = require('cookie-parser');
const multer = require('multer');

const app = express(); // Initialize Express app

app.use(cookieParser()); // Use cookie-parser middleware

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
      cb(null, 'public/image'); // Specify the destination directory
  },
  filename: function (req, file, cb) {
      cb(null, Date.now() + '-' + file.originalname); // Generate unique filename
  }
});
const upload = multer({ storage: storage });

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));

// Example route using the imported models
app.get('/users', async (req, res) => {
  try {
    const users = await db.User.find();
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.use('/', router);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
