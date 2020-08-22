//require
const express = require('express');

//initialise
const app = express();

//route handler
//what to do when recieve HTTP request
app.get('/', (req, res) => {
    res.send('hello');
});

//start listening for requests
app.listen(3000, () => {
    console.log('Listening on 3000');
});