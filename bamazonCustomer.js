var mysql = require("mysql");
var inquirer = require("inquirer");
require("console.table");
var config = require('./config.js');
var connection = mysql.createConnection(config);


connection.connect(function(err) {
    if (err) throw err;
    runPurchase();
});


var runPurchase = function() {

    //show customer available items on sale
    connection.query("SELECT item_id, product_name, price FROM products", function(err, res) {
        console.table(res);
    });

    //make all data from products table available
    connection.query("SELECT * FROM products", function(err, res) {
        if (err) throw err;

        inquirer.prompt([{
            name: "id",
            type: "input",
            message: "What would you like to phurchase? (enter item ID)"
        }, {
            name: "quantity",
            type: "input",
            message: "How many would you like to buy?"
        }]).then(function(answer) {
            var id = answer.id;
            var quantity = answer.quantity;
            // console.log(id, quantity);

            //identify the item chosen by item_id
            var chosenItem;
            var itemFound = false;

            //make sure the id entered match one of the item ids  
            for (var i = 0; i < res.length; i++) {
                if (res[i].item_id == id) {
                    chosenItem = res[i];
                    itemFound = true;
                }
            }

            if (itemFound === true) {

                // determine if it's out of stock 
                var new_stock = chosenItem.stock_quantity - quantity;
                // console.log(new_stock);
                //if in stock, sell the item --- update stock_quantity, product_sales, and show total$
                if (new_stock > 0) {

                    connection.query("UPDATE products SET ? WHERE ?", [{
                        stock_quantity: new_stock,
                        product_sales: chosenItem.product_sales += chosenItem.price * quantity,
                    }, {
                        item_id: chosenItem.item_id
                    }], function(error) {
                        if (error) throw err;

                        //update total_sales column in the departments table
                        //first make all data from deparemnts available for manipulation
                        connection.query("SELECT * FROM departments", function(err, res) {

                            var chosenDepartment;
                            //find the department to add total_sales value to 
                            for (var i = 0; i < res.length; i++) {
                                if (res[i].department_name == chosenItem.department_name) {
                                    chosenDepartment = res[i];
                                }
                            }


                            //here we update the total_sales of the deparment of the product sold
                            connection.query("UPDATE departments SET ? WHERE ?", [{

                                total_sales: (chosenDepartment.total_sales += chosenItem.price * quantity).toFixed(2)
                            }, {
                                department_name: chosenItem.department_name
                            }], function(error) {
                                if (error) throw err;
                            });


                            // console.table(res);
                        });

                        //for development, show updated table
                        console.log("Update successfully!\n");
                        connection.query("SELECT * FROM products", function(err, res) {
                            console.table(res);

                            console.log("It's in stock!");
                            console.log("Your total is: $" + (chosenItem.price * quantity).toFixed(2));

                            //once done, ask if the customer wants to purchase another item     
                            inquirer.prompt({
                                name: "morePurchase",
                                type: "list",
                                choices: ["YES", "NO"],
                                message: "Would you like to make another purchase?"
                            }).then(function(answer) {
                                if (answer.morePurchase === "YES") {
                                    runPurchase();
                                } else if (answer.morePurchase === "NO") {
                                    console.log("Thank you for your purchase. See you again soon!");
                                    connection.end();
                                }
                            });
                        });
                    });

                } else {
                    console.log("Sorry we don't have that many " + chosenItem.product_name + "!Please choose another quantity or item.")
                    runPurchase();
                }

            } else if (itemFound === false) {
                console.log("Item ID not found! Choose another item.");
                runPurchase();
            }
        });
    });
}
