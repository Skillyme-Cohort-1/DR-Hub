// Main entry file 
require('dotenv').config()
const express = require('express');
const cors = require('cors');
const app = express();

app.use(express.json()); // Parse json bodies

app.use(cors()); // Enable CORS

// Health check
app.get('/', (req, res) => {
  res.send('Hello, World!');
});


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;