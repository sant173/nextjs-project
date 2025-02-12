"use client";

import React, { CSSProperties, useEffect, useState } from "react";

const AdminChatPage: React.FC = () => {
  const [messages, setMessages] = useState<
    { sender: string; content: string; timestamp?: string }[]
  >([]);
  const [inputText, setInputText] = useState<string>(""); // 入力欄のテキスト
  const [ws, setWs] = useState<WebSocket | null>(null); // WebSocket接続

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:8080");
    setWs(socket);

    socket.onopen = () => {
      console.log("WebSocketに接続しました");
    };

    // メッセージ受信時の処理
    const handleMessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        if (data.sender === "匿名" && data.content.includes("管理者")) return;
        setMessages((prev) => [...prev, data]);
      } catch (error) {
        console.error("メッセージの解析に失敗しました:", error);
      }
    };

    socket.addEventListener("message", handleMessage);

    socket.onclose = () => {
      console.log("WebSocketが切断されました");
    };

    // コンポーネントのアンマウント時にソケットを閉じる
    return () => {
      socket.close();
    };
  }, []);

  const handleSendMessage = (message: string) => {
    if (ws && message.trim()) {
      const messageData = {
        sender: "管理者",
        content: message,
        timestamp: new Date().toISOString(),
      };

      // WebSocketで送信
      ws.send(JSON.stringify(messageData));
      // 入力フィールドをクリア
      setInputText("");
    }
  };

  const handleSendInformation = () => {
    const savedData = localStorage.getItem("savedInformation");
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      const formattedMessage = `
        [情報1]
        駅名: ${parsedData.station || "未設定"} 駅
        号車: ${parsedData.carNumber || "未設定"}
        ドア番号: ${parsedData.doorNumber || "未設定"}
        口名: ${parsedData.entranceName || "未設定"} 口
      `;
      handleSendMessage(formattedMessage);
    } else {
      alert("保存された情報がありません！");
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>管理者チャット</h1>
      <div style={styles.chatWindow}>
        {messages.map((message, index) => (
          <div
            key={index}
            style={{
              ...styles.message,
              alignSelf:
                message.sender === "管理者" ? "flex-end" : "flex-start",
              backgroundColor:
                message.sender === "管理者" ? "#DCF8C6" : "#D3D3D3",
            }}
          >
            <p style={styles.sender}>{message.sender}</p>
            <div
              style={styles.messageContent}
              dangerouslySetInnerHTML={{
                __html: message.content.replace(/\\n/g, "<br>"),
              }}
            />
            {message.timestamp && (
              <p style={styles.timestamp}>
                {new Date(message.timestamp).toLocaleString()}
              </p>
            )}
          </div>
        ))}
      </div>
      <div style={styles.buttonArea}>
        <button style={styles.infoButton} onClick={handleSendInformation}>
          情報1
        </button>
      </div>
      <div style={styles.inputArea}>
        <input
          type="text"
          style={styles.input}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="メッセージを入力..."
        />
        <button
          style={styles.button}
          onClick={() => handleSendMessage(inputText)}
        >
          送信
        </button>
      </div>
    </div>
  );
};

const styles: { [key: string]: CSSProperties } = {
  container: {
    fontFamily: "Arial, sans-serif",
    padding: "20px",
    maxWidth: "600px",
    margin: "0 auto",
    backgroundColor: "#F5F5F5",
    height: "100vh",
    display: "flex",
    flexDirection: "column",
  },
  title: { fontSize: "24px", marginBottom: "10px", textAlign: "center" },
  chatWindow: {
    flex: 1,
    border: "1px solid #ccc",
    borderRadius: "5px",
    padding: "10px",
    overflowY: "scroll",
    backgroundColor: "#FFFFFF",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  message: {
    maxWidth: "70%",
    padding: "10px",
    borderRadius: "10px",
    boxShadow: "0 1px 2px rgba(0, 0, 0, 0.1)",
    position: "relative",
    display: "flex",
    flexDirection: "column",
    gap: "5px",
  },
  sender: { fontWeight: "bold", marginBottom: "5px" },
  messageContent: { whiteSpace: "pre-wrap", wordWrap: "break-word" },
  timestamp: { fontSize: "12px", color: "#888", textAlign: "right" },
  buttonArea: { display: "flex", justifyContent: "center", margin: "10px 0" },
  infoButton: {
    padding: "10px 20px",
    backgroundColor: "#4CAF50",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  inputArea: { display: "flex", gap: "10px", marginTop: "10px" },
  input: { flex: 1, padding: "10px", borderRadius: "5px", border: "1px solid #ccc" },
  button: {
    padding: "10px 20px",
    backgroundColor: "#4CAF50",
    color: "white",
    border: "none",
    borderRadius: "5px",
  },
};

export default AdminChatPage;
