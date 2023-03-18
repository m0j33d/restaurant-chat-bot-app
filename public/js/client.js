import { io } from "https://cdn.socket.io/4.4.1/socket.io.esm.min.js";

const socket = io("http://localhost:4000");
const chatHistory = document.getElementById("chat-history");
const inputCon = document.getElementById("input-container");
const msgInput = document.getElementById("msg-input");
const chatWindow = document.querySelector(".chat-window");
let options;
inputCon.addEventListener("submit", (e) => {
  e.preventDefault();
  const chat = msgInput.value.trim();
  console.log(chat);
  if (chat) {
    displayMessage(chat, false);
    socket.emit("saveMsg", chat, false);
    msgInput.value = "";
    socket.emit("msgInput", chat);
  }
});

socket.io.on("error", (error) => {
  console.log(error);
});

socket.on("connect", () => {
  displayGreetings();
});

// socket.on("botMessage", (data) => {
//   displayMenu(data);
// });

socket.on("loadChatHistory", (userChatHistory) => {
  displayChatHistory(userChatHistory);
});
socket.on("botInitialMsg", (options) => {
  displayOptions(options);
});
socket.on("botMessage", ({ type, data }) => {
  switch (type) {
    case "menu":
      displayMenu(data, true);
      break;

    case "currentOrder":
      displayCurrOrder(data, true);
      displayOptions(options);
      break;

    case "orderHistory":
      displayOrderHistory(data, true);
      break;
    case "invalidInput":
      displayMessage(data.message, true);
      displayOptions(options);
      break;
    default:
      displayMessage(data.message, true);
      break;
  }
});
function handlingScroll() {
  chatWindow.scrollTo({ top: chatWindow.scrollHeight, behavior: "smooth" });
}
function displayMessage(message, isBotMsg) {
  
  const chatMessage = document.createElement("div");
  chatMessage.className = `chat-text ${isBotMsg ? "bot" : "chat"}-message`;
  chatMessage.innerHTML = message;
  chatHistory.insertAdjacentElement("beforeend", chatMessage);
  // handlingScroll();
}

function displayChatHistory(userChatHistory) {
  userChatHistory.forEach((history) => {
    displayMessage(history.chat, history.isBotMsg);
  });
}

function displayOptions(optsArray) {
  options = optsArray;
  const htmlFormattedOpts = `<p><ul>${optsArray
    .map((opt) => `<li>${opt}</li>`)
    .join("")}</ul></p>`;
  displayMessage(htmlFormattedOpts, true);
}

function displayMenu(menu) {
  const htmlFormattedOpts = `<p><ol start=100 style="list-style-type:decimal; list-style-position:inside;">${menu
    .map(
      (item) => `<li>${item.name} -- #${item.price}</li>`
    )
    .join("")}</ol></p>`;
  displayMessage(htmlFormattedOpts, true);
}

function displayGreetings() {
  const greeting = `<p>Welcome to Foodiest!</span> How can I assist you?</p>`;
  displayMessage(greeting, true);
}
function displayCurrOrder(orders) {
  const total = orders.reduce((prev, item) => prev + item.price, 0);
  const htmlFormattedOpts = `<p><ul>${orders
    .map(
      (item) => `<li>${item.name} -- $${item.price}</li>`
    )
    .join("")} Total is ${total}</ul></p>`;
  displayMessage(htmlFormattedOpts, true);
}

function displayOrderHistory(orders) {
  console.log(orders);
  const htmlFormattedOpts = `<p><ul>${orders
    .map(
      (order) => `<li>${order.orders.map((item) => item.name).join("")}</li>`
    )
    .join("")}</ul></p>`;
  displayMessage(htmlFormattedOpts, true);
}
