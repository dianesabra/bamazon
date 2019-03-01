var mysql = require("mysql");
var inquirer = require("inquirer");
var itemStr = "";

var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "Khara6290",
  database: "bamazon"
});

connection.connect(function(err) {
  if (err) throw err;
  displayItems();
});

function displayItems() {
  console.log("Selecting all items...\n");
  connection.query("SELECT * FROM products", function(err, response) {
    if (err) throw err;
    itemStr = "Item ID Product Name Price \n";
    for (var i = 0; i < response.length; i++) {
      itemStr +=
        response[i].item_id +
        "       " +
        response[i].product_name +
        " $" +
        response[i].price +
        "\n";
    }
    console.log(itemStr);
    runQuestions(response.length);
  });
}

function runQuestions(maxNum) {
  inquirer
    .prompt([
      {
        type: "input",
        message: "Please enter the Item ID you would like to buy?",
        name: "itemID"
      },

      {
        type: "input",
        message: "How many would you like to buy?",
        name: "purchaseQty"
      }
    ])
    .then(function(iResponse) {
      if (iResponse.itemID > maxNum || iResponse.itemID < 1) {
        console.log("Enter a valid ID.");
        runQuestions(maxNum);
      } else if (iResponse.purchaseQty < 0) {
        console.log("Please enter a positive quantity.");
        runQuestions(maxNum);
      } else {
        connection.query(
          "SELECT * FROM products WHERE ?",
          {
            item_id: iResponse.itemID
          },
          function(err, res) {
            if (err) throw err;
            var sQty = res[0].stock_quantity;
            if (sQty >= iResponse.purchaseQty) {
              totalCost = res[0].price * iResponse.purchaseQty;
              console.log("The total cost of your order is $" + totalCost);
              connection.query(
                "UPDATE products SET ? WHERE ?",
                [
                  {
                    stock_quantity: sQty - iResponse.purchaseQty
                  },
                  {
                    item_id: iResponse.itemID
                  }
                ],
                function(err, res2) {
                  if (err) throw err;
                  connection.end();
                }
              );
            } else {
              console.log("Insufficient Quantity!");
              connection.end();
            }
          }
        );
      }
    });
}
