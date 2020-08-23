//required packages
const express = require('express');
const bodyParser = require('body-parser');
//this is our users.js package
//'./' says look in current directory
const usersRepo = require('./repositories/users');

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
//async required since we are using await functions
app.post('/', async (req,res) => {
    //deconstruct the object created by the request
    const { email, password, passwordConfirmation } = req.body;
    //use our repo command getOneBy with filter email
    //to see if this email was already used
    const existingUser = await usersRepo.getOneBy({ email });
    if (existingUser) {
        return res.send('This email is already in use.');
    }
    if (password !== passwordConfirmation) {
        return res.send('The passwords you entered do not match.');
    }

    res.send('Account created!');
});

//start listening for requests
app.listen(3000, () => {
    console.log('Listening on 3000');
});