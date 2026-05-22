import type { Server as HttpServer } from "node:http";
import { Server } from "socket.io";
import { z } from "zod";

import { env } from "../config/env.js";
import { findProfileById, getAuthUserFromToken } from "../modules/auth/auth.service.js";
import {
  createReportMessage,
  getAccessibleReport,
  listReportMessages,
} from "../modules/reports/reports.service.js";

const joinReportSchema = z.object({
  reportId: z.uuid(),
});

const sendMessageSchema = z.object({
  reportId: z.uuid(),
  body: z.string().trim().min(1).max(5000),
});

const reportRoom = (reportId: string) => `report:${reportId}`;

export const initializeSocketServer = (server: HttpServer) => {
  const allowedOrigins = env.CLIENT_URL.split(",").map((origin) => origin.trim());
  const io = new Server(server, {
    cors: {
      origin: allowedOrigins,
      credentials: true,
    },
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (typeof token !== "string" || !token) {
        next(new Error("Authentication required"));
        return;
      }

      const authUser = await getAuthUserFromToken(token);
      const profile = await findProfileById(authUser.id);
      if (!profile) {
        next(new Error("Profile not found"));
        return;
      }

      socket.data.userId = profile.id;
      next();
    } catch {
      next(new Error("Invalid access token"));
    }
  });

  io.on("connection", (socket) => {
    socket.on("report:join", async (payload, ack) => {
      try {
        const { reportId } = joinReportSchema.parse(payload);
        await getAccessibleReport(socket.data.userId, reportId);
        await socket.join(reportRoom(reportId));
        const messages = await listReportMessages(socket.data.userId, reportId);
        if (typeof ack === "function") {
          ack({ ok: true, messages });
        }
      } catch (error) {
        if (typeof ack === "function") {
          ack({
            ok: false,
            message: error instanceof Error ? error.message : "Unable to join report chat",
          });
        }
      }
    });

    socket.on("report:message", async (payload, ack) => {
      try {
        const input = sendMessageSchema.parse(payload);
        const message = await createReportMessage(socket.data.userId, input.reportId, {
          body: input.body,
        });

        io.to(reportRoom(input.reportId)).emit("report:message", message);
        if (typeof ack === "function") {
          ack({ ok: true, message });
        }
      } catch (error) {
        if (typeof ack === "function") {
          ack({
            ok: false,
            message: error instanceof Error ? error.message : "Unable to send message",
          });
        }
      }
    });
  });

  return io;
};
