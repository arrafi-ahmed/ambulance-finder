const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const token = req.header("authorization");
  if (!token) return res.status(401).json({ message: "Access denied" });
  try {
    const decode = jwt.verify(token, process.env.TOKEN_SECRET);
    req.userId = decode.id;
    next();
  } catch (error) {
    res.status(400).json({ message: "Invalid token" });
  }
};
