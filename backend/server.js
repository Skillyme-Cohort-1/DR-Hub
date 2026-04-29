require('dotenv').config()
const express = require('express');
const morgan = require("morgan")
const cors = require('cors');
const path = require('path');
const userAuthRoutes = require('./src/routes/userAuthRoutes');
const documentRoutes = require('./src/routes/documentRoutes');
const roomRoutes = require('./src/routes/roomRoutes');
const bookingRoutes = require('./src/routes/bookingRoutes');
const paymentRoutes = require('./src/routes/paymentRoute');
const feedbackRoutes = require('./src/routes/feedback.route');
const reviewRoutes = require('./src/routes/reviewRoutes');
const contactRoutes = require('./src/routes/contactRoutes');
const bookingSlotRoutes = require("./src/routes/slotsRoutes")
const attendanceRoutes = require('./src/routes/attendanceRoutes');
const bookingSlotRoutes = require("./src/routes/slotsRoutes");
const exportRoutes = require('./src/routes/exportRoutes');

const app = express();

app.use(express.json({ limit: '12mb' }));
app.use(express.urlencoded({ extended: true, limit: '12mb' }));
app.use(morgan("tiny"))

app.use(cors());
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

app.get('/', (req, res) => {
  res.send('DRHub backend is running.');
});

app.use('/api/users', userAuthRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/slots', bookingSlotRoutes);
app.use('/api/attendances', attendanceRoutes);
app.use('/api/export', exportRoutes);

app.use((error, req, res, next) => {
  if (error && error.type === 'entity.too.large') {
    return res.status(413).json({
      message: 'Request payload is too large. Keep JSON/form body under 12MB and each document under 10MB.',
    });
  }

  console.error(error);
  return res.status(500).json({
    message: 'Internal server error.',
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on 'http://localhost:${PORT}'`);
});

module.exports = app;
