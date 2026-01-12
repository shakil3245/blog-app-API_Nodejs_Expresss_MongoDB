const express = require('express');
const authRoutes = require('./src/routes/auth');
const adminRoutes = require('./src/routes/admin');
const postRoutes = require('./src/routes/postRoute');
const userRoutes = require('./src/routes/userRoutes');


const app = express();
app.use(express.json());



// Routes
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/users', userRoutes);



// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
  });
});

module.exports = app;
