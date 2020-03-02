// ###############################################################################
// Web Technology at VU University Amsterdam
// Assignment 3
//
// The assignment description is available on Canvas.
// Please read it carefully before you proceed.
//
// This is a template for you to quickly get started with Assignment 3.
// Read through the code and try to understand it.
//
// Have you read the zyBook chapter on Node.js?
// Have you looked at the documentation of sqlite?
// https://www.sqlitetutorial.net/sqlite-nodejs/
//
// Once you are familiar with Node.js and the assignment, start implementing
// an API according to your design by adding routes.


// ###############################################################################
//
// Database setup:
// First: Open sqlite database file, create if not exists already.
// We are going to use the variable "db' to communicate to the database:
// If you want to start with a clean sheet, delete the file 'phones.db'.
// It will be automatically re-created and filled with one example item.

const sqlite = require('sqlite3').verbose();
let db = my_database('./phones.db');

// ###############################################################################
// The database should be OK by now. Let's setup the Web server so we can start
// defining routes.
//
// First, create an express application `app`:
var express = require("express");
var bodyParser = require("body-parser");
var app = express();


// enable recieving JSON data
app.use(bodyParser.json());

// Route for getting the list of devices
app.get('/devices', function(req, res) {
    // sql statement
    const sql = `SELECT * FROM phones`;
    db.all(sql, [], (err, rows) => {
        if (err) throw err;

        // send response for the request
        // if the rows are empty, a error message will be printed
        if (rows.length > 0) {
            res.status(200);
            return res.json(rows);
        } else {
            res.status(404);
            return res.json('No devices in the database!');
        }
    });
});

// Route for getting one specific device
app.get('/devices/:id', function(req, res) {
    const id = req.params.id;
    const sql = `SELECT * FROM phones WHERE id="${id}"`;

    // look for the device with the given id
    db.all(sql, [], (err, row) => {
        if (err) throw err;

        // send response for the request
        // if the rows are empty, a error message will be printed
        if (row.length == 0) {
            res.status(404);
            return res.json('Device with the id ' + id + ' was not found!');
        } else {
            res.status(200);
            return res.json(row);
        }
    });
});

// Route for inserting data into the Database
app.post('/add', function(req, res) {
    // data for addind a new device
    const brand = req.body.brand;
    const model = req.body.model;
    const os = req.body.os;
    const image = req.body.image;
    const screensize = req.body.screensize;

    // check if neccesary data is in the body
    if (!brand || !model) {
        return res.status(400).send('Bad request! Brand and model for device are required to add a new device!');
    }
    // check if data in database
    const sqlCheck = `SELECT * FROM phones 
                      WHERE brand="${brand}" AND model="${model}" AND os="${os}" AND image="${image}" AND screensize="${screensize}"`;

    db.all(sqlCheck, [], function(err, row) {

        if (err) return console.log(err.message);

        // if the sqlCheck request returns one row, then the device already exists on the database
        if (row.length > 0) {
            console.log('Device already in datbase, aborting request...');
            res.status(400);
            return res.json('Bad request! Device is already in the database!');
        }
        // execute, when sqlCheck returns an empty row
        else {
            console.log('Device not in database, continue request...');
            res.status(200);

            // sql command
            const sql = `INSERT INTO phones (brand, model, os, image, screensize)
                VALUES("${brand}", "${model}", "${os}", "${image}", "${screensize}")`;

            // add the new element in the database with sql
            db.run(sql, [], function(err) {
                if (err) return console.log(err.message);

                console.log(`Device with ${this.lastID} created...`);
                return res.json(`New element with id ${this.lastID} got created!`);
            });

        }
    });
});

// Route for updating data over the device id in the Database
app.put('/update/:id', function(req, res) {
    // data for updating
    const id = req.params.id;
    const brand = req.body.brand;
    const model = req.body.model;
    const os = req.body.os;
    const image = req.body.image;
    const screensize = req.body.screensize;

    // sql command
    const sqlCheck = `SELECT * FROM phones WHERE id="${id}"`;

    // look up the device with SQL first
    db.all(sqlCheck, [], function(err, row) {
        if (err) return console.error(err.message);
        // execute, when the row has no element and print error
        if (!row) return res.status(404).send('Device with the id ' + id + ' was not found!');

        // execute, when the row has one element
        else {
            // sql command
            const sql2 = `UPDATE phones
                          SET brand="${brand}", model="${model}", os="${os}", image="${image}", screensize="${screensize}"
                          WHERE id="${id}"`;

            // SQL logic to update course
            db.run(sql2, [], function(err) {
                if (err) return console.error(err.message);

                // send response
                res.status(200);
                console.log('Device with id ' + id + ' was updated successfully!');
                return res.json(row);
            });
        }
    });
});

// Route for deleting a device with a given id
app.delete('/delete/:id', function(req, res) {
    // search for device with given id
    const id = req.params.id;
    const sqlCheck = `SELECT * FROM phones WHERE id="${id}"`;
    db.all(sqlCheck, [], function(err, row) {
        if (err) return console.error(err.message);

        // execute, when device not in the database
        if (row.length == 0) {
            res.status(404);
            return res.json(`Device with id: ${id} was not found in the database!`);
        } else {
            res.status(200);
            const sql = `DELETE FROM phones WHERE id="${id}"`;

            db.run(sql, [], function(err) {
                if (err) return console.error(err.message);
            });

            console.log('Device with id ' + id + ' was deleted successfully...');
            return res.json('Device got deleted!');

        }
    });
});

// Route for clearing all data in the database
app.delete('/db-clear', function(req, res) {
    const sql = `DELETE FROM phones`;
    db.run(sql, [], function(err) {
        if (err) return console.error(err.message);
        console.log('All data in the database got cleared successfully!');

        res.status(200);
        return res.json("All data on table got erased!");
    });
});

// ###############################################################################
// This should start the server, after the routes have been defined, at port 3000:

app.listen(3000);
console.log('Listening on port 3000 ...');

// ###############################################################################
// Some helper functions called above
function my_database(filename) {
    // Conncect to db by opening filename, create filename if it does not exist:
    var db = new sqlite.Database(filename, (err) => {
        if (err) {
            console.error(err.message);
        }
        console.log('Connected to the phones database.');
    });
    // Create our phones table if it does not exist already:
    db.serialize(() => {
        db.run(`
        	CREATE TABLE IF NOT EXISTS phones
        	(id 	INTEGER PRIMARY KEY,
        	brand	CHAR(100) NOT NULL,
        	model 	CHAR(100) NOT NULL,
        	os 	CHAR(10) NOT NULL,
        	image 	CHAR(254) NOT NULL,
        	screensize INTEGER NOT NULL
        	)`);
        db.all(`select count(*) as count from phones`, function(err, result) {
            if (result[0].count == 0) {
                db.run(`INSERT INTO phones (brand, model, os, image, screensize) VALUES (?, ?, ?, ?, ?)`, ["Fairphone", "FP3", "Android", "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/Fairphone_3_modules_on_display.jpg/320px-Fairphone_3_modules_on_display.jpg", "5.65"]);
                console.log('Inserted dummy phone entry into empty database');
            } else {
                console.log("Database already contains", result[0].count, " item(s) at startup.");
            }
        });
    });
    return db;
}