// backend/data/users.js
module.exports = [
  {
    id: "user1",
    email: "user@mail.ru",
    firstName: "Обычный",
    lastName: "Пользователь",
    password: "$2b$10$UwLTphB81n24wmX.Jhgi..ayxhtIE9bAwkqIg12..kW5J2SZua746",
    role: "user",
    isBlocked: false
  },
  {
    id: "seller1",
    email: "seller@mail.ru",
    firstName: "Продавец",
    lastName: "Иванов",
    password: "$2b$10$UwLTphB81n24wmX.Jhgi..ayxhtIE9bAwkqIg12..kW5J2SZua746",
    role: "seller",
    isBlocked: false
  },
  {
    id: "admin1",
    email: "admin@bookstore.com",
    firstName: "Админ",
    lastName: "Системный",
    password: "$2b$10$UwLTphB81n24wmX.Jhgi..ayxhtIE9bAwkqIg12..kW5J2SZua746",
    role: "admin",
    isBlocked: false
  }
];