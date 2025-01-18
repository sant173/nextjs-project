"use client";
import React, { useEffect, useState } from "react";

const GoalChatPage: React.FC = () => {
  const [messages, setMessages] = useState<string[]>([]);
  const [inputText, setInputText] = useState<string>("");
  const [ws, setWs] = useState<WebSocket | null>(null);

  useEffect(() => {
    // WebSocket 接続
    const socket = new WebSocket("ws://localhost:8080");
    setWs(socket);

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setMessages((prev) => [...prev, data]);
    };

    socket.onclose = () => {
      console.log("WebSocketが切断されました");
    };

    return () => {
      socket.close();
    };
  }, []);

  const handleSendMessage = () => {
    if (!inputText.trim() || !ws) return;

    const message = { sender: "利用者", content: inputText, timestamp: new Date().toISOString() };
    ws.send(JSON.stringify(message));
    setMessages((prev) => [...prev, message]);
    setInputText("");
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>利用者チャット</h1>
      <div style={styles.chatWindow}>
        {messages.map((msg, index) => (
          <div
            key={index}
            style={{
              ...styles.message,
              alignSelf: msg.sender === "利用者" ? "flex-end" : "flex-start",
              backgroundColor: msg.sender === "利用者" ? "#DCF8C6" : "#D3D3D3",
            }}
          >
            <p style={styles.sender}>{msg.sender}</p>
            <p>{msg.content}</p>
            <p style={styles.timestamp}>{new Date(msg.timestamp).toLocaleString()}</p>
          </div>
        ))}
      </div>
      <div style={styles.inputArea}>
        <input
          type="text"
          style={styles.input}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="メッセージを入力..."
        />
        <button style={styles.button} onClick={handleSendMessage}>
          送信
        </button>
      </div>
    </div>
  );
};

const styles = {
  container: {
    fontFamily: "Arial, sans-serif",
    padding: "20px",
    maxWidth: "600px",
    margin: "0 auto",
    backgroundColor: "#F1F1F1",
    height: "100vh",
    display: "flex",
    flexDirection: "column",
  },
  title: {
    fontSize: "24px",
    marginBottom: "10px",
    textAlign: "center",
  },
  chatWindow: {
    flex: 1,
    border: "1px solid #ccc",
    borderRadius: "5px",
    padding: "10px",
    overflowY: "scroll",
    backgroundColor: "#FFFFFF",
  },
  message: {
    maxWidth: "70%",
    padding: "10px",
    borderRadius: "10px",
    boxShadow: "0 1px 2px rgba(0, 0, 0, 0.1)",
    marginBottom: "10px",
    cursor: "pointer",
    position: "relative",
  },
  sender: { fontWeight: "bold", marginBottom: "5px" },
  timestamp: { fontSize: "12px", color: "#888", textAlign: "right" },
  inputArea: {
    display: "flex",
    gap: "10px",
  },
  input: {
    flex: 1,
    padding: "10px",
    borderRadius: "5px",
    border: "1px solid #ccc",
  },
  button: {
    padding: "10px 20px",
    backgroundColor: "#4CAF50",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
};

export default GoalChatPage;
