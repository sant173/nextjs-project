// app/GoogleMap.tsx
import React, { useEffect, useRef } from "react";

const GoogleMap: React.FC = () => {
  const mapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (mapRef.current) {
      const map = new google.maps.Map(mapRef.current, {
        center: { lat: 35.6762, lng: 139.6503 }, // 初期位置 (東京)
        zoom: 10,
      });

      new google.maps.Marker({
        position: { lat: 35.6762, lng: 139.6503 },
        map: map,
        title: "Tokyo",
      });
    }
  }, []);

  return <div ref={mapRef} style={{ width: "100%", height: "400px" }} />;
};

export default GoogleMap;