const express = require('express');
const cors = require('cors');
const port = process.env.PORT || 5000;

const app = express();

app.use(cors());
app.use(express.json());

// https://floating-retreat-93986.herokuapp.com/
app.get('/', (req, res) => {
    res.send('Server created!');
});
app.listen(port, () => {
    console.log('Server running @', port);
});