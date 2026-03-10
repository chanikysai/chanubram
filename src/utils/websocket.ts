// src/utils/websocket.ts
import { Product } from '../types/product';

const WEBSOCKET_URL = 'ws://localhost:8080'; // Replace with your WebSocket server URL

class WebSocketManager {
  private socket: WebSocket | null = null;
  private isConnecting: boolean = false;
  private reconnectInterval: number = 5000; // 5 seconds
  private listeners: Map<string, ((data: any) => void)[]> = new Map();

  constructor() {
    this.connect();
  }

  private connect() {
    if (this.isConnecting || this.socket) {
      return;
    }

    this.isConnecting = true;
    console.log('WebSocketManager: Attempting to connect...');

    this.socket = new WebSocket(WEBSOCKET_URL);

    this.socket.onopen = () => {
      this.isConnecting = false;
      console.log('WebSocketManager: Connected!');
      this.emit('connected');
      this.subscribeToInventoryUpdates(); // Subscribe to inventory updates upon connection
    };

    this.socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        console.log('WebSocketManager: Message received:', message);
        this.handleMessage(message);
      } catch (error) {
        console.error('WebSocketManager: Failed to parse message or handle message:', error);
      }
    };

    this.socket.onerror = (error) => {
      this.isConnecting = false;
      console.error('WebSocketManager: WebSocket error:', error);
      this.emit('error', error);
      this.reconnect();
    };

    this.socket.onclose = (event) => {
      this.isConnecting = false;
      this.socket = null;
      console.log('WebSocketManager: Disconnected:', event.code, event.reason);
      this.emit('disconnected');
      this.reconnect();
    };
  }

  private reconnect() {
    if (!this.isConnecting && !this.socket) {
      setTimeout(() => this.connect(), this.reconnectInterval);
    }
  }

  private handleMessage(message: any) {
    if (message.type === 'inventoryUpdate') {
      this.emit('inventoryUpdate', message.payload);
    }
    // Handle other message types here
  }

  // Sends a message to the server
  public sendMessage(message: any) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message));
    } else {
      console.warn('WebSocketManager: Cannot send message, socket is not open.');
    }
  }

  // Subscribes to a specific event type
  public on(eventType: string, listener: (data: any) => void) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }
    this.listeners.get(eventType)?.push(listener);
  }

  // Emits an event to all registered listeners
  private emit(eventType: string, data?: any) {
    const eventListeners = this.listeners.get(eventType);
    if (eventListeners) {
      eventListeners.forEach(listener => listener(data));
    }
  }

  // Specific method to subscribe to inventory updates
  private subscribeToInventoryUpdates() {
    // In a real app, you might send a subscription message to the server.
    // For this mock, we assume the server automatically pushes inventory updates.
    // If server requires explicit subscription, uncomment and adapt:
    /*
    this.sendMessage({
      type: 'subscribe',
      topic: 'inventory',
    });
    */
    console.log('WebSocketManager: Subscribed to inventory updates (assumed server push).');
  }

  public close() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    this.listeners.clear();
  }
}

// Create a single instance of WebSocketManager to be used throughout the app
const websocketManager = new WebSocketManager();

export default websocketManager;
