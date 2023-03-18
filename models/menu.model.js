const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const menuSchema = new Schema({
  mealNo: Number,
  name: String,
  price: Number,
});

const Menu = mongoose.model("menuList", menuSchema);

module.exports = Menu;

const menuList = [
  {
    name: "Jollof Rice",
    price: "700",
    mealNo: "100",
  },
  {
    name: "Fried Rice",
    price: "800",
    mealNo: "101",
  },
  {
    name: "Turkey",
    price: "300",
    mealNo: "102",
  },
  {
    name: "Chichen",
    price: "300",
    mealNo: "103",
  },
  {
    name: "Beef",
    price: "100",
    mealNo: "104",
  },
  {
    name: "Snail",
    price: "500",
    mealNo: "105",
  },
  {
    name: "Ice-cream",
    price: "100",
    mealType: "dessert",
    mealNo: "106",
  },
  {
    name: "Asun Spaghetti",
    price: "600",
    mealNo: "107",
  },
  {
    name: "Suya Noodles",
    price: "400",
    mealNo: "108",
  },
  {
    name: "Rice & Beans",
    price: "500",
    mealNo: "109",
  },
  {
    name: "Amala & Ewedu",
    price: "800",
    mealNo: "110",
  }
];

// (async () => {
//   const res = await Menu.create(menuList);
//   console.log(res);
// })();
