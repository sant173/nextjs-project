"use client";

import React, { useEffect, useRef, useState, Suspense } from "react";
import { Loader } from "@googlemaps/js-api-loader";
import { useRouter } from "next/navigation";
import { useRouteSearch } from "../context/RouteSearchContext";
import ChatPage from "../chat/page";

const GoogleMapUI: React.FC = () => {
  const { itineraries, setItineraries } = useRouteSearch();
  const mapRef = useRef<HTMLDivElement | null>(null);
  const directionsServiceRef = useRef<google.maps.DirectionsService | null>(null);
  const directionsRendererRef = useRef<google.maps.DirectionsRenderer | null>(null);
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);
  const [isChat, setIsChat] = useState<boolean>(false);
  const [selectedRoute, setSelectedRoute] = useState(null);

  const [form, setForm] = useState({
    fromPlace: "",
    toPlace: "",
    date: "",
    time: "",
  });
  const saveRoute = () => {
    const savedRoutes = JSON.parse(localStorage.getItem("myRoutes") || "[]");

    const newRoute = {
      origin: form.fromPlace,
      destination: form.toPlace,
      travelMode: "TRANSIT", // ルート検索の移動手段 (固定値またはユーザー選択可)
      dateTime: form.date ? `${form.date}T${form.time}` : "",
    };

    savedRoutes.push(newRoute);
    localStorage.setItem("myRoutes", JSON.stringify(savedRoutes));
    alert("マイルートが保存されました！");
  };


  const loadRoute = () => {
    const savedRoutes = JSON.parse(localStorage.getItem("savedRoutes") || "[]");
    if (savedRoutes.length > 0) {
      const lastRoute = savedRoutes[savedRoutes.length - 1];
      setForm(lastRoute);
      alert("マイルートを読み込みました！");
    } else {
      alert("保存されたルートがありません。");
    }
  };


  useEffect(() => {
    // sessionStorage からルート情報を取得
    const storedRoute = sessionStorage.getItem("selectedRoute");
    if (storedRoute) {
      const route = JSON.parse(storedRoute);
      setForm((prev) => ({
        ...prev,
        fromPlace: route.origin || prev.fromPlace,
        toPlace: route.destination || prev.toPlace,
        date: route.dateTime ? route.dateTime.split("T")[0] : prev.date,
        time: route.dateTime ? route.dateTime.split("T")[1] : prev.time,
      }));

      // 取得後に sessionStorage をクリア（不要になったため）
      sessionStorage.removeItem("selectedRoute");
    }

    // Google Maps の初期化
    const loader = new Loader({
      apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
      version: "weekly",
    });

    loader.load().then(() => {
      if (mapRef.current) {
        const newMap = new google.maps.Map(mapRef.current, {
          center: { lat: 35.6762, lng: 139.6503 },
          zoom: 10,
        });

        const directionsService = new google.maps.DirectionsService();
        const directionsRenderer = new google.maps.DirectionsRenderer({
          map: newMap,
        });

        directionsServiceRef.current = directionsService;
        directionsRendererRef.current = directionsRenderer;
      }
    });
  }, []);


  const convertStationToCoords = async (stationName: string): Promise<string | null> => {
    return new Promise((resolve, reject) => {
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ address: stationName }, (results, status) => {
        if (status === "OK" && results && results[0].geometry) {
          const location = results[0].geometry.location;
          resolve(`${location.lat()},${location.lng()}`);
        } else {
          reject(`座標取得に失敗: ${stationName}`);
        }
      });
    });
  };

  const handleInputChange = (field: "fromPlace" | "toPlace" | "date" | "time", value: string) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const searchRoute = async () => {
    setLoading(true);
    console.log("🚀 送信データ (変換前):", JSON.stringify(form, null, 2));

    try {
      const fromCoords = await convertStationToCoords(form.fromPlace);
      const toCoords = await convertStationToCoords(form.toPlace);

      if (!fromCoords || !toCoords) {
        alert("出発地または目的地の座標が取得できませんでした。");
        return;
      }

      const requestData = {
        fromPlace: fromCoords,
        toPlace: toCoords,
        date: form.date,
        time: form.time,
      };

      console.log("🚀 送信データ (変換後):", JSON.stringify(requestData, null, 2));

      const res = await fetch("/api/route-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestData),
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error(`🚨 HTTPエラー: ${res.status} ${res.statusText}\n${errorText}`);
        alert(`ルート検索に失敗しました。\nエラー: ${res.status} ${res.statusText}\n${errorText}`);
        return;
      }

      const data = await res.json();
      console.log("📥 APIレスポンス:", JSON.stringify(data, null, 2));

      if (data.itineraries && data.itineraries.length > 0) {
        console.log("✅ 経路データを `setItineraries()` に保存");
        setItineraries(data.itineraries);
      } else {
        console.warn("⚠️ 経路が見つかりませんでした:", data);
        alert("指定された条件で経路が見つかりませんでした。");
      }
    } catch (error) {
      console.error("❌ 検索エラー:", error);
      alert(`ルート検索でエラーが発生しました。\n詳細: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Suspense fallback={<div>Loading...</div>}>
      {isChat ? <ChatPage route={selectedRoute} /> :
        <div style={styles.container}>
          <h2 style={styles.header}>"駅楽" ~EKIRAKU</h2>

          <div style={styles.inputRow}>
            <label style={styles.label}>出発:</label>
            <input
              style={styles.input}
              value={form.fromPlace}
              onChange={(e) => handleInputChange("fromPlace", e.target.value)}
              placeholder="駅名を入力"
            />
          </div>

          <div style={styles.inputRow}>
            <label style={styles.label}>目的地:</label>
            <input
              style={styles.input}
              value={form.toPlace}
              onChange={(e) => handleInputChange("toPlace", e.target.value)}
              placeholder="駅名を入力"
            />
          </div>

          <div style={styles.inputRow}>
            <label style={styles.label}>日時:</label>
            <input
              type="datetime-local"
              style={styles.input}
              value={`${form.date}T${form.time}`}
              onChange={(e) => {
                const [date, time] = e.target.value.split("T");
                setForm({ ...form, date, time });
              }}
            />
          </div>

          <div style={styles.buttonRow}>
            <button style={styles.button} onClick={searchRoute} disabled={loading}>
              {loading ? "検索中..." : "経路検索"}
            </button>
            <button style={styles.button} onClick={saveRoute}>マイルートに追加</button>
            <button style={styles.button} onClick={() => router.push("/myroot")}>マイルート一覧へ</button>
          </div>

          {itineraries?.length > 0 && (
            <div style={styles.result}>
              <h3>検索結果</h3>
              {/* 各経路ごとのまとめを追加 */}
              {itineraries.map((route, index) => {
                const totalDurationMs = new Date(route.legs[route.legs.length - 1].endTime).getTime() - new Date(route.legs[0].startTime).getTime();
                const totalMinutes = Math.floor(totalDurationMs / 60000);
                const totalSeconds = Math.floor((totalDurationMs % 60000) / 1000);

                return (
                  <div key={index} style={styles.routeCard}>
                    {/* 経路ごとの概要を先頭に表示 */}
                    <div style={styles.summaryCard}>
                      <h4>🚀 経路 {index + 1} のまとめ</h4>
                      <p>⏳ 総所要時間: {totalMinutes} 分 {totalSeconds} 秒</p>
                      <p>🕒 出発: <span style={{ color: 'red' }}>{route.legs[0].startTime}</span>
                        🏁 到着: <span style={{ color: 'red' }}>{route.legs[route.legs.length - 1].endTime}</span>
                      </p>
                    </div>

                    {/* 詳細な経路情報 */}
                    <button
                      style={styles.button}
                      onClick={() => {
                        setSelectedRoute(route); // クリックされた経路を選択
                        setIsChat(true); // ChatPageに切り替え
                      }}
                    >
                      経路 {index + 1}
                    </button>
                    {
                      route.legs.map((leg, i) => (
                        <div key={i} style={styles.timelineItem}>
                          <p><strong>{leg.mode === "WALK" ? "🚶‍♂️ 徒歩" : `🚆 ${leg.route} (${leg.agency})`}</strong></p>
                          <p>⏳ 所要時間: {Math.floor((new Date(leg.endTime).getTime() - new Date(leg.startTime).getTime()) / 60000)} 分 {parseInt(((new Date(leg.endTime).getTime() - new Date(leg.startTime).getTime()) % 60000) / 1000)} 秒</p>
                          <p>📏 距離: {(leg.distance / 1000).toFixed(2)} km</p>
                          <p>🕒 出発: {leg.startTime} - {leg.fromName}</p>
                          <p>🏁 到着: {leg.endTime} - {leg.toName}</p>
                        </div>
                      ))
                    }
                  </div>
                );
              })}
            </div>
          )}
        </div>
      }
    </Suspense >
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: { fontFamily: "Arial, sans-serif", padding: 20, maxWidth: 800, margin: "0 auto" },
  header: { fontSize: "24px", marginBottom: 20, textAlign: "center" },
  inputRow: { display: "flex", alignItems: "center", marginBottom: 10 },
  label: { marginRight: 10 },
  input: { flex: 1, padding: 10, borderRadius: 5, border: "1px solid #ccc" },
  buttonRow: { display: "flex", justifyContent: "center", marginTop: 20 },
  button: { padding: 10, backgroundColor: "#4CAF50", color: "white", border: "none", borderRadius: 5, cursor: "pointer", marginRight: '20px' },
  result: { marginTop: 20 },
  routeCard: { padding: 10, border: "1px solid #ccc", borderRadius: 8, marginBottom: 10, backgroundColor: "#f9f9f9" },
  timelineItem: { padding: "10px 0", borderBottom: "1px dashed #ccc" },
};

export default GoogleMapUI;
