"use client";
import React, { useState, useEffect } from "react";

const AdminChatPage: React.FC = () => {
  const [messages, setMessages] = useState<string[]>([]);
  const [replies, setReplies] = useState<string[]>([]);
  const [inputText, setInputText] = useState<string>("");
  const [selectedMessage, setSelectedMessage] = useState<string | null>(null);
  const [selectedReply, setSelectedReply] = useState<string | null>(null);
  const [destinationStation, setDestinationStation] = useState<string>("");
  const [isChatVisible, setIsChatVisible] = useState<boolean>(false);

  useEffect(() => {
    // ローカルストレージから利用者のメッセージを取得
    const userMessages = JSON.parse(localStorage.getItem("userMessages") || "[]");
    setMessages(userMessages);

    // ローカルストレージから管理者の返信を取得
    const adminReplies = JSON.parse(localStorage.getItem("adminReplies") || "[]");
    setReplies(adminReplies);
  }, []);

  useEffect(() => {
    // 管理者の返信をローカルストレージに同期
    localStorage.setItem("adminReplies", JSON.stringify(replies));
  }, [replies]);

  const handleReply = () => {
    if (!inputText.trim()) return;

    const updatedReplies = [...replies, `管理者: ${inputText}`];
    setReplies(updatedReplies);
    setInputText("");
  };

  const handleDeleteMessage = (message: string) => {
    const updatedMessages = messages.filter((msg) => msg !== message);
    setMessages(updatedMessages);
    localStorage.setItem("userMessages", JSON.stringify(updatedMessages));
    setSelectedMessage(null);
  };

  const handleDeleteReply = (reply: string) => {
    const updatedReplies = replies.filter((rep) => rep !== reply);
    setReplies(updatedReplies);
    setSelectedReply(null);
  };

  const handleStartChat = () => {
    if (!destinationStation.trim()) {
      alert("目的地駅を入力してください。");
      return;
    }
    setIsChatVisible(true);
  };

  return (
    <div style={styles.container}>
      {!isChatVisible ? (
        <div style={styles.destinationContainer}>
          <h1 style={styles.title}>目的地駅の設定</h1>
          <input
            type="text"
            style={styles.input}
            value={destinationStation}
            onChange={(e) => setDestinationStation(e.target.value)}
            placeholder="目的地駅を入力..."
          />
          <button style={styles.button} onClick={handleStartChat}>
            チャットを開始
          </button>
        </div>
      ) : (
        <>
          <h1 style={styles.title}>管理者チャット</h1>
          <div style={styles.chatWindow}>
            {messages.map((message, index) => (
              <div
                key={`user-${index}`}
                style={{
                  ...styles.message,
                  backgroundColor: selectedMessage === message ? "#FFE4E1" : "#ECECEC",
                }}
                onClick={() => setSelectedMessage(message)}
              >
                利用者: {message}
                {selectedMessage === message && (
                  <button
                    style={styles.deleteButton}
                    onClick={() => handleDeleteMessage(message)}
                  >
                    削除
                  </button>
                )}
              </div>
            ))}
            {replies.map((reply, index) => (
              <div
                key={`admin-${index}`}
                style={{
                  ...styles.message,
                  alignSelf: "flex-end",
                  backgroundColor: selectedReply === reply ? "#C8FDD4" : "#D4F8E8",
                }}
                onClick={() => setSelectedReply(reply)}
              >
                {reply}
                {selectedReply === reply && (
                  <button
                    style={styles.deleteButton}
                    onClick={() => handleDeleteReply(reply)}
                  >
                    削除
                  </button>
                )}
              </div>
            ))}
          </div>
          <div style={styles.inputArea}>
            <input
              type="text"
              style={styles.input}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="返信メッセージを入力..."
            />
            <button style={styles.button} onClick={handleReply}>
              返信
            </button>
          </div>
        </>
      )}
    </div>
  );
};

const styles:{ [key: string]: React.CSSProperties }  = {
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
  deleteButton: {
    position: "absolute",
    top: "50%",
    right: "-70px",
    transform: "translateY(-50%)",
    padding: "5px 10px",
    backgroundColor: "#f44336",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.2)",
  },
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
  destinationContainer: {
    textAlign: "center",
    marginTop: "50px",
  },
};

export default AdminChatPage;
