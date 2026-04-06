import type { Server as HttpServer } from "http";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { Server } from "socket.io";
import { USER_ROLES } from "../common";
import { userModel } from "../database";
import { getFirstMatch } from "../helper";

export const ADMIN_NOTIFICATION_ROOM = "admin:notifications";
export const NEW_ORDER_EVENT = "order:new";

let io: Server | null = null;

const jwtSecretKey = process.env.JWT_TOKEN_SECRET;

const parseToken = (value: unknown) => {
  const tokenValue = String(value || "").trim();
  if (!tokenValue) return "";

  const [scheme, token] = tokenValue.split(" ");
  if (token && /^Bearer$/i.test(scheme)) {
    return token.trim();
  }

  return tokenValue;
};

const getSocketToken = (socket: any) => {
  const authToken =
    socket?.handshake?.auth?.token ||
    socket?.handshake?.auth?.authorization ||
    socket?.handshake?.headers?.authorization ||
    socket?.handshake?.query?.token;

  return parseToken(authToken);
};

const resolveSocketCorsOrigin = () => {
  const rawOrigins = String(process.env.SOCKET_CORS_ORIGIN || process.env.CORS_ORIGIN || "*").trim();
  if (!rawOrigins || rawOrigins === "*") return "*";

  const origins = rawOrigins.split(",").map((origin) => origin.trim()).filter(Boolean);

  return origins.length === 1 ? origins[0] : origins;
};

export const initializeSocket = (server: HttpServer) => {
  if (io) return io;

  io = new Server(server, {
    cors: {
      origin: resolveSocketCorsOrigin(),
      methods: ["GET", "POST"],
    },
  });

  io.use(async (socket, next) => {
    try {
      if (!jwtSecretKey) {
        return next(new Error("Socket authentication is not configured"));
      }

      const token = getSocketToken(socket);
      if (!token) {
        return next(new Error("Authentication token is required"));
      }

      const decoded: any = jwt.verify(token, jwtSecretKey);
      const userId = String(decoded?._id || "");
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return next(new Error("Invalid token"));
      }

      const user = await getFirstMatch(userModel,{ _id: new mongoose.Types.ObjectId(userId), isDeleted: false },{},{});

      if (!user) {
        return next(new Error("Invalid token"));
      }

      if (user?.isActive === false) {
        return next(new Error("Account is blocked"));
      }

      if (user?.roles !== USER_ROLES.ADMIN) {
        return next(new Error("Admin access required"));
      }

      socket.data.user = {
        _id: String(user._id),
        email: user.email,
        roles: user.roles,
      };

      return next();
    } catch (error: any) {
      if (error?.name === "TokenExpiredError") {
        return next(new Error("Token expired"));
      }

      return next(new Error("Unauthorized"));
    }
  });

  io.on("connection", (socket) => {
    socket.join(ADMIN_NOTIFICATION_ROOM);
  });

  return io;
};

export const emitNewOrderNotification = (order: any) => {
  if (!io || !order) return;

  const customerName = [order?.firstName, order?.lastName].filter(Boolean).join(" ").trim();
  const itemCount = Array.isArray(order?.items)
    ? order.items.reduce((total: number, item: any) => total + Number(item?.quantity || 0), 0)
    : 0;

  io.to(ADMIN_NOTIFICATION_ROOM).emit(NEW_ORDER_EVENT, {
    type: "new_order",
    title: "New order placed",
    message: `${customerName || order?.email || "A customer"} placed order ${order?.orderId || ""}`.trim(),
    order,
    summary: {
      orderId: order?.orderId || null,
      customerName,
    },
    createdAt: new Date().toISOString(),
  });
};
