
// import service from "./services/messageService";
import socketService from './socketService';
import jwt from 'jsonwebtoken';


import { Server } from "socket.io";

const server = require('http').createServer();


const io = new Server(server, {
  cors: {
    origin: "*", // Cho phép tất cả IP truy cập
    methods: ["GET", "POST"], // Các phương thức HTTP được chấp nhận
    credentials: false        // Tắt yêu cầu gửi cookie nếu không cần
  }
});

// Kiểm tra token trước khi kết nối
io.use((socket, next) => {
  const token = socket.handshake.auth?.token;

  console.log("token1", token);

  if (!token) {
    const err = new Error('Cần có token');
    return next(err);
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = decoded;
    next(); // Cho phép kết nối
  } catch (err) {
    console.log("errrrrrrrr", err);
    next(new Error('Authentication error: Invalid token'));
  }
})

// HÀM NÀY ĐỂ XỬ LÝ CÁC SỰ KIỆN SOCKET


/////////////////////////////////////////////////////////////
// lắng nghe kết nối

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // lắng nghe sự kiện online
  socket.on('online', (data) => socketService.online(socket, data));

  // lắng nghe sự kiện gửi tin nhắn
  socket.on('sendMessage', (data) => socketService.sendMessage(socket, data));

  // lắng nghe sự kiện xem tin nhắn
  socket.on('seenMessage', (data) => socketService.seenMessage(socket, data));

  // Lắng nghe sự kiện ngắt kết nối
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
})

server.listen(8000, () => {
  console.log('socket on *:8000');
});

export { io };



// io.on('connection', (socket) => {
//   console.log('User connected:', socket.id);

//   socket.on("online", async (data) => {
//     console.log('Message received:', data);
//     try {
//       const { userId } = data;
//       // Gọi hàm sendMessage
//       const roomName = `room-${userId}`
//       console.log('roomName', roomName)
//       socket.join(roomName)

//     } catch (error) {
//       socket.emit('error', { message: error.message });
//     }
//   });
//   // Lắng nghe sk gửi tin nhắn
//   socket.on("sendMessage", async (data) => {
//     console.log('Message received:', data);
//     try {
//       const { userId, userRecieveId, message } = data;
//       // Gọi hàm sendMessage
//       // const newMessage = await sendMessage({ userId, userRecieveId, message });

//       // Phát sự kiện tin nhắn đã được gửi tới người nhận
//       socket.emit('sended', { success: true, message: 'Gửi tin nhắn thành công', data: data });

//       // Gửi tin nhắn lại cho người dùng khác
//       // io.to(data.userRecieveId).emit('newMessages', {
//       //   senderId: data.userId,
//       //   message: data.message
//       // });
//       const reviceRoom = `room-${userRecieveId}`
//       console.log("reviceRoom", reviceRoom)
//       io.to(reviceRoom).emit('newMessages', data);
//     } catch (error) {
//       console.log("e", error)
//       socket.emit('error', { message: error.message });
//     }
//   });

//   // Lắng nghe sự kiện xem tin nhắn
//   socket.on("seenMessage", async (data) => {
//     try {
//       const { userRecieveId, messageId } = data;
//       // Gọi hàm xem tin nhắn
//       const result = await seenMessage({ userRecieveId, messageId });

//       // Phát sự kiện tin nhắn đã được xem
//       socket.emit('viewed', { success: true, message: 'Tin nhắn đã được đánh dấu là đã xem', data: result });

//       // Phát sự kiện cập nhật trạng thái tin nhắn cho tất cả các client
//       socket.broadcast.emit('viewed', result);
//     } catch (error) {
//       socket.emit('error', { message: error.message });
//     }
//   });
//   // Lắng nghe sự kiện ngắt kết nối
//   socket.on('disconnect', () => {
//     console.log('User disconnected:', socket.id);
//   });
// });
// //////////////////////////////////////////////////////////

// server.listen(8000, () => {
//   console.log('socket on *:8000');
// });

// export { io }

// chưa cần làm kiểm tra token vội, làm kiểm tra token sau
// validate nốt những phần get



// khi 1 user đăng nhập thì tạo ra 1 room của tài khoản đó( ví dụ người đó dùng, điện thoại, máy tính)
// khi 1 user khác nhắn tin cho user đó thì sẽ nhắn cho cả room đó tức là nhắn cho tất cả các thiết bị của room đó
// XEM LẠI PHẦN NÀY       // Gửi tin nhắn lại cho người dùng khác
// io.to(data.userRecieveId).emit('newMessages', {
//   senderId: data.userId,
//   message: data.message
// });
// socket.broadcast.emit('newMessages', newMessage);



// đang sai cách import
// có thể tạo 1 file socket service mới và coi file này là controller, sau đó import như các api kia
