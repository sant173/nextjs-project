const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // 必要に応じてフロントエンドURLを設定
  },
});

// WebSocket接続設定
io.on("connection", (socket) => {
  console.log("クライアントが接続しました");

  socket.on("message", (data) => {
    console.log("メッセージ:", data);
    io.emit("message", data); // 全クライアントにブロードキャスト
  });

  socket.on("disconnect", () => {
    console.log("クライアントが切断されました");
  });
});

// サーバー起動
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`サーバーがポート${PORT}で起動しました`);
});
