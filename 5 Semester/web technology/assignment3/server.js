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
var bodyParser = require('body-parser');
var app = express();
// enable recieving JSON data
app.use(bodyParser.json());


// Route for getting the list of devices
app.get('/devices', function(req, res){
  // sql statement
  const sql = `SELECT * FROM phones`;
  db.all(sql, [], (err, rows) => {
    if (err) throw err;

    // send response for the request
    // if the rows are empty, a error message will be printed
    rows ? res.json(rows) : res.status(404).send('No devices in the database!');
  });
});

// Route for getting one specific device
app.get('/devices/:id', function(req, res){
  const id = req.params.id;
  const sql =`SELECT * FROM phones WHERE id="${id}"`;

  // look for the device with the given id
  db.all(sql, [], (err, row) => {
    if (err) throw err;

    // send response for the request
    // if the rows are empty, a error message will be printed
    row ? res.json(row) : res.status(404).send('Device with the id ' + id + ' was not found!');
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

  // check if data in database

  // sql command
  const sql = `INSERT INTO phones (brand, model, os, image, screensize)
                VALUES("${brand}", "${model}", "${os}", "${image}", "${screensize}")`;

  // add the new element in the database with sql
  db.run(sql, [], function(err){
    if(err) {
      return console.log(err.message);
    }
    console.log('Device successfully added!');
    return res.json(`New element with id ${this.lastID} got created!`);
  });
});

// Route for updating data over the device id in the Database --> recieve data from req.body?!
app.put('/update/:id', function(req, res){
  // data for updating
  const id = req.params.id;
  const brand = req.body.brand;
  const model = req.body.model;
  const os = req.body.os;
  const image = req.body.image;
  const screensize = req.body.screensize;

  // sql command
  const sql1 = `SELECT * FROM phones WHERE id="${id}"`;

  // look up the device with SQL first
  db.all(sql1, [], function(err, row) {
    if(err){
      return console.error(err.message);
    }

    if(!row){
      res.status(404).send('Device with the id ' + id + ' was not found!');
    }
  });

  const sql2 =`UPDATE phones
          SET brand="${brand}", model="${model}", os="${os}", image="${image}", screensize="${screensize}"
          WHERE id="${id}"`;

  // SQL logic to update course
  db.run(sql2, [], function(err) {
    if(err){
      return console.error(err.message);
    }
    // send response
    res.send('Device with id ' + id + ' was updated successfully!');

    // TODO: set the appropriate HTTP response headers and HTTP response codes here.

  });
});

// Route for deleting a device with a given id
app.delete('/delete/:id', function(req, res){
  var id = req.params.id;
  var sql = `DELETE FROM phones WHERE id="${id}"`;

  db.run(sql, [], function(err){
    if (err) return console.error(err.message);
  });

  console.log('Device with id ' + id + ' was deleted successfully!');
  res.json('Device was deleted!');
});

// Route for clearing all data in the database
app.delete('/db-clear', function(req, res){
  const sql = `DELETE FROM phones`;
  db.run(sql, [], function(err){
    if (err) {
      return console.error(err.message);
    }
    console.log('All data in the database got cleared successfully!');
    res.json("All data on table got erased!");
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
				db.run(`INSERT INTO phones (brand, model, os, image, screensize) VALUES (?, ?, ?, ?, ?)`,
				["Fairphone", "FP3", "Android", "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/Fairphone_3_modules_on_display.jpg/320px-Fairphone_3_modules_on_display.jpg", "5.65"]);
				console.log('Inserted dummy phone entry into empty database');
			} else {
				console.log("Database already contains", result[0].count, " item(s) at startup.");
			}
		});
	});
	return db;
}
