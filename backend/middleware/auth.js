
const jwt = require("jsonwebtoken");
const users = require("../data/users");

const ACCESS_SECRET = "bookstore_access_secret_2026";

function authMiddleware(req, res, next) {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ error: "Не авторизован" });
  }

  try {
    const payload = jwt.verify(token, ACCESS_SECRET);
    
    // Находим пользователя в базе (проверяем, не заблокирован ли)
    const user = users.find(u => u.id === payload.sub);
    
    if (!user) {
      return res.status(401).json({ error: "Пользователь не найден" });
    }

    // Добавляем информацию о роли и блокировке
    req.user = {
      ...payload,
      role: user.role,
      isBlocked: user.isBlocked || false
    };
    
    next();
  } catch (err) {
    return res.status(401).json({ error: "Невалидный или истекший токен" });
  }
}

module.exports = authMiddleware;