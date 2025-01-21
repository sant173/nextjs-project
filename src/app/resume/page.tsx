"use client";
import React, { CSSProperties, useEffect, useRef, useState } from "react";
import { Loader } from "@googlemaps/js-api-loader";
import { useRouter } from "next/navigation";

const ResumePage: React.FC = () => {
  const [routeSummary, setRouteSummary] = useState<{
    origin: string;
    waypoints: string[];
    destination: string;
    travelMode: string;
    departureDateTime: string;
    routeInfo: {
      toWaypoint: string;
      toDestination: string;
      total: string;
      departureAndArrival: string;
    };
    routeMapData: google.maps.DirectionsResult | null;
  } | null>(null);
  const [showDetails, setShowDetails] = useState<boolean>(false); // ルート概要を表示するかどうか
  const mapRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();

  // ローカルストレージからデータを取得
  useEffect(() => {
    const savedRoute = localStorage.getItem("selectedRouteSummary");
    if (savedRoute) {
      setRouteSummary(JSON.parse(savedRoute));
    }
  }, []);

  // 地図を描画
  useEffect(() => {
    const loader = new Loader({
      apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
      version: "weekly",
    });

    loader.load().then(() => {
      if (routeSummary?.routeMapData && mapRef.current) {
        const map = new google.maps.Map(mapRef.current, {
          center: { lat: 35.6762, lng: 139.6503 },
          zoom: 10,
        });

        new google.maps.DirectionsRenderer({
          map: map,
          directions: routeSummary.routeMapData,
        });
      }
    }).catch((error) => {
      console.error("Google Maps API のロードに失敗しました:", error);
    });
  }, [routeSummary, showDetails]);

  // 日付のフォーマット関数
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return `${date.getFullYear()}年${(date.getMonth() + 1).toString().padStart(2, "0")}月${date
      .getDate()
      .toString()
      .padStart(2, "0")}日 ${date.getHours().toString().padStart(2, "0")}時${date
      .getMinutes()
      .toString()
      .padStart(2, "0")}分`;
  };

  // 戻るボタンの機能
  const handleGoBack = () => {
    router.back();
  };

  // チャット画面に移動
  const navigateToChat = () => {
    router.push("/chat");
  };

  // 引き渡されたデータがない場合
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
          <button
            style={styles.dateButton}
            onClick={() => setShowDetails(true)}
          >
            {formatDate(routeSummary.departureDateTime)}
          </button>
          <button style={styles.backButton} onClick={handleGoBack}>
            戻る
          </button>
        </>
      ) : (
        <>
          <h2 style={styles.subHeader}>ルート概要</h2>
          <p><strong>出発地:</strong> {routeSummary.origin}</p>
          <p><strong>経由地:</strong> {routeSummary.waypoints.join(" -> ") || "なし"}</p>
          <p><strong>目的地:</strong> {routeSummary.destination}</p>
          <p><strong>移動手段:</strong> {routeSummary.travelMode}</p>
          <p><strong>出発日時:</strong> {routeSummary.departureDateTime || "未設定"}</p>
          <h3>ルート情報</h3>
          <div style={styles.routeInfoBox}>
            <p><strong>経由地まで:</strong> {routeSummary.routeInfo.toWaypoint}</p>
            <p><strong>経由地から目的地まで:</strong> {routeSummary.routeInfo.toDestination}</p>
            <p><strong>トータル:</strong> {routeSummary.routeInfo.total}</p>
            <p><strong>予定:</strong> {routeSummary.routeInfo.departureAndArrival}</p>
          </div>
          <h3>地図</h3>
          <div ref={mapRef} style={styles.map}></div>
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

const styles:{ [key: string]: CSSProperties } = {
  container: {
    fontFamily: "Arial, sans-serif",
    padding: "20px",
    maxWidth: "600px",
    margin: "0 auto",
    backgroundColor: "#F5F5F5",
    borderRadius: "10px",
    boxShadow: "0px 0px 10px rgba(0,0,0,0.1)",
  },
  header: {
    fontSize: "24px",
    marginBottom: "20px",
    textAlign: "center",
    color: "#333",
  },
  subHeader: {
    fontSize: "20px",
    marginBottom: "10px",
    textAlign: "center",
    color: "#555",
  },
  dateButton: {
    width: "100%",
    padding: "10px 20px",
    backgroundColor: "#4CAF50",
    color: "white",
    border: "none",
    borderRadius: "5px",
    fontSize: "16px",
    cursor: "pointer",
    marginBottom: "10px",
  },
  backButton: {
    width: "100%",
    padding: "10px 20px",
    backgroundColor: "#f44336",
    color: "white",
    border: "none",
    borderRadius: "5px",
    fontSize: "16px",
    cursor: "pointer",
    marginTop: "10px",
  },
  routeInfoBox: {
    backgroundColor: "#E8F5E9",
    padding: "10px",
    borderRadius: "5px",
    border: "1px solid #ccc",
    marginBottom: "20px",
  },
  map: {
    width: "100%",
    height: "400px",
    marginTop: "20px",
    border: "1px solid #ccc",
    borderRadius: "5px",
  },
  buttonRow: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "20px",
  },
  smallButton: {
    padding: "8px 16px",
    backgroundColor: "#4CAF50",
    color: "white",
    border: "none",
    borderRadius: "5px",
    fontSize: "14px",
    cursor: "pointer",
  },
};

export default ResumePage;
