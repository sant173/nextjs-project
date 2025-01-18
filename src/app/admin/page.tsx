"use client"; // クライアントコンポーネントとして指定

import Link from "next/link";
import "./index.css"; // CSSファイル

export default function AdminPage() {
  return (
    <main className="main">
      {/* 言語選択のボタン */}
      <div className="language-selector">
        <button className="language-button">EN</button>
        <button className="language-button">中文</button>
        <button className="language-button">한국어</button>
        <button className="language-button">日本語</button>
      </div>

      {/* 中央のテキスト */}
      <h1 className="center-text">管理者ページ</h1>

      {/* ボタンコンテナ */}
      <div className="button-container">
        <Link href="/information" className="bubble">
          情報入力
        </Link>
        <Link href="/adminchat" className="bubble">
          予約確認
        </Link>
        <Link href="/confirmation" className="bubble">
          駅員チャット
        </Link>
      </div>
    </main>
  );
}
