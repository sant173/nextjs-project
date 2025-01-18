"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const InformationPage: React.FC = () => {
  const [stationName, setStationName] = useState<string>("");
  const [carNumber, setCarNumber] = useState<string>("");
  const [doorNumber, setDoorNumber] = useState<string>("");
  const [entranceName, setEntranceName] = useState<string>("");
  const [savedInfo, setSavedInfo] = useState<{
    station: string;
    carNumber: string;
    doorNumber: string;
    entranceName: string;
  } | null>(null);

  const router = useRouter();

  // ローカルストレージから保存された情報を読み込み
  useEffect(() => {
    const savedData = localStorage.getItem("savedInformation");
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      setSavedInfo(parsedData);
      setStationName(parsedData.station || "");
      setCarNumber(parsedData.carNumber || "");
      setDoorNumber(parsedData.doorNumber || "");
      setEntranceName(parsedData.entranceName || "");
    }
  }, []);

  const handleSave = () => {
    const data = {
      station: stationName,
      carNumber,
      doorNumber,
      entranceName,
    };
    localStorage.setItem("savedInformation", JSON.stringify(data));
    setSavedInfo(data);
    alert("情報を保存しました！");
  };

  const handleGoToAdmin = () => {
    router.push("/admin");
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>情報入力</h1>

      <div style={styles.section}>
        <h2>[介護不要]</h2>
        <label>
          スロープの受け渡し場所:
          <input
            type="text"
            value={carNumber}
            onChange={(e) => setCarNumber(e.target.value)}
            placeholder="号車番号を入力"
            style={styles.input}
          />
          号車
          <input
            type="text"
            value={doorNumber}
            onChange={(e) => setDoorNumber(e.target.value)}
            placeholder="ドア番号を入力"
            style={styles.input}
          />
          番ドア
        </label>
        <p>時間: 15分前</p>
      </div>

      <div style={styles.section}>
        <h2>[介護必要]</h2>
        <label>
          待ち合わせ場所:
          <input
            type="text"
            value={stationName}
            onChange={(e) => setStationName(e.target.value)}
            placeholder="駅名を入力"
            style={styles.input}
          />
          駅
          <input
            type="text"
            value={entranceName}
            onChange={(e) => setEntranceName(e.target.value)}
            placeholder="口名を入力"
            style={styles.input}
          />
          口
        </label>
        <p>時間: 15分前</p>
      </div>

      <div style={styles.buttonArea}>
        <button style={styles.button} onClick={handleSave}>
          保存
        </button>
        <button style={styles.button} onClick={handleGoToAdmin}>
          トップページに戻る
        </button>
      </div>
    </div>
  );
};

const styles = {
  container: {
    fontFamily: "Arial, sans-serif",
    padding: "20px",
    maxWidth: "600px",
    margin: "0 auto",
    backgroundColor: "#F9F9F9",
    borderRadius: "10px",
    boxShadow: "0px 0px 10px rgba(0,0,0,0.1)",
  },
  title: {
    fontSize: "24px",
    marginBottom: "20px",
    textAlign: "center",
  },
  section: {
    marginBottom: "20px",
  },
  input: {
    marginLeft: "5px",
    marginRight: "5px",
    padding: "5px",
    borderRadius: "5px",
    border: "1px solid #ccc",
    width: "80px",
  },
  buttonArea: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "20px",
  },
  button: {
    padding: "10px 20px",
    backgroundColor: "#2196F3",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
};

export default InformationPage;
