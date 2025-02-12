"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useRouteSearch } from "../context/RouteSearchContext";

const ResumePage: React.FC = () => {
  const { itineraries } = useRouteSearch();
  const [routeSummary, setRouteSummary] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (itineraries && itineraries.length > 0) {
      setRouteSummary(itineraries[itineraries.length - 1]); // 最新の経路情報を取得
    } else {
      const savedRoute = localStorage.getItem("myRoutes");
      if (savedRoute) {
        const routes = JSON.parse(savedRoute);
        if (routes.length > 0) {
          setRouteSummary(routes[routes.length - 1]);
        }
      }
    }
  }, [itineraries]);

  const formatDate = (dateString: string): string => {
    if (!dateString) return "未設定";
    const date = new Date(dateString);
    return `${date.getFullYear()}年${(date.getMonth() + 1)
      .toString()
      .padStart(2, "0")}月${date.getDate().toString().padStart(2, "0")}日 ${date
      .getHours()
      .toString()
      .padStart(2, "0")}時${date.getMinutes().toString().padStart(2, "0")}分`;
  };

  const handleGoBack = () => {
    router.back();
  };

  const navigateToChat = () => {
    router.push("/chat");
  };

  if (!routeSummary) {
    return (
      <div style={styles.container}>
        <h1 style={styles.header}>予約履歴</h1>
        <p>ルート情報がありません。</p>
        <button style={styles.backButton} onClick={handleGoBack}>
          戻る
        </button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>予約履歴</h1>
      {!showDetails ? (
        <>
          <button style={styles.dateButton} onClick={() => setShowDetails(true)}>
            {formatDate(routeSummary?.dateTime || "")}
          </button>
          <button style={styles.backButton} onClick={handleGoBack}>
            戻る
          </button>
        </>
      ) : (
        <>
          <h2 style={styles.subHeader}>ルート概要</h2>
          <p><strong>出発地:</strong> {routeSummary.origin}</p>
          <p><strong>目的地:</strong> {routeSummary.destination}</p>
          <p><strong>移動手段:</strong> {routeSummary.travelMode}</p>
          <p><strong>出発日時:</strong> {formatDate(routeSummary?.dateTime || "")}</p>
          {routeSummary?.legs && routeSummary.legs.length > 0 ? (
            routeSummary.legs.map((leg, i) => (
              <div key={i} style={styles.timelineItem}>
                <p><strong>{leg.mode === "WALK" ? "🚶‍♂️ 徒歩" : `🚆 ${leg.route} (${leg.agency})`}</strong></p>
                <p>⏳ 所要時間: {Math.floor((new Date(leg.endTime).getTime() - new Date(leg.startTime).getTime()) / 60000)} 分 
                   {parseInt(((new Date(leg.endTime).getTime() - new Date(leg.startTime).getTime()) % 60000) / 1000)} 秒</p>
                <p>📏 距離: {(leg.distance / 1000).toFixed(2)} km</p>
                <p>🕒 出発: {leg.startTime} - {leg.fromName}</p>
                <p>🏁 到着: {leg.endTime} - {leg.toName}</p>
              </div>
            ))
          ) : (
            <p>経路情報がありません。</p>
          )}
          <div style={styles.buttonRow}>
            <button style={styles.smallButton} onClick={handleGoBack}>
              戻る
            </button>
            <button style={styles.smallButton} onClick={navigateToChat}>
              チャットに移動
            </button>
          </div>
        </>
      )}
    </div>
  );
};

const styles = {
  container: { fontFamily: "Arial, sans-serif", padding: "20px", maxWidth: "600px", margin: "0 auto", backgroundColor: "#F5F5F5", borderRadius: "10px", boxShadow: "0px 0px 10px rgba(0,0,0,0.1)" },
  header: { fontSize: "24px", marginBottom: "20px", textAlign: "center", color: "#333" },
  subHeader: { fontSize: "20px", marginBottom: "10px", textAlign: "center", color: "#555" },
  dateButton: { width: "100%", padding: "10px 20px", backgroundColor: "#4CAF50", color: "white", border: "none", borderRadius: "5px", fontSize: "16px", cursor: "pointer", marginBottom: "10px" },
  backButton: { width: "100%", padding: "10px 20px", backgroundColor: "#f44336", color: "white", border: "none", borderRadius: "5px", fontSize: "16px", cursor: "pointer", marginTop: "10px" },
  buttonRow: { display: "flex", justifyContent: "space-between", marginTop: "20px" },
  smallButton: { padding: "8px 16px", backgroundColor: "#4CAF50", color: "white", border: "none", borderRadius: "5px", fontSize: "14px", cursor: "pointer" },
  timelineItem: { padding: "10px 0", borderBottom: "1px dashed #ccc" },
};

export default ResumePage;
