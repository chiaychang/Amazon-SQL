var mysql = require("mysql");
var inquirer = require("inquirer");
require("console.table");
var config = require('./config.js');
var connection = mysql.createConnection(config);

connection.connect(function(err) {
    if (err) throw err;
    runManager();
});

var runManager = function() {
    inquirer.prompt({
        name: "action",
        type: "list",
        message: "Here's the Bamazon manager console. What would you like to do?",
        choices: ["View Products for Sale", "View Low Inventory",
            "Add to Inventory", "Add New Product", "Exit"
        ]
    }).then(function(answer) {

        switch (answer.action) {
            case "View Products for Sale":
                viewProducts();
                break;

            case "View Low Inventory":
                lowInventory();
                break;

            case "Add to Inventory":
                addInventory();
                break;

            case "Add New Product":
                addProduct();
                break;
            case "Exit":
                exit();
                break;
        }
    });
};

function viewProducts() {

    connection.query("SELECT item_id, product_name, price, stock_quantity FROM products", function(err, res) {
        if (err) throw err;
        console.table(res);
    });
    runManager();
}


function lowInventory() {
    connection.query("SELECT item_id, product_name, stock_quantity FROM products WHERE stock_quantity <= 5", function(err, res) {
        if (err) throw err;
        console.table(res);
    });
    runManager();
}

function addInventory() {

    connection.query("SELECT item_id, product_name, stock_quantity FROM products", function(err, res) {
        if (err) throw err;
        console.table(res);

        inquirer.prompt([{
            name: "addInvenID",
            type: "input",
            message: "Which item do you want to add inventory to? (enter ID)"
        }, {
            name: "addInvenNumber",
            type: "input",
            message: "How many items would you like to add?"
        }]).then(function(answer) {
            var id = answer.addInvenID;
            var number = answer.addInvenNumber;
            var chosenItem;
            for (var i = 0; i < res.length; i++) {
                if (res[i].item_id == id) {
                    chosenItem = res[i];
                }
            }

            // console.log(chosenItem);
            var newInventory = chosenItem.stock_quantity += parseInt(number);
            // console.log(newInventory);

            connection.query("UPDATE products SET ? WHERE ?", [{
                stock_quantity: newInventory
            }, { item_id: chosenItem.item_id }], function(err, res) {
                if (err) throw err;

                //for development, show updated table
                connection.query("SELECT * FROM products", function(err, res) {
                    console.table(res);
                    console.log("Update successfully!\n");
                    runManager();
                });
            });
        });
    });
}


// insert into products (product_name, department_name, price, stock_quantity, product_sales)
// values ("Frenchie Puppy", "Pets", 2000, 3, 0);

function addProduct() {
    // prompt for info about the product being posted
    inquirer.prompt([{
        name: "name",
        type: "input",
        message: "What is the product you would like to add?"
    }, {
        name: "department",
        type: "input",
        message: "What department does this product listed under?"
    }, {
        name: "price",
        type: "input",
        message: "What's the price of the product?"
    }, {
        name: "stock",
        type: "input",
        message: "How many products are currently available?"
    }]).then(function(answer) {
        // when finished prompting, insert a new item into the db with that info
        connection.query("INSERT INTO products SET ?", {
            product_name: answer.name,
            department_name: answer.department,
            price: answer.price,
            stock_quantity: answer.stock,
            product_sales: 0
        }, function(err) {
            if (err) throw err;
            console.log("Your products was created successfully!");
            //for development, show updated table
            connection.query("SELECT * FROM products", function(err, res) {
                console.table(res);
            });
            runManager();
        });
    });
}

function exit() {
    console.log("Logging Out...");
    connection.end();
}

// var artistSearch = function() {
//   inquirer.prompt({
//     name: "artist",
//     type: "input",
//     message: "What artist would you like to search for?"
//   }).then(function(answer) {
//     var query = "SELECT position, song, year FROM top5000 WHERE ?";
//     connection.query(query, { artist: answer.artist }, function(err, res) {
//       for (var i = 0; i < res.length; i++) {
//         console.log("Position: " + res[i].position + " || Song: " + res[i].song + " || Year: " + res[i].year);
//       }
//       runSearch();
//     });
//   });
// };

// var multiSearch = function() {
//   var query = "SELECT artist FROM top5000 GROUP BY artist HAVING count(*) > 1";
//   connection.query(query, function(err, res) {
//     for (var i = 0; i < res.length; i++) {
//       console.log(res[i].artist);
//     }
//     runSearch();
//   });
// };

// var rangeSearch = function() {
//   inquirer.prompt([{
//     name: "start",
//     type: "input",
//     message: "Enter starting position: ",
//     validate: function(value) {
//       if (isNaN(value) === false) {
//         return true;
//       }
//       return false;
//     }
//   }, {
//     name: "end",
//     type: "input",
//     message: "Enter ending position: ",
//     validate: function(value) {
//       if (isNaN(value) === false) {
//         return true;
//       }
//       return false;
//     }
//   }]).then(function(answer) {
//     var query = "SELECT position,song,artist,year FROM top5000 WHERE position BETWEEN ? AND ?";
//     connection.query(query, [answer.start, answer.end], function(err, res) {
//       for (var i = 0; i < res.length; i++) {
//         console.log("Position: " + res[i].position + " || Song: " + res[i].song
//           + " || Artist: " + res[i].artist + " || Year: " + res[i].year);
//       }
//       runSearch();
//     });
//   });
// };

// var songSearch = function() {
//   inquirer.prompt({
//     name: "song",
//     type: "input",
//     message: "What song would you like to look for?"
//   }).then(function(answer) {
//     console.log(answer.song);
//     connection.query("SELECT * FROM top5000 WHERE ?", { song: answer.song }, function(err, res) {
//       console.log("Position: " + res[0].position + " || Song: " + res[0].song
//         + " || Artist: " + res[0].artist + " || Year: " + res[0].year);
//       runSearch();
//     });
//   });
// };
