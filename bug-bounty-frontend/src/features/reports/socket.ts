import { io, type Socket } from "socket.io-client";
import { API_URL } from "@/lib/api";
import type { ReportMessage } from "@/features/reports/types";

export type ReportChatAck =
  | { ok: true; messages?: ReportMessage[]; message?: ReportMessage }
  | { ok: false; message: string };

export const createReportSocket = (accessToken: string): Socket => {
  return io(API_URL, {
    auth: accessToken === "cookie" ? undefined : { token: accessToken },
    withCredentials: true,
  });
};
