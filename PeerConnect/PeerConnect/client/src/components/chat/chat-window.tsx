import { MessageList } from "./message-list";
import { MessageInput } from "./message-input";
import { User } from "@shared/schema";
import { useChat } from "@/hooks/use-chat";
import { Loader2 } from "lucide-react";

export function ChatWindow({ peer }: { peer: User }) {
  const { messages, sendMessage, isConnecting, isConnected } = useChat(peer.id);

  return (
    <div className="flex flex-col h-full">
      <div className="border-b p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">@{peer.username}</h2>
          <div className="flex items-center gap-2">
            {isConnecting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-muted-foreground">Connecting...</span>
              </>
            ) : isConnected ? (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-sm text-muted-foreground">Connected</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                <span className="text-sm text-muted-foreground">Disconnected</span>
              </div>
            )}
          </div>
        </div>
      </div>
      <MessageList messages={messages} />
      <MessageInput onSend={sendMessage} disabled={!isConnected} />
    </div>
  );
}