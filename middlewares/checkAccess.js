// const jwt = require('jsonwebtoken');
// const APP_SECRET = env.process.APP_SECRET; // Thay thế bằng key của bạn

// // Middleware kiểm tra token
// const checkAccessToken = (req, res, next) => {
//   const token = req.headers.authorization?.split(' ')[1]; // Lấy token từ header

//   if (!token) {
//     return res.status(401).json({ message: 'No token provided' });
//   }

//   try {
//     // Giải mã token và lấy thông tin người dùng (userId)
//     const decoded = jwt.verify(token, APP_SECRET);

//     // Lưu thông tin người dùng vào req.user
//     req.user = decoded; // Giả sử decoded chứa userId

//     next(); // Tiếp tục xử lý request
//   } catch (error) {
//     return res.status(403).json({ message: 'Invalid token' });
//   }
// };
