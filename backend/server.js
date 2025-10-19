import app from './src/app.js';
import dotenv from 'dotenv';
import connectDB from './src/config/db.js';

// Load environment variables
dotenv.config();

const PORT = process.env.PORT;

// Connect to Database
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});