// đây là file service, cần import file messageService để gọi hàm
// soketServer là controller, soketServer sẽ gọi file này để nhắn tin được

import { io } from './socketServer';
import messageService from './services/messageService';



export default {
  online: async (socket, data) => {
    try {
      // console.log("socket", socket);
      // console.log("data", data);
      const { userId } = data;
      const roomName = `room-${userId}`;
      socket.join(roomName);
      console.log(`User ${userId} joined room ${roomName}`);
    } catch (error) {
      socket.emit('error', { message: error.message });
    }
  },

  sendMessage: async (socket, data) => {
    try {
      const { userId, userRecieveId, message } = data;
      const newMessage = await messageService.sendMessage({ userId, userRecieveId, message });
      // console.log("newMessage", newMessage);
      const receiveRoom = `room-${userRecieveId}`;

      io.to(receiveRoom).emit('newMessages', data);
      socket.emit('sended', { success: true, message: 'Gửi tin nhắn thành công', data: newMessage });
    } catch (error) {
      socket.emit('error', { message: error.message });
    }
  },

  seenMessage: async (socket, data) => {
    try {
      const { userSendId, userRecieveId, messageId } = data;
      // console.log("userRecieveId", userRecieveId);
      // console.log("messageId", messageId);


      const result = await messageService.seenMessage({ userSendId, userRecieveId, messageId });
      // console.log("result", result);

      // Phát sự kiện `viewed` đến room của người gửi
      const sendRoom = `room-${userSendId}`;
      // console.log("receiveRoom", sendRoom);

      // io.to(receiveRoom).emit('viewed', result);
      // socket.emit()
      io.to(sendRoom).emit('viewed', {
        success: true,
        message: 'Tin nhắn đã được đánh dấu là đã xem',
        data: result
      });
      // socket.emit('viewed', { success: true, message: 'Tin nhắn đã được đánh dấu là đã xem', data: result });
      // socket.broadcast.emit('viewed', result);
    } catch (error) {
      console.log("errr", error);
      socket.emit('error', { message: error.message });
    }
  }
}