const mysql = require('mysql2/promise');


const pool = mysql.createPool({
    host:"localhost" ,
    user:"root",
    password:"53905390",
    database:"gatormartdb",
    connectionLimit:50,
    queueLimit: 0,
    debug: false,
    insecureAuth: true
});


module.exports = pool;