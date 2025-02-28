import Hyperswarm from 'hyperswarm';
import Corestore from 'corestore';
import SecretStream from '@hyperswarm/secret-stream';
import b4a from 'b4a';

export class HypercoreManager {
  private swarm: any;
  private store: any;
  private connections: Map<string, any>;
  
  constructor() {
    this.swarm = new Hyperswarm();
    this.store = new Corestore('./data');
    this.connections = new Map();
  }

  async init() {
    this.swarm.on('connection', (conn: any, info: any) => {
      const stream = new SecretStream(true, conn);
      this.connections.set(info.publicKey.toString('hex'), stream);
      
      stream.on('data', (data: any) => {
        // Handle incoming messages
        console.log('Received:', data.toString());
      });
    });
  }

  async connect(topic: string) {
    const discoveryKey = b4a.from(topic, 'hex');
    await this.swarm.join(discoveryKey);
    await this.swarm.flush();
  }

  async sendMessage(peerId: string, message: string) {
    const connection = this.connections.get(peerId);
    if (connection) {
      connection.write(Buffer.from(message));
    }
  }

  async close() {
    await this.swarm.destroy();
    await this.store.close();
  }
}

export const hypercoreManager = new HypercoreManager();
