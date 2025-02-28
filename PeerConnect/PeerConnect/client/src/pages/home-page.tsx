import { Sidebar } from "@/components/layout/sidebar";
import { ChatWindow } from "@/components/chat/chat-window";
import { useState } from "react";
import { User } from "@shared/schema";

export default function HomePage() {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  return (
    <div className="flex h-screen bg-background">
      <Sidebar onUserSelect={setSelectedUser} selectedUser={selectedUser} />
      <main className="flex-1">
        {selectedUser ? (
          <ChatWindow peer={selectedUser} />
        ) : (
          <div className="h-full flex items-center justify-center text-muted-foreground">
            Select a user to start chatting
          </div>
        )}
      </main>
    </div>
  );
}
