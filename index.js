var crypto = require('crypto');
var uuid = require('uuid');
var express = require('express');
var mysql = require('mysql2');
var bodyParser = require('body-parser');
const { json } = require('body-parser');

// Connect to MySQL
var connection = mysql.createConnection(
    {
        host:'127.0.0.1',
        user:'root',
        password:'25$DTre2',
        database:'pawfection',
        port:3306
    }
);

connection.connect((err)=>{
    if(!err)
    {
        console.log("Database Connected");
    }
    else
    {
        console.log(err);
    }
})

var getRandomString = function(length) {
    return crypto.randomBytes(Math.ceil(length/2)).toString('hex').slice(0,length);
    // Convert to hex format and return required number of characters
};

var sha512 = function(password,salt) {
    var hash = crypto.createHmac('sha512',salt); // Use SHA512
    hash.update(password);
    var value = hash.digest('hex');
    return {
        salt:salt,
        passwordHash:value
    };
};

function saltHashPassword(userPassword) {
    var salt = getRandomString(16); // Generate random string with 16 characters to use as salt
    var passwordData = sha512(userPassword, salt); 
    return passwordData;
}

function checkHashPassword(userPassword, salt) {
    var passwordData = sha512(userPassword,salt);
    return passwordData;
}

var application = express();
application.use(bodyParser.json()); // Accept JSON params
application.use(bodyParser.urlencoded({extended: true})); // Accept URL encoded params

application.post('/register', (req,res,next)=>{
    console.log(req.body);
    var post_data = req.body; // Get POST params
    var uid = uuid.v4(); 
    /*var plaint_password = post_data.password; // Get password from post params
    var hash_data = saltHashPassword(plaint_password);
    var password = hash_data.passwordHash; // Get hash value*/
    var password = post_data.password;
    //var salt = hash_data.salt; // Get salt

    var fullName = post_data.fullName;
    var emailAddress = post_data.emailAddress;
    var cnic = post_data.cnic;
    var accountType = post_data.accountType;


    


    connection.query('SELECT * FROM users WHERE emailAddress=?',[emailAddress],function(err,result,fields) {
        connection.on('error',function(err) {
            console.log('[MYSQL ERROR]',err);
        });
        
        if(result && result.length) {
            res.json('User already exists.');
        }
        else {
            connection.query('INSERT INTO pawfection.users(fullName, emailAddress, cnic, accountType, password) VALUES (?,?,?,?,?)',
            [fullName, emailAddress, cnic, accountType, password], function(err, result, fields) {
                connection.on('error',function(err) {
                    console.log('[MYSQL ERROR]',err);
                    res.json('Account not created. Error: ',err);
                });
                res.json('Account created.');
            });
        }
    });
})

/*application.post('/login/',(req,res,next)=>{
    var post_data = req.body;
    var user_password = post_data.password;
    var emailAddress = post_data.emailAddress;
    var firstName = post_data.firstName;

    connection.query('SELECT * FROM users WHERE firstName=?',[firstName],function(err,result,fields) {
        connection.on('error',function(err) {
            console.log('[MYSQL ERROR]',err);
        });
        
        if(result && result.length) {
            var salt = result[0].salt;
            var password = result[0].password;
            var hashed_password = checkHashPassword(user_password, salt).passwordHash;
            if(password == hashed_password) {
                res.end(JSON.stringify(result[0]))
            }
            else {
                res.json(JSON.stringify('Wrong password.'));
            }
        }
        else {
            res.json('User does not exist.');
        }
    });

   

})*/

/*application.get("/", (req,res,next) => {
    console.log('Password: 123456');
    var encrypt = saltHashPassword("123456");
    console.log('Encrypt: '+encrypt.passwordHash);
    console.log('Salt: '+encrypt.salt);
})*/

application.listen(3000, ()=>{
    console.log('Pawfection Server');
} )