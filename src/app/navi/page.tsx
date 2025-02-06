"use client";

import React, { useEffect, useRef, useState, Suspense } from "react";
import { Loader } from "@googlemaps/js-api-loader";
import { useRouter } from "next/navigation";
import { useRouteSearch } from "../context/RouteSearchContext";

const GoogleMapUI: React.FC = () => {
  const { itineraries,setItineraries } = useRouteSearch();
  const mapRef = useRef<HTMLDivElement | null>(null);
  const directionsServiceRef = useRef<google.maps.DirectionsService | null>(null);
  const directionsRendererRef = useRef<google.maps.DirectionsRenderer | null>(null);
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    fromPlace: "",
    toPlace: "",
    date: "",
    time: "",
  });

  useEffect(() => {
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

  // **駅名を緯度経度に変換**
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

  // **入力フィールドの変更時に座標を取得**
  const handleInputChange = async (field: "fromPlace" | "toPlace", value: string) => {
    setLoading(true);
    try {
      const coords = await convertStationToCoords(value);
      if (coords) {
        setForm((prev) => ({
          ...prev,
          [field]: coords, // 駅名ではなく座標を保存
        }));
      } else {
        alert(`「${value}」の座標を取得できませんでした。`);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // **ルート検索を実行**
  const searchRoute = async () => {
    setLoading(true);
    console.log("🚀 送信データ:", JSON.stringify(form, null, 2)); // 送信データを確認

    try {
      const res = await fetch("/api/route-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error(`🚨 HTTPエラー: ${res.status} ${res.statusText}\n${errorText}`);
        alert(`ルート検索に失敗しました。\nエラー: ${res.status} ${res.statusText}\n${errorText}`);
        return;
      }

      const data = await res.json();
      console.log("📥 APIレスポンス:", JSON.stringify(data, null, 2)); // 取得したデータをログに出力

      if (data.itineraries && data.itineraries.length > 0) {
        console.log("✅ 経路データを `setItineraries()` に保存");
        setItineraries(data.itineraries);
        console.log(itineraries)
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
      <div style={styles.container}>
        <div style={styles.header}>Googleマップルート検索</div>

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

        <div ref={mapRef} style={{ width: "100%", height: "400px", margin: "20px 0" }} />

        <div style={styles.buttonRow}>
          <button style={styles.button} onClick={searchRoute} disabled={loading}>
            {loading ? "検索中..." : "経路検索"}
          </button>
        </div>
      </div>

      {itineraries && itineraries.length > 0 && (
          <div style={styles.result}>
            <h3>検索結果</h3>
            <ul>
              {itineraries.map((route, index) => (
                <li key={index}>
                  <strong>経路 {index + 1}:</strong> 所要時間 {route.duration} 秒
                </li>
              ))}
            </ul>
          </div>
        )}
    </Suspense>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: { fontFamily: "Arial, sans-serif", padding: "20px", maxWidth: "800px", margin: "0 auto" },
  header: { fontSize: "24px", marginBottom: "20px", textAlign: "center" },
  inputRow: { display: "flex", alignItems: "center", marginBottom: "10px" },
  label: { marginRight: "10px" },
  input: { flex: 1, padding: "10px", borderRadius: "5px", border: "1px solid #ccc" },
  buttonRow: { display: "flex", justifyContent: "center", marginTop: "20px" },
  button: {
    padding: "10px 20px",
    backgroundColor: "#4CAF50",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
};

export default GoogleMapUI;
