

// Проверка, что пользователь имеет одну из разрешённых ролей
function roleMiddleware(allowedRoles = []) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Не авторизован" });
    }

    const userRole = req.user.role;

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ error: "Недостаточно прав" });
    }

    next();
  };
}

// Проверка, что пользователь не заблокирован
function checkBlockedMiddleware(req, res, next) {
  if (req.user && req.user.isBlocked) {
    return res.status(403).json({ error: "Пользователь заблокирован" });
  }
  next();
}

module.exports = { roleMiddleware, checkBlockedMiddleware };