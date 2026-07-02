const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Routes
const gamesRouter = require('./routes/games');
const scannerRouter = require('./routes/scanner');
const steamRouter = require('./routes/steam');

app.use('/api/games', gamesRouter);
app.use('/api/scanner', scannerRouter);
app.use('/api/steam', steamRouter);

// Basic health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'MNova Backend running' });
});

app.listen(PORT, () => {
  console.log(`MNova server running on port ${PORT}`);
});
