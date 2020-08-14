const WebSocket = require("ws");

const startServer = () => {
  const wss = new WebSocket.Server({ port: 3423, clientTracking: true });

  wss.on("connection", (ws) => {
    ws.on("message", (message) => {
      console.log(`Got message ${message}`);
    });

    ws.send("Hello!");
  });

  console.log("Server opened!");

  return wss;
};

module.exports = { startServer };
