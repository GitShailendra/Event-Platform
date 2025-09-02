module.exports = (req, res, next) => {
  if (req.userRole && req.userRole === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied, admin only' });
  }
};