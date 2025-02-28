import { useState } from "react";
import { User } from "@shared/schema";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/hooks/use-auth";
import { usePeers } from "@/hooks/use-peers";
import { Search, LogOut } from "lucide-react";

export function Sidebar({ 
  onUserSelect,
  selectedUser 
}: { 
  onUserSelect: (user: User) => void;
  selectedUser: User | null;
}) {
  const [search, setSearch] = useState("");
  const { user, logoutMutation } = useAuth();
  const { data: peers = [] } = usePeers(search);

  return (
    <div className="w-80 border-r flex flex-col">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <h1 className="font-semibold">P2P Chat</h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => logoutMutation.mutate()}
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users..."
            className="pl-9"
          />
        </div>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-2">
          {peers.map((peer) => (
            <Button
              key={peer.id}
              variant={selectedUser?.id === peer.id ? "secondary" : "ghost"}
              className="w-full justify-start mb-1"
              onClick={() => onUserSelect(peer)}
            >
              <div className="flex items-center">
                <span className="ml-2">@{peer.username}</span>
                {peer.isOnline && (
                  <div className="w-2 h-2 rounded-full bg-green-500 ml-2" />
                )}
              </div>
            </Button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
