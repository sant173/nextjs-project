"use client"; // クライアントコンポーネントとして指定

import React, { useState } from "react";
import Link from "next/link";
import "./index.css"; // CSSファイル

export default function HomePage() {
  const [showPasswordInput, setShowPasswordInput] = useState(false);
  const [password, setPassword] = useState("");

  const handleAdminClick = () => {
    setShowPasswordInput(true);
  };

  const handlePasswordSubmit = () => {
    if (password === "4029") {
      // 正しいパスワードの場合、管理者ページへ移動
      window.location.href = "/admin";
    } else {
      alert("パスワードが違います");
    }
  };

  return (
    <main className="main">
      {/* 言語選択のボタン */}
      <div className="language-selector">
        <button className="language-button">EN</button>
        <button className="language-button">中文</button>
        <button className="language-button">한국어</button>
        <button className="language-button">日本語</button>
      </div>

      {/* 管理者ボタン */}
      <button className="admin-button" onClick={handleAdminClick}>
        管理者
      </button>

      {/* 認証ボックス */}
      {showPasswordInput && (
        <div className="password-container">
          <p className="password-text">管理者用の暗証番号を入力してください</p>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="暗証番号"
            className="password-input"
          />
          <button onClick={handlePasswordSubmit} className="password-submit">
            認証
          </button>
        </div>
      )}

      {/* 中央のテキスト */}
      <h1 className="center-text">さあ！お出かけしましょう！</h1>

      {/* ボタンコンテナ */}
      <div className="button-container">
        <Link href="/resume" className="bubble">
          予約履歴
        </Link>
        <Link href="/myroot" className="bubble">
          マイルート
        </Link>
        <Link href="/navi" className="bubble">
          乗換案内
        </Link>
      </div>
    </main>
  );
}
