const express = require('express');
const cors = require('cors');
const child_process = require('child_process');

const router = express.Router();

// Launch Steam game
router.post('/launch/steam/:id', (req, res) => {
  const steamId = req.params.id;
  
  // Try to use steam:// protocol to launch the game via default OS handler
  console.log(`Launching Steam game ID: ${steamId}`);
  
  // On Windows, 'start' command can open URLs
  const command = process.platform === 'win32' 
    ? `start steam://rungameid/${steamId}` 
    : `xdg-open steam://rungameid/${steamId}`;
    
  child_process.exec(command, (error) => {
    if (error) {
      console.error(`Error launching game: ${error.message}`);
      return res.status(500).json({ error: 'Failed to launch game' });
    }
    res.json({ success: true, message: 'Game launch initiated' });
  });
});

// Launch custom local executable
router.post('/launch/local', (req, res) => {
  const { execPath } = req.body;
  
  if (!execPath) {
    return res.status(400).json({ error: 'Missing execution path' });
  }

  console.log(`Launching local game at: ${execPath}`);
  
  child_process.exec(`"${execPath}"`, (error) => {
    if (error) {
      console.error(`Error launching local game: ${error.message}`);
      return res.status(500).json({ error: 'Failed to launch local game' });
    }
    res.json({ success: true, message: 'Game launch initiated' });
  });
});

module.exports = router;
