var mysql = require("mysql");
var inquirer = require("inquirer");
require("console.table");
var config = require('./config.js');
var connection = mysql.createConnection(config);


connection.connect(function(err) {
    if (err) throw err;
    runSupervisor();
});
