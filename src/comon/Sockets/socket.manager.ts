import { getConnectedSockets, getIo } from "./sockets.server";




export const emitToUser = (
  userId: string,
  event: string,
  payload: any,
) => {
  const io = getIo();
  const connectedSockets = getConnectedSockets();

  const userSockets = connectedSockets.get(userId) || [];

  userSockets.forEach((socketId) => {
    io.to(socketId).emit(event, payload);
  });
};

export const emitToUsers = (
  userIds: string[],
  event: string,
  payload: any,
) => {
  const io = getIo();
  const connectedSockets = getConnectedSockets();

  userIds.forEach((userId) => {
    const userSockets = connectedSockets.get(userId) || [];

    userSockets.forEach((socketId) => {
      io.to(socketId).emit(event, payload);
    });
  });
};