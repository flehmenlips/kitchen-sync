// KitchenSync Backend Server
// Force deployment with React Error #31 fix - v2
import express from 'express';
import path from 'path';

const app = express();

// Static file serving for local uploads (when not using Cloudinary)
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads'))); 