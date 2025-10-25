import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRouter from './routes/index.js'; // Import the main router

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Use your main router
app.use('/', apiRouter); // 👈 This makes all routes inside index.js active

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
