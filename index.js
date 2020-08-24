//required packages
const express = require('express');
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const authRouter = require('./routes/admin/auth');

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
//link up our sub router from auth.js to this main file
app.use(authRouter);

//start listening for requests
app.listen(3000, () => {
    console.log('Listening on 3000');
});