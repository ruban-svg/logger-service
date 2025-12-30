// Example Express application (kept separate from package entry)
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL || '*',
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

// Example route
app.get('/', (req, res) => res.send('ok'));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Example app running on port ${PORT}`);
});

// To run: node src/example-app.js
