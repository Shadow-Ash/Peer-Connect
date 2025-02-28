import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer } from 'ws';
import { setupAuth } from "./auth";
import { hypercoreManager } from "./hypercore";
import { storage } from "./storage";
import { parse as parseCookie } from "cookie";
import { unsign } from "cookie-signature";

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  const httpServer = createServer(app);
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  await hypercoreManager.init();

  // Handle WebSocket connections
  wss.on('connection', async (ws, req) => {
    try {
      // Parse session from cookie to authenticate WebSocket
      const cookies = parseCookie(req.headers.cookie || '');
      const sid = cookies['connect.sid'];

      console.log('Raw cookie header:', req.headers.cookie);
      console.log('Parsed sid:', sid);

      if (!sid) {
        console.log('WebSocket connection failed: No session ID');
        ws.close(1008, 'Authentication required');
        return;
      }

      // Get session data
      const sessionData: any = await new Promise((resolve) => {
        const sessionId = unsign(sid.slice(2), process.env.SESSION_SECRET!) || '';
        console.log('Unsigned session ID:', sessionId);

        storage.sessionStore.get(sessionId, (err, session) => {
          if (err) {
            console.error('Session retrieval error:', err);
            resolve(null);
          } else {
            console.log('Retrieved session data:', session);
            resolve(session);
          }
        });
      });

      if (!sessionData || !sessionData.passport?.user) {
        console.log('WebSocket connection failed: Invalid session data');
        console.log('Session data:', sessionData);
        ws.close(1008, 'Authentication required');
        return;
      }

      const userId = sessionData.passport.user;
      const user = await storage.getUser(userId);

      if (!user) {
        console.log('WebSocket connection failed: User not found');
        ws.close(1008, 'User not found');
        return;
      }

      console.log(`User ${user.username} connected via WebSocket`);

      // Set user as online
      user.isOnline = true;

      // Send a connection confirmation
      ws.send(JSON.stringify({ 
        type: 'CONNECTION_ESTABLISHED',
        userId: user.id
      }));

      ws.on('message', async (message) => {
        try {
          const data = JSON.parse(message.toString());
          console.log('Received message:', data);

          switch (data.type) {
            case 'CONNECT_PEER':
              await hypercoreManager.connect(data.peerId.toString());
              // Send connection confirmation
              ws.send(JSON.stringify({
                type: 'PEER_CONNECTED',
                peerId: data.peerId
              }));
              break;

            case 'SEND_MESSAGE':
              await hypercoreManager.sendMessage(data.peerId.toString(), data.content);
              // Echo back the message to confirm receipt
              ws.send(JSON.stringify({
                type: 'MESSAGE_SENT',
                message: {
                  id: Date.now(),
                  content: data.content,
                  senderId: userId,
                  receiverId: data.peerId,
                  timestamp: new Date().toISOString()
                }
              }));
              break;
          }
        } catch (err) {
          console.error('WebSocket message error:', err);
          ws.send(JSON.stringify({
            type: 'ERROR',
            message: 'Failed to process message'
          }));
        }
      });

      ws.on('close', () => {
        if (user) {
          user.isOnline = false;
          console.log(`User ${user.username} disconnected`);
        }
      });

    } catch (err) {
      console.error('WebSocket connection error:', err);
      ws.close(1011, 'Internal server error');
    }
  });

  app.get('/api/users/search', async (req, res) => {
    const { query } = req.query;
    const users = await storage.searchUsers(query as string);
    res.json(users);
  });

  return httpServer;
}