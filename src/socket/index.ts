import type { Server as HttpServer } from "http";
import { Server } from "socket.io";
import { notificationModel } from "../database";
import { countData } from "../helper";
import { buildNewOrderNotificationInput, buildNewOrderNotificationPayload } from "./order-notification";

export const ALL_NOTIFICATION_ROOM = "all";
export const ADMIN_NOTIFICATION_ROOM = ALL_NOTIFICATION_ROOM;
export const NEW_ORDER_EVENT = "order:new";

let io: Server | null = null;
export let Io: Server | null = null;

const ioEvents = (ioInstance: Server) => {
  ioInstance.on("connection", (socket) => {
    console.log("Socket client connected");

    socket.on("joinRoom", (data: { roomId?: string }) => {
      const roomId = String(data?.roomId || "").trim();
      if (!roomId) return;

      socket.join(roomId);
    });

    socket.on("joinAll", () => {
      socket.join(ALL_NOTIFICATION_ROOM);
    });

    socket.on("disconnect", () => {
      // Client disconnected
    });
  });
};

export const socketServer = (server: HttpServer) => {
  if (io) return io;

  io = new Server(server, { cors: { origin: "*" } });
  ioEvents(io);
  Io = io;
  return io;
};

export const initializeSocket = (server: HttpServer) => {
  return socketServer(server);
};

export const emitToRoom = (room: string, eventName: string, payload: any) => {
  const roomId = String(room || "").trim();

  if (!Io || !roomId || !eventName) {
    return false;
  }

  Io.to(roomId).emit(eventName, payload);
  return true;
};

export const sendRealTimeUpdate = async (roomIds: string[] = [], payload: any) => {
  const { eventType, data } = payload || {};

  try {
    if (!Io || !eventType) {
      return false;
    }

    for (const roomId of roomIds) {
      const targetRoomId = String(roomId || "").trim();
      if (!targetRoomId) continue;

      Io.to(targetRoomId).emit(eventType, data);
    }

    return true;
  } catch (error) {
    console.error("Socket Error", error);
    return false;
  }
};

export const sendNotification = async ({ roomId, title, message, eventType, meta, payloadBuilder }: any) => {
  try {
    const targetRoomId = String(roomId || ALL_NOTIFICATION_ROOM).trim() || ALL_NOTIFICATION_ROOM;

    const notification = await notificationModel.create({
      roomId: targetRoomId,
      title,
      message,
      eventType,
      meta,
    });

    const unreadCount = await countData(notificationModel, { roomId: targetRoomId, isRead: false });
    const payloadData = {
      roomId: targetRoomId,
      unreadCount,
      title,
      message,
      eventType,
      meta,
      createdAt:
        notification?.createdAt instanceof Date
          ? notification.createdAt.toISOString()
          : new Date().toISOString(),
    };

    const data = payloadBuilder ? payloadBuilder(payloadData) : payloadData;

    await sendRealTimeUpdate([targetRoomId], { eventType, data });
    return notification;
  } catch (error) {
    console.error("Socket Error", error);
    return error;
  }
};

export const emitNewOrderNotification = (order: any) => {
  if (!order) return;

  const notificationData = buildNewOrderNotificationInput(order);
  return sendNotification({
    roomId: ALL_NOTIFICATION_ROOM,
    ...notificationData,
    payloadBuilder: buildNewOrderNotificationPayload,
  });
};
