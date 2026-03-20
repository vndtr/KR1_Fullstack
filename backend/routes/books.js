const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const { roleMiddleware, checkBlockedMiddleware } = require("../middleware/role");

let books = require("../data/books");
// Вспомогательная функция для поиска книги по ID
function findById(id) {
  const num = Number(id);
  if (isNaN(num)) return null;
  return books.find(b => b.id === num);
}

/**
 * @swagger
 * /api/books:
 *   get:
 *     summary: Получить список всех книг
 *     tags: [Books]
 *     description: Доступно всем (даже без авторизации)
 *     responses:
 *       200:
 *         description: Список книг
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Book'
 */
// GET /api/books
router.get("/", (req, res) => {
  res.json(books);
});

/**
 * @swagger
 * /api/books/{id}:
 *   get:
 *     summary: Получить книгу по ID
 *     tags: [Books]
 *     description: Доступно всем (даже без авторизации)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID книги
 *     responses:
 *       200:
 *         description: Данные книги
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Book'
 *       404:
 *         description: Книга не найдена
 */

// GET /api/books/:id
router.get("/:id", (req, res) => {
const book = findById(req.params.id);
  
  if (!book) {
    return res.status(404).json({ error: "Книга не найдена" });
  }
  
  res.json(book);
});

router.use(authMiddleware);
router.use(checkBlockedMiddleware);

/**
 * @swagger
 * /api/books:
 *   post:
 *     summary: Создать новую книгу
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *     description: Требует роль seller или admin
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BookCreate'
 *     responses:
 *       201:
 *         description: Книга создана
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Book'
 *       400:
 *         description: Ошибка валидации
 *       401:
 *         description: Не авторизован
 *       403:
 *         description: Недостаточно прав
 */

// POST /api/books
router.post("/", roleMiddleware(["seller", "admin"]), (req, res) => {
  const { title, author, category, description, price, stock, rating, image } = req.body;

  if (!title || !price) {
    return res.status(400).json({ error: "Название и цена обязательны" });
  }

  const newId = books.length > 0 ? Math.max(...books.map(b => b.id)) + 1 : 1;
  
  const newBook = {
    id: newId,
    title,
    author: author || "Неизвестен",
    category: category || "другое",
    description: description || "",
    price: Number(price),
    stock: stock || 0,
    rating: rating || 0,
    image: image || "/images/default.jpg"
  };

  books.push(newBook);
  res.status(201).json(newBook);
});

/**
 * @swagger
 * /api/books/{id}:
 *   put:
 *     summary: Полностью обновить книгу
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *     description: Требует роль seller или admin
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID книги
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BookUpdate'
 *     responses:
 *       200:
 *         description: Книга обновлена
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Book'
 *       400:
 *         description: Ошибка валидации
 *       401:
 *         description: Не авторизован
 *       403:
 *         description: Недостаточно прав
 *       404:
 *         description: Книга не найдена
 */

// PUT /api/books/:id — полностью обновить книгу (только seller и admin)
router.put("/:id", roleMiddleware(["seller", "admin"]), (req, res) => {
  const id = Number(req.params.id);
  const index = books.findIndex(b => b.id === id);
  
  if (index === -1) {
    return res.status(404).json({ error: "Книга не найдена" });
  }

  const { title, author, category, description, price, stock, rating, image } = req.body;

  if (!title || !price) {
    return res.status(400).json({ error: "Название и цена обязательны" });
  }

  books[index] = {
    id,
    title,
    author: author || books[index].author,
    category: category || books[index].category,
    description: description || books[index].description,
    price: Number(price),
    stock: stock !== undefined ? stock : books[index].stock,
    rating: rating !== undefined ? rating : books[index].rating,
    image: image || books[index].image
  };

  res.json(books[index]);
});

/**
 * @swagger
 * /api/books/{id}:
 *   patch:
 *     summary: Частично обновить книгу
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *     description: Требует роль seller или admin
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID книги
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BookUpdate'
 *     responses:
 *       200:
 *         description: Книга обновлена
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Book'
 *       401:
 *         description: Не авторизован
 *       403:
 *         description: Недостаточно прав
 *       404:
 *         description: Книга не найдена
 */
// PATCH /api/books/:id
router.patch("/:id", roleMiddleware(["seller", "admin"]), (req, res) => {
  const id = Number(req.params.id);
  const book = books.find(b => b.id === id);
  
  if (!book) {
    return res.status(404).json({ error: "Книга не найдена" });
  }

  const { title, author, category, description, price, stock, rating, image } = req.body;

  if (title) book.title = title;
  if (author) book.author = author;
  if (category) book.category = category;
  if (description) book.description = description;
  if (price) book.price = Number(price);
  if (stock !== undefined) book.stock = stock;
  if (rating !== undefined) book.rating = rating;
  if (image) book.image = image;

  res.json(book);
});

/**
 * @swagger
 * /api/books/{id}:
 *   delete:
 *     summary: Удалить книгу
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *     description: Требует роль admin
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID книги
 *     responses:
 *       204:
 *         description: Книга успешно удалена
 *       401:
 *         description: Не авторизован
 *       403:
 *         description: Недостаточно прав (требуется admin)
 *       404:
 *         description: Книга не найдена
 */

// DELETE /api/books/:id
router.delete("/:id", roleMiddleware(["admin"]), (req, res) => {
  const id = Number(req.params.id);
  const index = books.findIndex(b => b.id === id);
  
  if (index === -1) {
    return res.status(404).json({ error: "Книга не найдена" });
  }

  books.splice(index, 1);
  res.status(204).send();
});

module.exports = router;

