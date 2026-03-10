// src/utils/__tests__/websocket.test.ts
import WebSocketManager from '../websocket'; // Assuming websocket.ts is in the same directory as __tests__

// Mock the WebSocket global object
let mockWebSocket: any;
let mockOnOpen: (() => void) | null = null;
let mockOnMessage: ((event: { data: string }) => void) | null = null;
let mockOnError: ((event: any) => void) | null = null;
let mockOnClose: ((event: { code: number, reason: string }) => void) | null = null;
let mockSend: jest.Mock | null = null;

beforeAll(() => {
  // Mock the global WebSocket
  global.WebSocket = class MockWebSocket {
    constructor(url: string) {
      // console.log(`MockWebSocket: Connecting to ${url}`);
    }
    onopen: (() => void) | null = null;
    onmessage: ((event: { data: string }) => void) | null = null;
    onerror: ((event: any) => void) | null = null;
    onclose: ((event: { code: number, reason: string }) => void) | null = null;
    readyState: number = WebSocket.CONNECTING; // Initial state

    // Mock methods
    send = jest.fn().mockImplementation((data) => {
      // console.log('MockWebSocket: Sending data:', data);
    });
    close = jest.fn().mockImplementation(() => {
      // console.log('MockWebSocket: Close called');
      this.readyState = WebSocket.CLOSED;
      if (mockOnClose) {
        mockOnClose({ code: 1000, reason: 'Mock close' });
      }
    });

    // Helper to simulate connection open
    simulateOpen() {
      this.readyState = WebSocket.OPEN;
      if (this.onopen) {
        this.onopen();
      }
    }

    // Helper to simulate receiving a message
    simulateMessage(data: any) {
      this.readyState = WebSocket.OPEN;
      if (this.onmessage) {
        this.onmessage({ data: JSON.stringify(data) });
      }
    }

    // Helper to simulate an error
    simulateError(error: any) {
      this.readyState = WebSocket.CLOSED;
      if (this.onerror) {
        this.onerror(error);
      }
    }

    // Helper to simulate closing
    simulateClose(code: number = 1000, reason: string = '') {
      this.readyState = WebSocket.CLOSED;
      if (this.onclose) {
        this.onclose({ code, reason });
      }
    }
  };

  // Save references to the mocked WebSocket's methods
  mockWebSocket = global.WebSocket;
});

afterAll(() => {
  // Clean up the global mock
  delete global.WebSocket;
});

beforeEach(() => {
  // Reset mocks and create a new instance for each test
  jest.useFakeTimers();

  // Reset mock WebSocket instance and its handlers
  mockWebSocket.mockClear(); // Clears constructor calls
  mockWebSocket.prototype.send.mockClear();
  mockWebSocket.prototype.close.mockClear();

  // Instantiate the WebSocketManager, which will trigger its constructor
  // The constructor automatically calls connect()
  // We need to get the actual WebSocket instance created by the manager
  const manager = new WebSocketManager();

  // Find the instance of our mock WebSocket that was created
  // This is a bit of a workaround, in a more robust setup you'd inject mocks
  // For now, we assume the first WebSocket instantiation is the one we need.
  const createdWebSocket = mockWebSocket.mock.instances[0];
  
  // Assign handlers for easier simulation
  mockOnOpen = createdWebSocket.onopen?.bind(createdWebSocket);
  mockOnMessage = createdWebSocket.onmessage?.bind(createdWebSocket);
  mockOnError = createdWebSocket.onerror?.bind(createdWebSocket);
  mockOnClose = createdWebSocket.onclose?.bind(createdWebSocket);
  mockSend = createdWebSocket.send;

  // Simulate connection opening after instantiation
  // In a real scenario, connection happens asynchronously.
  // We'll manually call simulateOpen on the created mock instance.
  createdWebSocket.simulateOpen();
});

afterEach(() => {
  // Restore real timers
  jest.useRealTimers();
});

describe('WebSocketManager', () => {
  // Test case 1: Connection and basic message handling
  test('should connect, receive, and handle inventory update messages', () => {
    const mockListener = jest.fn();
    WebSocketManager.on('inventoryUpdate', mockListener);

    const updatePayload = { productId: 'prod_1', newInventory: 45 };
    const message = { type: 'inventoryUpdate', payload: updatePayload };

    // Simulate receiving a message
    if (mockOnMessage) {
      mockOnMessage({ data: JSON.stringify(message) });
    } else {
      fail('Mock WebSocket message handler not set');
    }

    // Verify the listener was called with the correct payload
    expect(mockListener).toHaveBeenCalledTimes(1);
    expect(mockListener).toHaveBeenCalledWith(updatePayload);
  });

  // Test case 2: Reconnection logic on error
  test('should attempt to reconnect on error', () => {
    const mockErrorListener = jest.fn();
    WebSocketManager.on('error', mockErrorListener);

    // Simulate an error
    if (mockOnError) {
      mockOnError(new Error('Connection failed'));
    } else {
      fail('Mock WebSocket error handler not set');
    }

    // Advance timers to allow reconnection attempt
    jest.advanceTimersByTime(5000); // Reconnect interval is 5000ms

    // Expect WebSocket to be instantiated again after reconnect interval
    expect(mockWebSocket).toHaveBeenCalledTimes(2); // Once in beforeEach, once after error
  });

  // Test case 3: Reconnection logic on close
  test('should attempt to reconnect on close', () => {
    const mockCloseListener = jest.fn();
    WebSocketManager.on('disconnected', mockCloseListener);

    // Simulate closing
    if (mockOnClose) {
      mockOnClose({ code: 1000, reason: 'Normal closure' });
    } else {
      fail('Mock WebSocket close handler not set');
    }

    // Advance timers to allow reconnection attempt
    jest.advanceTimersByTime(5000); // Reconnect interval is 5000ms

    // Expect WebSocket to be instantiated again after reconnect interval
    expect(mockWebSocket).toHaveBeenCalledTimes(2); // Once in beforeEach, once after close
    expect(mockCloseListener).toHaveBeenCalledTimes(1);
  });

  // Test case 4: Sending a message
  test('should send messages when the socket is open', () => {
    const messageToSend = { type: 'ping', data: 'hello' };

    WebSocketManager.sendMessage(messageToSend);

    // Expect send to have been called on the mock WebSocket instance
    expect(mockSend).toHaveBeenCalledTimes(1);
    expect(mockSend).toHaveBeenCalledWith(JSON.stringify(messageToSend));
  });

  // Test case 5: Sending a message when socket is not open
  test('should not send messages if the socket is not open', () => {
    // Manually close the connection for this test
    if (mockWebSocket.prototype.close) {
      mockWebSocket.prototype.close();
    }
    
    const messageToSend = { type: 'ping', data: 'hello' };
    WebSocketManager.sendMessage(messageToSend);

    // Expect send not to have been called
    expect(mockSend).not.toHaveBeenCalled();
  });

  // Test case 6: Registering and emitting multiple listeners
  test('should call all registered listeners for an event', () => {
    const mockListener1 = jest.fn();
    const mockListener2 = jest.fn();
    WebSocketManager.on('inventoryUpdate', mockListener1);
    WebSocketManager.on('inventoryUpdate', mockListener2);

    const updatePayload = { productId: 'prod_2', newInventory: 25 };
    const message = { type: 'inventoryUpdate', payload: updatePayload };

    if (mockOnMessage) {
      mockOnMessage({ data: JSON.stringify(message) });
    } else {
      fail('Mock WebSocket message handler not set');
    }

    expect(mockListener1).toHaveBeenCalledTimes(1);
    expect(mockListener1).toHaveBeenCalledWith(updatePayload);
    expect(mockListener2).toHaveBeenCalledTimes(1);
    expect(mockListener2).toHaveBeenCalledWith(updatePayload);
  });

  // Test case 7: Handling malformed JSON messages
  test('should not crash on malformed JSON messages', () => {
    const mockListener = jest.fn();
    WebSocketManager.on('inventoryUpdate', mockListener);

    // Simulate a malformed message
    if (mockOnMessage) {
      mockOnMessage({ data: 'this is not json' });
    } else {
      fail('Mock WebSocket message handler not set');
    }

    // Ensure the listener was not called due to the error
    expect(mockListener).not.toHaveBeenCalled();
    // Expect console.error to have been called (though we don't mock console.error here)
  });
});
