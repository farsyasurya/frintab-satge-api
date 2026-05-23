const admin = require("firebase-admin");

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const token = authHeader.split("Bearer ")[1];

    const decodedToken = await admin
      .auth()
      .verifyIdToken(token);

    req.user = decodedToken;

    next();
  } catch (err) {
    res.status(401).json({
      message: "Invalid token",
    });
  }
};

module.exports = authMiddleware;