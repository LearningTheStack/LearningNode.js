//require
const express = require('express');
const bodyParser = require('body-parser');

//initialise
const app = express();

//app.use is applied to every incoming request
//every request will be body parsed
//parses body buffer to a useable object
app.use(bodyParser.urlencoded({ extended: true }));

//route handler
//what to do when recieve HTTP request
//root address (GET request)
app.get('/', (req, res) => {
    res.send(`
     <div>
      <form method="POST">
        <input name="email" placeholder="email" />
        <input name="password" placeholder="password" />
        <input name="passwordConfirmation" placeholder="password Confirmation" />
        <button>Sign Up</button>
      </form>
     </div>
    `);
});


//root address (POST request from above form)
app.post('/', (req,res) => {
    console.log(req.body);
    res.send('Account created!');
});

//start listening for requests
app.listen(3000, () => {
    console.log('Listening on 3000');
});