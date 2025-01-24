"use client";

import React, { CSSProperties, useEffect, useRef, useState, Suspense } from "react";
import { Loader } from "@googlemaps/js-api-loader";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

const GoogleMapUI: React.FC = () => {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [originInput, setOriginInput] = useState<string>("現在地");
  const [actualOrigin, setActualOrigin] = useState<string>("現在地");
  const [destinationInput, setDestinationInput] = useState<string>("");
  const [waypoints, setWaypoints] = useState<string[]>([]);
  const [newWaypoint, setNewWaypoint] = useState<string>("");
  const [travelMode, setTravelMode] = useState<string>("DRIVING");
  const [departureDateTime, setDepartureDateTime] = useState<string>("");
  const [routeInfo, setRouteInfo] = useState<{
    toWaypoint: string;
    toDestination: string;
    total: string;
    departureAndArrival: string;
  }>({
    toWaypoint: "",
    toDestination: "",
    total: "",
    departureAndArrival: "",
  });
  const [isRouteCalculated, setIsRouteCalculated] = useState<boolean>(false);

  const directionsServiceRef = useRef<google.maps.DirectionsService | null>(null);
  const directionsRendererRef = useRef<google.maps.DirectionsRenderer | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

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
        setMap(newMap);

        const directionsService = new google.maps.DirectionsService();
        const directionsRenderer = new google.maps.DirectionsRenderer({
          map: newMap,
        });

        directionsServiceRef.current = directionsService;
        directionsRendererRef.current = directionsRenderer;
      }
    });

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setActualOrigin(`${latitude},${longitude}`);
        },
        (error) => console.error("現在地の取得に失敗しました:", error)
      );
    }
  }, []);

  useEffect(() => {
    const origin = searchParams.get("origin");
    const destination = searchParams.get("destination");
    const travelModeParam = searchParams.get("travelMode");
    const waypointsParam = searchParams.get("waypoints");
    const dateTimeParam = searchParams.get("dateTime");

    if (origin) setOriginInput(origin);
    if (destination) setDestinationInput(destination);
    if (travelModeParam) setTravelMode(travelModeParam);
    if (waypointsParam) setWaypoints(waypointsParam.split(","));
    if (dateTimeParam) setDepartureDateTime(dateTimeParam);
  }, [searchParams]);

  const addWaypoint = () => {
    if (newWaypoint.trim()) {
      setWaypoints([...waypoints, newWaypoint]);
      setNewWaypoint("");
    }
  };

  const removeWaypoint = (index: number) => {
    const updatedWaypoints = waypoints.filter((_, i) => i !== index);
    setWaypoints(updatedWaypoints);
  };

  const calculateRoute = async () => {
    if (!destinationInput || !directionsServiceRef.current || !directionsRendererRef.current) {
      alert("出発地または目的地を正しく入力してください。");
      return;
    }

    const originToUse = originInput === "現在地" ? actualOrigin : originInput;
    const waypointsToUse = waypoints.map((wp) => ({ location: wp, stopover: true }));

    try {
      const totalResult = await directionsServiceRef.current.route({
        origin: originToUse,
        destination: destinationInput,
        waypoints: waypointsToUse,
        travelMode: google.maps.TravelMode[travelMode as keyof typeof google.maps.TravelMode],
        transitOptions: departureDateTime ? { departureTime: new Date(departureDateTime) } : undefined,
      });

      const leg = totalResult.routes[0].legs;
      const totalDistance = leg.reduce((sum, item) => sum + (item.distance?.value || 0), 0);
      const totalDuration = leg.reduce((sum, item) => sum + (item.duration?.value || 0), 0);

      const departureTime = new Date(departureDateTime);
      const arrivalTime = new Date(departureTime.getTime() + totalDuration * 1000);

      setRouteInfo({
        toWaypoint: `距離: ${leg[0]?.distance?.text || "不明"}, 時間: ${leg[0]?.duration?.text || "不明"}`,
        toDestination: `距離: ${leg[leg.length - 1]?.distance?.text || "不明"}, 時間: ${leg[leg.length - 1]?.duration?.text || "不明"}`,
        total: `距離: ${(totalDistance / 1000).toFixed(2)} km, 時間: ${Math.floor(totalDuration / 60)} 分`,
        departureAndArrival: `${departureTime.getHours()}時${departureTime.getMinutes()}分 出発 - ${arrivalTime.getHours()}時${arrivalTime.getMinutes()}分 到着`,
      });

      directionsRendererRef.current.setDirections(totalResult);
      setIsRouteCalculated(true);
    } catch (error) {
      alert("ルートの計算に失敗しました。");
      console.error(error);
    }
  };

  const saveRoute = () => {
    const routeData = {
      origin: originInput,
      waypoints,
      destination: destinationInput,
      travelMode,
      dateTime: departureDateTime,
    };

    const routes = JSON.parse(localStorage.getItem("myRoutes") || "[]");
    routes.push(routeData);
    localStorage.setItem("myRoutes", JSON.stringify(routes));
    alert("ルートが保存されました！");
  };

  const saveRouteToChat = () => {
    const routeDetails = {
      出発: originInput,
      経由地: waypoints.join(", "),
      目的地: destinationInput,
      移動手段: travelMode,
      日付と時間: departureDateTime,
    };

    localStorage.setItem("routeDetails", JSON.stringify(routeDetails));
    router.push("/chat");
  };

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div style={styles.container}>
        <div style={styles.header}>Googleマップルートプランナー</div>
        <div style={styles.inputRow}>
          <label style={styles.label}>出発:</label>
          <input
            style={styles.input}
            value={originInput}
            onChange={(e) => setOriginInput(e.target.value)}
            placeholder="出発地を入力"
          />
        </div>
        <div style={styles.inputRow}>
          <label style={styles.label}>経由地:</label>
          <input
            style={styles.input}
            value={newWaypoint}
            onChange={(e) => setNewWaypoint(e.target.value)}
            placeholder="経由地を入力"
          />
          <button style={styles.addButton} onClick={addWaypoint}>
            追加
          </button>
        </div>
        <div>
          {waypoints.map((wp, index) => (
            <div key={index} style={styles.waypointRow}>
              <span>経由地 {index + 1}: {wp}</span>
              <button style={styles.removeButton} onClick={() => removeWaypoint(index)}>
                削除
              </button>
            </div>
          ))}
        </div>
        <div style={styles.inputRow}>
          <label style={styles.label}>目的地:</label>
          <input
            style={styles.input}
            value={destinationInput}
            onChange={(e) => setDestinationInput(e.target.value)}
            placeholder="目的地を入力"
          />
        </div>
        <div style={styles.inputRow}>
          <label style={styles.label}>移動手段:</label>
          <select
            style={styles.select}
            value={travelMode}
            onChange={(e) => setTravelMode(e.target.value)}
          >
            <option value="DRIVING">車</option>
            <option value="WALKING">徒歩</option>
            <option value="BICYCLING">自転車</option>
            <option value="TRANSIT">公共交通機関</option>
          </select>
        </div>
        <div style={styles.inputRow}>
          <label style={styles.label}>日付と時間:</label>
          <input
            type="datetime-local"
            style={styles.input}
            value={departureDateTime}
            onChange={(e) => setDepartureDateTime(e.target.value)}
          />
        </div>
        <div ref={mapRef} style={{ width: "100%", height: "400px", margin: "20px 0" }} />
        <div style={styles.buttonRow}>
          <button style={styles.button} onClick={calculateRoute}>
            ルート計算
          </button>
          <button style={styles.confirmButton} onClick={saveRouteToChat}>
            確定してチャットへ
          </button>
          <button style={styles.myRouteButton} onClick={saveRoute}>
            マイルートを追加
          </button>
        </div>
        {isRouteCalculated && (
          <div style={styles.result}>
            <h3>ルート情報</h3>
            <p><strong>出発〜経由地:</strong> {routeInfo.toWaypoint}</p>
            <p><strong>経由地〜目的地:</strong> {routeInfo.toDestination}</p>
            <p><strong>トータル:</strong> {routeInfo.total}</p>
            <p><strong>予定:</strong> {routeInfo.departureAndArrival}</p>
          </div>
        )}
        <div style={styles.buttonRow}>
          <Link href="/myroot">
            <button style={styles.myRouteButton}>マイルートを見る</button>
          </Link>
          <button style={styles.backButton} onClick={() => router.back()}>
            戻る
          </button>
        </div>
      </div>
    </Suspense>
  );
};

const styles: { [key: string]: CSSProperties } = {
  container: { fontFamily: "Arial, sans-serif", padding: "20px", maxWidth: "800px", margin: "0 auto" },
  header: { fontSize: "24px", marginBottom: "20px", textAlign: "center" },
  inputRow: { display: "flex", alignItems: "center", marginBottom: "10px" },
  waypointRow: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "5px" },
  label: { marginRight: "10px" },
  input: { flex: 1, padding: "10px", borderRadius: "5px", border: "1px solid #ccc" },
  select: { flex: 1, padding: "10px", borderRadius: "5px", border: "1px solid #ccc" },
  buttonRow: { display: "flex", justifyContent: "space-between", marginTop: "20px" },
  button: { padding: "10px 20px", backgroundColor: "#4CAF50", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" },
  confirmButton: { padding: "10px 20px", backgroundColor: "#FF9800", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" },
  myRouteButton: { padding: "10px 20px", backgroundColor: "#2196F3", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" },
  removeButton: { padding: "5px 10px", backgroundColor: "#f44336", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" },
  backButton: { padding: "10px 20px", backgroundColor: "#f44336", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" },
  result: { backgroundColor: "#f9f9f9", padding: "15px", borderRadius: "5px", border: "1px solid #ccc", marginTop: "20px" },
};

export default GoogleMapUI;
