const WebSocket = require("ws");

// 8080番ポートで WebSocket サーバーを起動
const wss = new WebSocket.Server({ port: 8080 });

console.log("✅ WebSocket サーバーが ws://localhost:8080 で起動中...");

wss.on("connection", (ws) => {
  console.log("✅ クライアントが接続しました");

  ws.on("message", (message) => {
    console.log("📩 メッセージを受信:", message.toString());

    // すべてのクライアントにメッセージをブロードキャスト
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message.toString());
      }
    });
  });

  ws.on("close", () => {
    console.log("❌ クライアントが切断されました");
  });

  ws.on("error", (error) => {
    console.error("⚠️ WebSocketエラー:", error);
  });
});

wss.on("error", (error) => {
  console.error("⚠️ WebSocketサーバーエラー:", error);
});
