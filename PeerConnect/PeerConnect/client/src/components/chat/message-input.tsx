import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";

export function MessageInput({ 
  onSend,
  disabled
}: { 
  onSend: (content: string) => void;
  disabled?: boolean;
}) {
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSend(message);
      setMessage("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="border-t p-4">
      <div className="flex gap-2">
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={disabled ? "Connecting..." : "Type a message..."}
          className="flex-1"
          disabled={disabled}
        />
        <Button type="submit" size="icon" disabled={disabled}>
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </form>
  );
}