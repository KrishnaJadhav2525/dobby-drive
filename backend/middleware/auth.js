const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    const err = new Error('Not authorized, no token provided');
    err.status = 401;
    return next(err);
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Attach user id to request (avoid fetching full user on every request)
    req.user = { id: decoded.id };
    next();
  } catch (error) {
    const err = new Error('Not authorized, token invalid or expired');
    err.status = 401;
    next(err);
  }
};

module.exports = { protect };
