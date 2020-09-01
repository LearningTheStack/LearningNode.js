const fs = require('fs');
const crypto = require('crypto');
const util = require('util');
const Repository = require('./repository');

const scrypt = util.promisify(crypto.scrypt);

class UsersRepository extends Repository {
    //create a record given some attributes plus a random id
    async create(attrs) {
        // attributes === { email: 'abc@def.com', password: 'abcdef' }.
        //including random id as an attribute.
        attrs.id = this.randomId();

        //hashing and salting password
        //generate a salt
        const salt = crypto.randomBytes(8).toString('hex');
        //generate hashed password as buffer
        //scrypt is promisified by the util package
        const buf = await scrypt(attrs.password, salt, 64);

        // get latest version of the json file as records.
        const records = await this.getAll();

        //adding new attr hashed password + . + generatedsalt
        const record = {
            ...attrs,
            password: `${buf.toString('hex')}.${salt}`
        }
        //push the new user to records.
        records.push(record);

        //write the updated 'records' array back to this.filename.
        await this.writeAll(records);

        //return the id we added to the record
        return attrs;
    }

    //compare hashed passwords
    async comparePasswords(saved, supplied) {
        //saved -> password saved in our database
        //saved is of the form 'hashed.salt'
        //supplied -> password given to us by user on a signin form

        /*equivalent to below
        const result = saved.split('.');
        const hashed = result[0];
        const salt = result[1];*/

        //split the saved password to get hashed and salt separately.
        const [hashed, salt] = saved.split('.');
        //get the hashed version of the supplied password
        const hashedSuppliedBuffer = await scrypt(supplied, salt, 64);

        //compare the saved password to the supplied password in hashed form.
        return hashed === hashedSuppliedBuffer.toString('hex');
    }
}

module.exports = new UsersRepository('users.json');

/*use case
const repo = require('./users');
repo.getAll();
repo.getOne();
*/



/*test function
//needed due to the async property not being 'top level'
const test = async () => {
    const repo = new UsersRepository('users.json');
    const user = await repo.getOneBy({ sdfsdf: '123' });
    console.log(user);
};

//call our test function
test();
*/