const WebSocket = require("ws");

const wss = new WebSocket.Server({ port: 8080 });

wss.on("connection", (ws) => {
  console.log("クライアントが接続しました");

  ws.on("message", (message) => {
    console.log("メッセージを受信:", message);

    // 全てのクライアントにメッセージを送信
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });

  ws.on("close", () => {
    console.log("クライアントが切断されました");
  });
});

console.log("WebSocket サーバーがポート 8080 で実行中...");
