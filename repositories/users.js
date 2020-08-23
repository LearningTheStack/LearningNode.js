const fs = require('fs');
const crypto = require('crypto');
const util = require('util');

const scrypt = util.promisify(crypto.scrypt);

class UsersRepository {
    constructor(filename) {
        if (!filename) {
            throw new Error('Creating a repository requires a filename');
        }

        this.filename = filename;

        //we use Sync methods due to only creating one instance of this class.
        //normally the other non sync methods should be used.
        try {
            fs.accessSync(this.filename);
        } catch (err) {
            fs.writeFileSync(this.filename, '[]');
        }
    }


    //gets all of the records from this.filename
    async getAll() {
        //open the file called this.filename
        //parse the contents
        //return the parsed data
        return JSON.parse(
            await fs.promises.readFile(this.filename, {
                encoding: 'utf8'
            })
        );
    }


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


    //write all of the records to this.filename
    async writeAll(records) {
        //write the updated 'records' array back to this.filename.
        //JSON.stringify second argument is for custom formatting.
        //JSON.stringify third argument changes indentation.
        await fs.promises.writeFile(this.filename, JSON.stringify(records, null, 2));
    }

    //generates a random Id for a record
    randomId() {
        //generates a random id using the crypto package
        //the id is generated as 4 bytes
        //then converted into hex and returned
        return crypto.randomBytes(4).toString('hex');
    }

    //get one record with a given id
    async getOne(id) {
        //retrieve all of the records
        const records = await this.getAll();
        //find a record by iterating through until the ids match
        return records.find(record => record.id === id);
    }

    //deletes a record given an id
    async delete(id) {
        //retrieve all of the records
        const records = await this.getAll();
        //filter retains elements where the inner function is true
        const filteredRecords = records.filter(record => record.id !== id);
        //write the filtered list of records to this.filename
        await this.writeAll(filteredRecords);
    }

    //update a specific record given an id and some attributes
    async update(id, attrs) {
        //retrieve all the records
        //so we can save them all at the end
        const records = await this.getAll();
        //get the specific record we are updating
        const record = records.find(record => record.id === id);
        //check if we have found a record
        if(!record) {
            throw new Error(`Record with id: ${id} not found.`);
        }
        //update the record
        //takes all attrs and copies them to the record
        //record === { email: 'test@test.com' }
        //attrs === { password: 'password' };
        //record === { email: 'test@test.com', password: 'password' }
        Object.assign(record, attrs);
        //write all the records which includes the updated one
        await this.writeAll(records);
    }

    //takes an argument of an object
    //which contains an arbitrary amount of key:value pairs
    //and finds a record which satisfies those pairs.
    async getOneBy(filters) {
        //retrieve all records
        const records = await this.getAll();
        //iterate through our list of records
        //for..of loop since we are iterating through an array
        for(let record of records){
            let found = true;
            //for..in loop as we are iterating through an object
            for(let key in filters) {
                //if the key from our record does not match
                //our key from our filter
                //set found=false, we have not found the right record
                if(record[key]!== filters[key]){
                    found = false;
                }
            }
            //if we escape the for..in loop with found==true
            //we have found our record so we return it
            if(found) {
                return record;
            }
        }
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