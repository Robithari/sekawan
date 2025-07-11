// Quick test file untuk mengecek endpoint
const express = require('express');
const app = express();

app.get('/api/test-simple', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Simple test endpoint working',
    timestamp: new Date().toISOString()
  });
});

app.listen(3001, () => {
  console.log('✅ Simple test server running on http://localhost:3001');
  console.log('Test endpoint: http://localhost:3001/api/test-simple');
});
