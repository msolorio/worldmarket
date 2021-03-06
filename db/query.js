const connection = require("./connection");

function postItemToDB(postItemInfo) {
  return new Promise((resolve) => {
    connection.query("INSERT INTO items SET ?", postItemInfo, (err, results) => {
      if (err) throw `Error posting item to DB: ${err}`;

      postItemInfo.id = results.insertId;

      resolve(postItemInfo);
    });
  })
}

function getItemsToBidOn() {
  try {
    return connection.query("SELECT * FROM items");
  } catch(err) {
    throw `Error getting allItems to bid on: ${err}`;
  }
}

function updateHighestBid(bidAmount, chosenItemId) {
  return connection.query("UPDATE items SET highest_bid = ? WHERE id = ?", [
    bidAmount, chosenItemId
  ]);
}

module.exports = {
  postItemToDB,
  getItemsToBidOn,
  updateHighestBid
};