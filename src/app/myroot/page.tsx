"use client";
import React, { CSSProperties, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const MyRoutesPage: React.FC = () => {
  const [savedRoutes, setSavedRoutes] = useState<
    { origin: string; waypoints?: string[]; destination: string; travelMode: string; dateTime?: string }[]
  >([]);
  const router = useRouter();

  useEffect(() => {
    // ローカルストレージから保存されたルート情報を取得
    const routes = localStorage.getItem("myRoutes");
    if (routes) {
      setSavedRoutes(JSON.parse(routes));
    }
  }, []);

  const deleteRoute = (index: number) => {
    const updatedRoutes = savedRoutes.filter((_, i) => i !== index);
    setSavedRoutes(updatedRoutes);
    localStorage.setItem("myRoutes", JSON.stringify(updatedRoutes));
  };

  const loadRouteToForm = (route: {
    origin: string;
    waypoints?: string[];
    destination: string;
    travelMode: string;
    dateTime?: string;
  }) => {
    // フォームにルート情報を戻すために、リダイレクト時にクエリパラメータを設定
    const queryParams = new URLSearchParams({
      origin: route.origin,
      destination: route.destination,
      travelMode: route.travelMode,
      dateTime: route.dateTime || "",
      waypoints: route.waypoints?.join(",") || "",
    }).toString();

    router.push(`/navi?${queryParams}`);
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>マイルート</h1>
      {savedRoutes.length === 0 ? (
        <p style={styles.noRoutes}>保存されたルートはありません。</p>
      ) : (
        <div>
          {savedRoutes.map((route, index) => (
            <div key={index} style={styles.routeCard}>
              <p>
                <strong>出発地:</strong> {route.origin}
              </p>
              <p>
                <strong>経由地:</strong>{" "}
                {route.waypoints && route.waypoints.length > 0
                  ? route.waypoints.join(" → ")
                  : "なし"}
              </p>
              <p>
                <strong>目的地:</strong> {route.destination}
              </p>
              <p>
                <strong>移動手段:</strong> {route.travelMode}
              </p>
              <p>
                <strong>日付と時間:</strong> {route.dateTime || "未設定"}
              </p>
              <div style={styles.actions}>
                <button
                  style={styles.loadButton}
                  onClick={() => loadRouteToForm(route)}
                >
                  フォームに読み込む
                </button>
                <button
                  style={styles.deleteButton}
                  onClick={() => deleteRoute(index)}
                >
                  削除
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const styles:{ [key: string]: CSSProperties } = {
  container: {
    fontFamily: "Arial, sans-serif",
    padding: "20px",
    backgroundColor: "#F5F5F5",
    minHeight: "100vh",
  },
  header: {
    fontSize: "24px",
    marginBottom: "20px",
    textAlign: "center",
  },
  noRoutes: {
    textAlign: "center",
    color: "#888",
  },
  routeCard: {
    marginBottom: "20px",
    padding: "10px",
    border: "1px solid #ccc",
    borderRadius: "5px",
    backgroundColor: "#FFFFFF",
  },
  actions: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "10px",
  },
  loadButton: {
    padding: "5px 10px",
    backgroundColor: "#4CAF50",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  deleteButton: {
    padding: "5px 10px",
    backgroundColor: "#f44336",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
};

export default MyRoutesPage;
