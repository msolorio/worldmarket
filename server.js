const inquirer = require("inquirer");
const connection = require("./db/connection");
const query = require("./db/query");

// ASK USER IF THEY WANT TO BID ON OR POST AN ITEM

// IF THEY CHOOSE BID ON AN ITEM
// GET ITEMS FROM DATABASE
// ASK WHICH ITEM THEY WANT TO BID ON
// ASK THEM HOW MUCH THEY WANT TO BID
// SAY IF THEY HAVE THE HIGHEST BID
// IF NOT ASK IF THEY WANT TO BID AGAIN
// OTHERWISE RETURN TO MAIN SCREEN

// IF THEY CHOOSE TO POST AN ITEM
// ASK FOR INFORMATION ABOUT THE ITEM THEY WISH TO POST
// POST THE ITEM IN THE DATABASE
// RETURN THE ITEM INFO TO THE USER SAYING IT WAS POSTED SUCCESSFULLY

function askActionType() {
  return inquirer.prompt([
    {
      type: "list",
      name: "actionType",
      message: "\nWhat would you like to do?\n",
      choices: ["Bid on an item", "Post an item", "I am finished"]
    }
  ]);
}

function askPostItemInfo() {
  return inquirer.prompt([
    {
      type: "input",
      name: "name",
      message: "\nWhat is the name of the item you'd like to post?\n"
    },
    {
      message: "\nWhat is category does this item fall into?\n",
      type: "input",
      name: "category"
    },
    {
      mesage: "\nWhat is the starting bid of the item? (input a dollar amount)\n",
      type: "input",
      name: "starting_bid"
    }
  ]);
}

async function askBidItem(itemList) {
  const {chosenItemToBidOn} = await inquirer.prompt([
    {
      message: "\nWhich item would you like to bid on?\n",
      type: "list",
      name: "chosenItemToBidOn",
      choices: itemList
    }
  ]);

  return chosenItemToBidOn;
}

async function askBidAmount() {
  const {bidAmount} = await inquirer.prompt([{
    message: "\nHow much would you like to bid? (input a dollar amount)\n",
    type: "input",
    name: "bidAmount"
  }]);

  return parseInt(bidAmount);
}

function checkIfHighestBid(bidAmount, chosenItemToBidOn, itemsData) {
  const currentHighestBid = itemsData.find((item) => item.name === chosenItemToBidOn).highest_bid;

  return bidAmount > currentHighestBid;
}

async function askIfBidAgain() {
  const {bidAgain} = await inquirer.prompt([{
    message: "Would you like to bid again?",
    type: "confirm",
    name: "bidAgain"
  }]);

  return bidAgain;
}

async function handleBid(chosenItemToBidOn, itemsData) {
  const bidAmount = await askBidAmount();
  
  const madeHighestBid = await checkIfHighestBid(bidAmount, chosenItemToBidOn, itemsData);

  if (madeHighestBid) {
    console.log("in madeHighestBid if");
  } else {
    await askIfBidAgain() ? await handleBid(chosenItemToBidOn, itemsData) : await handleActionType();
  }
}

async function handleBidOnItem() {
  const itemsData = await query.getItemsToBidOn();
  const itemList = itemsData.map(item => item.name);
  const chosenItemToBidOn = await askBidItem(itemList);

  await handleBid(chosenItemToBidOn, itemsData);
  // SAY IF THEY HAVE THE HIGHEST BID
  // IF NOT ASK IF THEY WANT TO BID AGAIN
  // OTHERWISE RETURN TO MAIN SCREEN
}

async function handlePostAnItem() {
  const postItemInfo = await askPostItemInfo();
  const postedItemInfo = await query.postItemToDB(postItemInfo);

  console.log(`Your item has been posted!

Item Name: ${postedItemInfo.name}
Item Category: ${postedItemInfo.category}
Starting Bid: ${postedItemInfo.starting_bid}
Item Id: ${postedItemInfo.id}`);

  return;
}

function connectToDB() {
  return new Promise((resolve, reject) => {

    connection.connect((err) => {
      if (err) reject(err);

      console.log("connected to DB");

      resolve();
    });
  });
}

async function handleActionType() {
  const {actionType} = await askActionType();

  switch(actionType) {
    case "Bid on an item":
      await handleBidOnItem();
      return handleActionType();

    case "Post an item":
      await handlePostAnItem();
      return handleActionType();

    case "I am finished":
      return connection.end();

    default:
      return "An action wasn't selected";
  }
}

async function init() {
  await connectToDB();

  handleActionType();
}

init();