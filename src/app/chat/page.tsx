"use client";

import Link from "next/link";
import React, { CSSProperties, useEffect, useState } from "react";

type Message = {
  sender: string;
  content: string;
  timestamp: string;
}

type Leg = {
  mode: string;
  route?: string;
  agency?: string;
  startTime: string;
  endTime: string;
  fromName: string;
  toName: string;
  distance: number;
};

type Route = {
  legs: Leg[];
};

type Props = {
  itineraries: Route[];
  styles: { [key: string]: React.CSSProperties };
};


const ChatPage: React.FC<Props> = ({ itineraries, styles }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState<string>(""); // 入力欄のテキスト
  const [ws, setWs] = useState<WebSocket | null>(null); // WebSocket接続
  const [showDelayOptions, setShowDelayOptions] = useState<boolean>(false); // 遅延オプション表示切り替え

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:8080");
    setWs(socket);

    // 初回接続時にローカルストレージからルート情報を取得し、最初のメッセージを送信
    const routeDetails = localStorage.getItem("routeDetails");
    if (routeDetails) {
      const parsedDetails = JSON.parse(routeDetails);
      const formattedMessage = `出発: ${parsedDetails.出発}<br>目的地: ${parsedDetails.目的地}<br>時間: ${parsedDetails.日付と時間}`;

      const initialMessage = {
        sender: "利用者",
        content: formattedMessage,
        timestamp: new Date().toISOString(),
      };

      // ローカルに最初のメッセージを追加
      setMessages((prev:Message[]) => [...prev, initialMessage]);

      // WebSocket経由でサーバーに送信
      socket.onopen = () => {
        socket.send(JSON.stringify(initialMessage));
      };
    }

    // メッセージ受信時の処理
    socket.onmessage = (event) => {
      try {
        const data:Message = JSON.parse(event.data);
        setMessages((prev: Message[]) => [...prev, data]);
      } catch (error) {
        console.error("メッセージの解析に失敗しました:", error);
      }
    };

    socket.onclose = () => {
      console.log("WebSocketが切断されました");
    };

    // コンポーネントのアンマウント時にソケットを閉じる
    return () => {
      socket.close();
    };
  }, []);

  const handleSendMessage = () => {
    if (ws && inputText.trim()) {
      const messageData: Message = {
        sender: "利用者",
        content: inputText,
        timestamp: new Date().toISOString(),
      };

      // WebSocketで送信
      ws.send(JSON.stringify(messageData));

      // ローカルにメッセージを追加
      setMessages((prev: Message[]) => [...prev, messageData]);

      // 入力フィールドをクリア
      setInputText("");
    }
  };

  const handleQuickMessage = (message: string) => {
    setInputText(message);
  };

  const handleDelayOptionClick = (delayTime: string) => {
    setInputText(`${delayTime}分遅れます`);
    setShowDelayOptions(false);
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>利用者チャット</h1>
      <div style={styles.chatWindow}>
        <div style={styles.notice}>
          <p>管理者: 介助が必要ですか？</p>
          <p style={styles.noticeText}>
            * 介助不要な方には、スロープのみお持ちします<br />
            * 介助必要な方には、改札からご案内をさせていただきます
          </p>
        </div>
        {messages
          .filter(
            (message) =>
              !(
                message.sender === "匿名" &&
                message.content.includes("利用者")
              )
          )
          .map((message, index) => (
            <div
              key={index}
              style={{
                ...styles.message,
                alignSelf:
                  message.sender === "利用者" ? "flex-end" : "flex-start",
                backgroundColor:
                  message.sender === "利用者" ? "#DCF8C6" : "#D3D3D3",
              }}
            >
              <p style={styles.sender}>
                {message.sender === "管理者"
                  ? `管理者`
                  : message.sender === "利用者"
                    ? `利用者`
                    : "管理者"}
              </p>
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
        <button
          style={styles.quickButton}
          onClick={() => handleQuickMessage("介助不要です")}
        >
          介助不要
        </button>
        <button
          style={styles.quickButton}
          onClick={() => handleQuickMessage("介助必要です")}
        >
          介助必要
        </button>
        <button
          style={styles.quickButton}
          onClick={() => setShowDelayOptions(true)}
        >
          遅れる
        </button>
        <button
          style={styles.quickButton}
          onClick={() => handleQuickMessage("特になし")}
        >
          特になし
        </button>
      </div>
      {showDelayOptions && (
        <div style={styles.delayOptions}>
          <button
            style={styles.delayButton}
            onClick={() => handleDelayOptionClick("10")}
          >
            10分
          </button>
          <button
            style={styles.delayButton}
            onClick={() => handleDelayOptionClick("20")}
          >
            20分
          </button>
          <button
            style={styles.delayButton}
            onClick={() => handleDelayOptionClick("30")}
          >
            30分
          </button>
        </div>
      )}
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
      <div style={styles.linkContainer}>
        <Link href="/" style={styles.link}>
          トップページに戻る
        </Link>
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
  notice: { backgroundColor: "#D3D3D3", padding: "10px", borderRadius: "5px" },
  noticeText: { fontSize: "14px", color: "#555", marginTop: "5px" },
  buttonArea: {
    display: "flex",
    gap: "10px",
    justifyContent: "center",
    marginBottom: "10px",
  },
  quickButton: {
    padding: "10px 20px",
    backgroundColor: "#4CAF50",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  delayOptions: {
    display: "flex",
    justifyContent: "center",
    gap: "10px",
    marginBottom: "10px",
  },
  delayButton: {
    padding: "10px 20px",
    backgroundColor: "#FF9800",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  inputArea: { display: "flex", gap: "10px" },
  input: { flex: 1, padding: "10px", borderRadius: "5px", border: "1px solid #ccc" },
  button: {
    padding: "10px 20px",
    backgroundColor: "#4CAF50",
    color: "white",
    border: "none",
    borderRadius: "5px",
  },
};

export default ChatPage;
