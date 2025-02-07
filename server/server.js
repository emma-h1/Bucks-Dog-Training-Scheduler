const express = require('express');
const app = express();
const port = 4999;

app.get('/api', (req, res) => {
    res.json({ message: 'Hello from server!' });
});

app.listen(port, () => {console.log(`Server running on port ${port}`)});