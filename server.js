const inquirer = require("inquirer");
const connection = require("./db/connection");
const query = require("./db/query");

function askActionType() {
  return inquirer.prompt([{
      type: "list",
      name: "actionType",
      message: "What would you like to do?\n",
      choices: ["Bid on an item", "Post an item", "I am finished"]
    }]);
}

function askPostItemInfo() {
  return inquirer.prompt([
    {
      type: "input",
      name: "name",
      message: "What is the name of the item you'd like to post?\n"
    },
    {
      message: "What is category does this item fall into?\n",
      type: "input",
      name: "category"
    },
    {
      mesage: "What is the starting bid of the item? (input a dollar amount)\n",
      type: "input",
      name: "starting_bid"
    }
  ]);
}

function getItemsList(itemsData) {
  return itemsData.map(item => `${item.id}. ${item.name}`);
}

async function askBidItem(itemsData) {
  const itemsList = getItemsList(itemsData);

  const {chosenItemToBidOn} = await inquirer.prompt([{
      message: "Which item would you like to bid on?\n",
      type: "list",
      name: "chosenItemToBidOn",
      choices: itemsList
    }]);

  return parseInt(chosenItemToBidOn);
}

async function askBidAmount() {
  const {bidAmount} = await inquirer.prompt([{
    message: "How much would you like to bid? (input a dollar amount)\n",
    type: "input",
    name: "bidAmount"
  }]);

  return parseInt(bidAmount);
}

function checkIfHighestBid(bidAmount, chosenItemId, itemsData) {
  const currentHighestBid = itemsData.find((item) => item.id === chosenItemId).highest_bid;

  return bidAmount > currentHighestBid;
}

async function askIfBidAgain() {
  const {bidAgain} = await inquirer.prompt([{
    message: "You didn't outbid the highest bid. Would you like to bid again?",
    type: "confirm",
    name: "bidAgain"
  }]);

  return bidAgain;
}

async function handleHighestBid(bidAmount, chosenItemId, itemsData) {
  await query.updateHighestBid(bidAmount, chosenItemId);

  const itemsList = getItemsList(itemsData);
  const chosenItem = itemsList.find(item => parseInt(item) === chosenItemId);

  console.log(`You now have the highest bid for
${chosenItem} - $${bidAmount}\n`);

  return;
}

async function handleBid(chosenItemId, itemsData) {
  const bidAmount = await askBidAmount();
  
  const madeHighestBid = await checkIfHighestBid(bidAmount, chosenItemId, itemsData);

  if (madeHighestBid) {
    return await handleHighestBid(bidAmount, chosenItemId, itemsData);
  } else {
    return await askIfBidAgain() ? await handleBid(chosenItemId, itemsData) : await handleActionType();
  }
}

async function handleBidOnItem() {
  const itemsData = await query.getItemsToBidOn();
  const chosenItemId = await askBidItem(itemsData);

  return await handleBid(chosenItemId, itemsData);
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