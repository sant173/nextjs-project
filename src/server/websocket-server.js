import WebSocket from "ws";

// WebSocketサーバーを作成
const wss = new WebSocket.Server({ port: 8080 });

console.log("WebSocket サーバーがポート 8080 で実行中...");

// 接続イベント
wss.on("connection", (ws) => {
  console.log("クライアントが接続しました");

  // メッセージを受信
  ws.on("message", (message) => {
    try {
      console.log("メッセージを受信:", message.toString());

      // 全てのクライアントにメッセージを送信
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(message);
        }
      });
    } catch (error) {
      console.error("メッセージ処理中にエラーが発生しました:", error);
    }
  });

  // 切断イベント
  ws.on("close", () => {
    console.log("クライアントが切断されました");
  });

  // エラーハンドリング
  ws.on("error", (error) => {
    console.error("WebSocketエラー:", error);
  });
});

// サーバーエラーハンドリング
wss.on("error", (error) => {
  console.error("WebSocketサーバーエラー:", error);
});

