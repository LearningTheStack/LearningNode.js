//required packages
const express = require('express');
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
//this is our users.js package
//'./' says look in current directory
const usersRepo = require('./repositories/users');
const { comparePasswords } = require('./repositories/users');

//initialise
const app = express();

//app.use is applied to every incoming request
//every request will be body parsed
//parses body buffer to a useable object
app.use(bodyParser.urlencoded({ extended: true }));
//cookiesession adds req.session to our HTTP requests
//keys is a random string which helps encrypt cookie data.
app.use(cookieSession({
    keys: ['kzhgsdfgkljhsreut94587ergh394']
}));

//route handler
//what to do when recieve HTTP request
//root address is '/' (GET request)
app.get('/signup', (req, res) => {
    res.send(`
     <div>
      Your id is: ${req.session.userId}
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
app.post('/signup', async (req,res) => {
    //deconstruct the object created by the request
    const { email, password, passwordConfirmation } = req.body;
    //use our repo command getOneBy with filter email
    //to see if this email was already used
    const existingUser = await usersRepo.getOneBy({ email });
    if (existingUser) {
        return res.send('This email is already in use.');
    }
    //check if the passwords entered match
    if (password !== passwordConfirmation) {
        return res.send('The passwords you entered do not match.');
    }

    //create a user in our user repo to represent a person
    //the create method returns the attributes of the user
    //this includes the unique id we generate for the user
    const user = await usersRepo.create({ email, password });

    //store the id of the user inside the users cookie
    //req.session added by cookieSession
    //add in the userId property, assign it to user.id from record
    req.session.userId = user.id;

    res.send('Account created!');
});

//sign out
//redirect to signin
app.get('/signout', (req,res) => {
    //forget all cookie information
    req.session = null;
    res.send('You are logged out');
});

//sign in get request, returns a page with a simple email,password login form
app.get('/signin', (req,res) => {
    res.send(`
    <div>
     <form method="POST">
      <input name="email" placeholder="email" />
      <input name="password" placeholder="password" />
      <button>Sign In</button>
     </form>
    </div>        
    `);
});

//sign in post request, this handles the data sent by the above signin form
app.post('/signin', async (req,res) => {
    //destructure out the email and password from the req.body object
    const { email, password } = req.body;
    //check a user exists in database with given email
    const user = await usersRepo.getOneBy({ email });
    //if there is no user send back an error message
    if(!user) {
        return res.send('Email not found.');
    }
    
    //check to see if the passwords match
    const validPassword = await usersRepo.comparePasswords(
        user.password,
        password
    )
    //if the password doesnt match send an error message
    if (!validPassword) {
        return res.send('Password is incorrect.');
    }
    
    //authenticate user within our app
    req.session.userId = user.id;
    res.send('You are now signed in.');
});

//start listening for requests
app.listen(3000, () => {
    console.log('Listening on 3000');
});