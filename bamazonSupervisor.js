var mysql = require("mysql");
var inquirer = require("inquirer");
require("console.table");
var config = require('./config.js');
var connection = mysql.createConnection(config);


connection.connect(function(err) {
    if (err) throw err;
    runSupervisor();
});


function runSupervisor() {
    inquirer.prompt({
        name: "action",
        type: "list",
        message: "Here's the Bamazon supervisor console. What would you like to do?",
        choices: ["View Product Sales by Department", "Create New Department", "Exit"]
    }).then(function(answer) {

        switch (answer.action) {
            case "View Product Sales by Department":
                viewSales();
                break;

            case "Create New Department":
                addDepartment();
                break;

            case "Exit":
                exit();
                break;
        }
    });
};

function viewSales() {
    console.log("\n=====SALES by DEPARTMENT=====");
    connection.query("SELECT department_id, department_name, over_head_costs, total_sales, total_sales - over_head_costs AS total_profit FROM departments", function(err, res) {
        if (err) throw err;
        console.table(res);
        runSupervisor();
    });
}

function addDepartment() {

    inquirer.prompt([{
        name: "name",
        type: "input",
        message: "What is department you would like to add?"
    }, {
        name: "cost",
        type: "input",
        message: "What is the over head cost of the department?"
    }, {
        name: "sales",
        type: "input",
        message: "What's the current total sales of the department?"
    }]).then(function(answer) {
        // when finished prompting, insert a department into the db with the info
        connection.query("INSERT INTO departments SET ?", {
            department_name: answer.name,
            over_head_costs: answer.cost,
            total_sales: answer.sales
        }, function(err) {
            if (err) throw err;
            console.log("A new department was created successfully!\n");
            //for development, show updated table
            connection.query("SELECT * FROM departments", function(err, res) {
                console.table(res);
                runSupervisor();
            });
        });
    });
}

function exit() {
    console.log("Logging Out...");
    connection.end();
}
