
const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const { nanoid } = require("nanoid");

let users = require("../data/users");
const authMiddleware = require("../middleware/auth");
const { roleMiddleware } = require("../middleware/role");

// Все маршруты в этом файле требуют авторизации и роли admin
router.use(authMiddleware);
router.use(roleMiddleware(["admin"]));

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Получить список всех пользователей
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     description: Требует роль admin
 *     responses:
 *       200:
 *         description: Список пользователей
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       401:
 *         description: Не авторизован
 *       403:
 *         description: Недостаточно прав
 */

// GET /api/users — список всех пользователей
router.get("/", (req, res) => {
  const usersWithoutPasswords = users.map(({ password, ...rest }) => rest);
  res.json(usersWithoutPasswords);
});

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Получить пользователя по ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     description: Требует роль admin
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID пользователя
 *     responses:
 *       200:
 *         description: Данные пользователя
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: Пользователь не найден
 *       401:
 *         description: Не авторизован
 *       403:
 *         description: Недостаточно прав
 */

// GET /api/users/:id — получить пользователя по id
router.get("/:id", (req, res) => {
  const user = users.find(u => u.id === req.params.id);
  if (!user) {
    return res.status(404).json({ error: "Пользователь не найден" });
  }
  const { password, ...userWithoutPassword } = user;
  res.json(userWithoutPassword);
});

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Обновить пользователя
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     description: Требует роль admin
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID пользователя
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserUpdate'
 *     responses:
 *       200:
 *         description: Пользователь обновлён
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: Пользователь не найден
 *       401:
 *         description: Не авторизован
 *       403:
 *         description: Недостаточно прав
 */

// PUT /api/users/:id — обновить пользователя
router.put("/:id", async (req, res) => {
  const { email, firstName, lastName, role, isBlocked, password } = req.body;
  const userIndex = users.findIndex(u => u.id === req.params.id);
  
  if (userIndex === -1) {
    return res.status(404).json({ error: "Пользователь не найден" });
  }

  // Обновляем поля
  if (email) users[userIndex].email = email;
  if (firstName) users[userIndex].firstName = firstName;
  if (lastName) users[userIndex].lastName = lastName;
  if (role) users[userIndex].role = role;
  if (isBlocked !== undefined) users[userIndex].isBlocked = isBlocked;
  if (password) {
    users[userIndex].password = await bcrypt.hash(password, 10);
  }

  const { password: _, ...userWithoutPassword } = users[userIndex];
  res.json(userWithoutPassword);
});

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Заблокировать пользователя
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     description: Требует роль admin (блокировка, не удаление)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID пользователя
 *     responses:
 *       200:
 *         description: Пользователь заблокирован
 *       404:
 *         description: Пользователь не найден
 *       401:
 *         description: Не авторизован
 *       403:
 *         description: Недостаточно прав
 */

// DELETE /api/users/:id — заблокировать пользователя
router.delete("/:id", (req, res) => {
  const userIndex = users.findIndex(u => u.id === req.params.id);
  
  if (userIndex === -1) {
    return res.status(404).json({ error: "Пользователь не найден" });
  }

  // Блокируем пользователя
  users[userIndex].isBlocked = true;
  users[userIndex].role = "user"; // сбрасываем роль

  const { password, ...userWithoutPassword } = users[userIndex];
  res.json({ message: "Пользователь заблокирован", user: userWithoutPassword });
});

module.exports = router;