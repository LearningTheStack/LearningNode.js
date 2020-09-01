const { check } = require ('express-validator');
const usersRepo = require('../../repositories/users');

module.exports = {
    requireTitle:
        check('title')
        .trim()
        .isLength({ min: 5, max: 40 })
        .withMessage('Must be between 5 and 40 characters.'),
    requirePrice:
        check('price')
        .trim()
        .toFloat()
        .isFloat({ min: 1 })
        .withMessage('Must be a number greater than 1.'),
    requireEmail: 
        check('email')
        .trim()
        .normalizeEmail()
        .isEmail()
        .withMessage('Must be a valid email')
        .custom(async (email) => {
            //use our repo command getOneBy with filter email
            //to see if this email was already used
            const existingUser = await usersRepo.getOneBy({ email });
            if (existingUser) {
                throw new Error('This email is already in use.');
            }
        }),
    requirePassword:
        check('password')
        .trim()
        .isLength({ min:4, max:20 })
        .withMessage('Must be between 4 and 20 characters'),
    requirePasswordConfirmation:
        check('passwordConfirmation')
        .trim()
        .isLength({ min:4, max:20 })
        .withMessage('Must be between 4 and 20 characters')
        //{ req } is equivalent to obj and const req = obj.req;
        //check if the passwords entered match
        .custom(async (passwordConfirmation, { req }) => {
            if (passwordConfirmation !== req.body.password) {
                throw new Error('The passwords you entered do not match.');
            }
        }),
    requireEmailExists:
        check('email')
        .trim()
        .normalizeEmail()
        .isEmail()
        .withMessage('Must provide a valid email.')
        .custom(async (email) => {
            const user = await usersRepo.getOneBy({ email });
            if (!user) {
                throw new Error('Email not found');
            }
        }),
    requireValidPasswordForUser:
        check('password')
        .trim()
        .custom(async (password, { req }) => {
            const user = await usersRepo.getOneBy({ email: req.body.email });
            //if there is no user send back an error message
            if (!user) {
                throw new Error('Password is incorrect.');
            }
            //check to see if the passwords match
            const validPassword = await usersRepo.comparePasswords(
                user.password,
                password
            );
            //if the password doesnt match send an error message
            if (!validPassword) {
                throw new Error('Password is incorrect.');
            }
        })
}