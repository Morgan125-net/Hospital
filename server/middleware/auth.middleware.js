const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const secret = process.env.JWT_SECRET;

    if (!authHeader) {
      return res.status(401).json({
        message: "Access denied. No token.",
      });
    }

    if (!secret) {
      return res.status(500).json({
        message: "Server misconfigured. JWT_SECRET is required.",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, secret);

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid token.",
    });
  }
};

module.exports = auth;
