require('dotenv').config()
const express = require('express');
const cors = require('cors');
const path = require('path');
const userAuthRoutes = require('./src/routes/userAuthRoutes');
const documentRoutes = require('./src/routes/documentRoutes');
const feedbackRoutes = require('./src/routes/feedback.route');
const roomRoutes = require('./routes/roomRoutes');
const paymentRoutes = require('./src/routes/paymentRoute');
const app = express();

app.use(express.json());

app.use(cors());
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

app.get('/', (req, res) => {
  res.send('DRHub backend is running.');
});

app.use('/api/users', userAuthRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/feedback', feedbackRoutes);

app.use((error, req, res, next) => {
  console.error(error);
  return res.status(500).json({
    message: 'Internal server error.',
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;