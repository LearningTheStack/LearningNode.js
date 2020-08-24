const express = require('express');
//we only want to use the check function
//this saves us doing
//expressValidator.check everytime we want to call it
const { check, validationResult } = require('express-validator');

const usersRepo = require('../../repositories/users');
const signupTemplate = require('../../views/admin/auth/signup');
const signinTemplate = require('../../views/admin/auth/signin')

//sub router
const router = express.Router();

//route handler
//what to do when recieve HTTP request
//root address is '/' (GET request)
router.get('/signup', (req, res) => {
    res.send(signupTemplate({ req }));
});


//root address (POST request from above form)
//async required since we are using await functions
router.post('/signup', 
    [
        check('email')
            .trim()
            .normalizeEmail()
            .isEmail(),
        check('password')
            .trim()
            .isLength({ min:4, max:20 }),
        check('passwordConfirmation')
            .trim()
            .isLength({ min:4, max:20 })
    ],
    async (req,res) => {
        //get errors from the validation and sanitization above
        const errors = validationResult(req);
        console.log(errors);

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
    }
);

//sign out
//redirect to signin
router.get('/signout', (req,res) => {
    //forget all cookie information
    req.session = null;
    res.send('You are logged out');
});

//sign in get request, returns a page with a simple email,password login form
router.get('/signin', (req,res) => {
    res.send(signinTemplate());
});

//sign in post request, this handles the data sent by the above signin form
router.post('/signin', async (req,res) => {
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

module.exports = router;