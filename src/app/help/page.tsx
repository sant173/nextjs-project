"use client";
import React from "react";
import { useRouter } from "next/navigation";

// 介助確認ページコンポーネント
const AidCheckPage: React.FC = () => {
  const router = useRouter();

  // チャットページへ遷移する関数
  const navigateToChat = (aidRequired: boolean) => {
    // aidRequiredをクエリパラメータとして渡す
    router.push(`/chat?aidRequired=${aidRequired}`);
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>介助を必要とされますか？</h1>
      <button
        style={styles.button}
        onClick={() => navigateToChat(false)}
        aria-label="介助不要な方はこちら"
      >
        介助不要な方はこちら
      </button>
      <p style={styles.note}>
        ※介助不要と選択された方には電車に乗り降りする際のスロープのご準備のみとさせていただきます
      </p>
      <button
        style={styles.button}
        onClick={() => navigateToChat(true)}
        aria-label="介助必要な方はこちら"
      >
        介助必要な方はこちら
      </button>
    </div>
  );
};

// スタイルオブジェクトを定義
const styles: { [key: string]: React.CSSProperties } = {
  container: {
    fontFamily: "Arial, sans-serif",
    textAlign: "center",
    padding: "20px",
    background: "linear-gradient(to bottom, #8fd3f4, #ffffff)",
    height: "100vh",
    display: "flex",
    flexDirection: "column", // フレックスボックスの方向を指定
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: "24px",
    color: "#000",
    marginBottom: "20px",
  },
  button: {
    margin: "10px 0",
    padding: "10px 20px",
    fontSize: "16px",
    borderRadius: "10px",
    border: "none",
    cursor: "pointer",
    backgroundColor: "#a7f3d0",
    color: "#000",
    fontWeight: "bold",
    width: "80%",
    maxWidth: "300px",
  },
  note: {
    fontSize: "14px",
    color: "#555",
    marginBottom: "20px",
  },
};

export default AidCheckPage;
