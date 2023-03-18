import { io } from "https://cdn.socket.io/4.4.1/socket.io.esm.min.js";

const socket = io("https://cassava-garri-chatbot.onrender.com/");
const chatHistory = document.getElementById("chat-history");
const inputCon = document.getElementById("input-container");
const msgInput = document.getElementById("msg-input");
const chatWindow = document.querySelector(".chat-window");
let options;

inputCon.addEventListener("submit", (e) => {
  e.preventDefault();
  const chat = msgInput.value.trim();
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
  handlingScroll();
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
  const htmlFormattedOpts = `<p><ol start=3 style="list-style-type:decimal; list-style-position:inside;">${menu
    .map(
      (item) => `<li>${item.name} -- #${item.price}</li>`
    )
    .join("")}</ol></p>
    <p class="font-bold mt-4">Note: If you want to order multiple item select them together by adding a comma then next item </p>
    <p class="font-bold" > For example 3,4,5 </p>`;
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
      (item) => `<li class="my-2">${item.name} -- #${item.price}</li>`
    )
    .join("")} Total is <span class="font-bold"> #${total} </span></ul></p>`;
  displayMessage(htmlFormattedOpts, true);
}

function displayOrderHistory(orders) {
  const htmlFormattedOpts = `<p><ul>${orders
    .map(
      (order) => `<li class="my-2" >${order.orders.map((item) => `<li class="my-2">${item.name}</li>`).join("")}</li>`
    )
    .join("")}</ul></p>`;
  displayMessage(htmlFormattedOpts, true);
}
