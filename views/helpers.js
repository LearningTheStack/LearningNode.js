module.exports = {
    getError(errors, prop) {
        try{
           return errors.mapped()[prop].msg; 
        } catch (err) {
            return '';
        }
    }
};

//prop === 'email' || 'password' || 'passwordConfirmation
//try since we look for the .msg property of potentially undefined

/*errors.mapped() === {
    email: {
        msg: 'invalid email'
    },
    password: {
        msg: 'password too short'
    },
    passwordConfirmation {
        msg: 'password must match'
    }
}*/