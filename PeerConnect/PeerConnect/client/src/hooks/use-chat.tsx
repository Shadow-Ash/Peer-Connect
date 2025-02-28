import { useState, useEffect } from "react";
import { Message } from "@shared/schema";
import { useAuth } from "./use-auth";
import { useToast } from "./use-toast";

export function useChat(peerId: number) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) {
      console.log('No user authenticated, skipping WebSocket connection');
      return;
    }

    setIsConnecting(true);
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    console.log('Connecting to WebSocket:', wsUrl);

    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('WebSocket connected, sending peer connection request');
      setIsConnecting(false);
      ws.send(JSON.stringify({ 
        type: 'CONNECT_PEER', 
        peerId 
      }));
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('Received websocket message:', data);

        switch (data.type) {
          case 'CONNECTION_ESTABLISHED':
            console.log('WebSocket connection established');
            setIsConnected(true);
            break;

          case 'PEER_CONNECTED':
            console.log('Peer connection established');
            setIsConnected(true);
            toast({
              title: "Connected",
              description: "Successfully connected to peer",
            });
            break;

          case 'MESSAGE_SENT':
            console.log('Message received:', data.message);
            setMessages(prev => [...prev, data.message]);
            break;

          case 'ERROR':
            console.error('Server error:', data.message);
            toast({
              title: "Error",
              description: data.message,
              variant: "destructive",
            });
            break;
        }
      } catch (err) {
        console.error('Failed to parse message:', err);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setIsConnected(false);
      toast({
        title: "Connection Error",
        description: "Failed to connect to chat server. Please try again.",
        variant: "destructive",
      });
      setIsConnecting(false);
    };

    ws.onclose = () => {
      console.log('WebSocket closed');
      setIsConnected(false);
      setIsConnecting(false);
      toast({
        title: "Disconnected",
        description: "Lost connection to chat server. Attempting to reconnect...",
        variant: "destructive",
      });
      // Attempt to reconnect after 5 seconds
      setTimeout(() => setSocket(null), 5000);
    };

    setSocket(ws);

    return () => {
      console.log('Cleaning up WebSocket connection');
      ws.close();
    };
  }, [peerId, user]);

  const sendMessage = (content: string) => {
    if (!socket || socket.readyState !== WebSocket.OPEN || !user) {
      console.error('Cannot send message: socket not ready');
      toast({
        title: "Cannot Send Message",
        description: "Not connected to chat server",
        variant: "destructive",
      });
      return;
    }

    try {
      const message = {
        type: 'SEND_MESSAGE',
        peerId,
        content,
        timestamp: new Date().toISOString()
      };

      console.log('Sending message:', message);
      socket.send(JSON.stringify(message));
    } catch (err) {
      console.error('Failed to send message:', err);
      toast({
        title: "Failed to Send",
        description: "Could not send message. Please try again.",
        variant: "destructive",
      });
    }
  };

  return { 
    messages, 
    sendMessage,
    isConnecting,
    isConnected
  };
}