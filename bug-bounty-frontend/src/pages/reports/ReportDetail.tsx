import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Send } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "@/components/common/PageHeader";
import { useAuthStore } from "@/features/auth";
import { getReport, getReportMessages, type ReportMessage } from "@/features/reports";
import { createReportSocket, type ReportChatAck } from "@/features/reports/socket";
import { reportStatusBadgeClass, severityBadgeClass } from "@/lib/badges";

const roleLabels: Record<string, string> = {
  researcher: "Researcher",
  developer: "Researcher",
  organization_owner: "Organization owner",
  organization_member: "Organization member",
  triager: "Triager",
  platform_admin: "Admin",
  admin: "Admin",
};

export default function ReportDetail() {
  const { reportId = "" } = useParams();
  const accessToken = useAuthStore((state) => state.accessToken);
  const user = useAuthStore((state) => state.user);
  const [messages, setMessages] = useState<ReportMessage[]>([]);
  const [body, setBody] = useState("");
  const [chatError, setChatError] = useState("");
  const [isSending, setIsSending] = useState(false);
  const socketRef = useRef<ReturnType<typeof createReportSocket> | null>(null);

  const backTo =
    user?.role === "developer"
      ? "/researcher/reports"
      : user?.role === "triager"
        ? "/triager/reports"
        : "/organization/reports";

  const { data, isLoading, error } = useQuery({
    queryKey: ["report", reportId],
    queryFn: () => getReport(accessToken ?? "", reportId),
    enabled: Boolean(accessToken && reportId),
  });

  const { data: messageData } = useQuery({
    queryKey: ["report-messages", reportId],
    queryFn: () => getReportMessages(accessToken ?? "", reportId),
    enabled: Boolean(accessToken && reportId),
  });

  useEffect(() => {
    setMessages(messageData?.messages ?? []);
  }, [messageData?.messages]);

  useEffect(() => {
    if (!accessToken || !reportId) {
      return;
    }

    const socket = createReportSocket(accessToken);
    socketRef.current = socket;

    socket.on("connect_error", (socketError) => {
      const message = socketError.message || "Unable to connect to report chat";
      setChatError(message);
      toast.error(message);
    });

    socket.on("report:message", (message: ReportMessage) => {
      setMessages((current) => {
        if (current.some((item) => item.id === message.id)) {
          return current;
        }
        return [...current, message];
      });
    });

    socket.emit("report:join", { reportId }, (ack: ReportChatAck) => {
      if (!ack.ok) {
        setChatError(ack.message);
        toast.error(ack.message);
        return;
      }
      setChatError("");
      if (ack.messages) {
        setMessages(ack.messages);
      }
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [accessToken, reportId]);

  const report = data?.report;
  const sortedMessages = useMemo(
    () =>
      [...messages].sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      ),
    [messages],
  );

  const handleSend = (event: React.FormEvent) => {
    event.preventDefault();
    const text = body.trim();
    if (!text || !socketRef.current) {
      return;
    }

    setIsSending(true);
    socketRef.current.emit("report:message", { reportId, body: text }, (ack: ReportChatAck) => {
      setIsSending(false);
      if (!ack.ok) {
        setChatError(ack.message);
        toast.error(ack.message);
        return;
      }
      setBody("");
      setChatError("");
      toast.success("Message sent");
    });
  };

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading report...</p>;
  }

  if (error || !report) {
    return <p className="text-sm text-destructive">Unable to load report.</p>;
  }

  return (
    <div>
      <Button variant="ghost" size="sm" asChild className="mb-4">
        <Link to={backTo}>
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
      </Button>

      <PageHeader title={report.title} description={report.programName ?? report.programId} />

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_380px] gap-6">
        <Card className="border-border/70 shadow-[var(--shadow-soft)] rounded-xl">
          <CardHeader>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className={reportStatusBadgeClass(report.status, "capitalize")}>{report.status}</Badge>
              <Badge variant="outline" className={severityBadgeClass(report.severity, "capitalize")}>{report.severity}</Badge>
            </div>
            <CardTitle className="text-base">Report summary</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
              {report.summary}
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/70 shadow-[var(--shadow-soft)] rounded-xl">
          <CardHeader>
            <CardTitle className="text-base">Report chat</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[420px] overflow-y-auto rounded-md border bg-muted/20 p-3 space-y-3">
              {sortedMessages.length === 0 ? (
                <p className="text-sm text-muted-foreground">No messages yet.</p>
              ) : (
                sortedMessages.map((message) => {
                  const isMine = message.senderId === user?.id;
                  const senderLabel = isMine
                    ? `${message.senderName} (me)`
                    : `${message.senderName} (${roleLabels[message.senderRole] ?? message.senderRole})`;

                  return (
                  <div
                    key={message.id}
                    className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-lg border p-3 ${
                        isMine
                          ? "border-foreground/10 bg-foreground text-background"
                          : "border-border bg-background text-foreground"
                      }`}
                    >
                      <p className={`text-sm font-medium ${isMine ? "text-background" : "text-foreground"}`}>
                        {senderLabel}
                      </p>
                      <p className={`mt-2 whitespace-pre-wrap text-sm ${isMine ? "text-background" : "text-muted-foreground"}`}>
                        {message.body}
                      </p>
                      <p className={`mt-2 text-right text-xs ${isMine ? "text-background/75" : "text-muted-foreground"}`}>
                        {new Date(message.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  );
                })
              )}
            </div>

            <form onSubmit={handleSend} className="mt-4 space-y-3">
              <Textarea
                value={body}
                onChange={(event) => setBody(event.target.value)}
                placeholder="Write a message..."
                className="min-h-24"
              />
              {chatError && <p className="text-sm text-destructive">{chatError}</p>}
              <Button type="submit" disabled={isSending || !body.trim()} className="w-full">
                <Send className="h-4 w-4" />
                {isSending ? "Sending..." : "Send message"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
