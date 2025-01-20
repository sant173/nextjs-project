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

  useEffect(() => {
    try {
      const savedData = localStorage.getItem("savedInformation");
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        setSavedInfo(parsedData);
        setStationName(parsedData.station || "");
        setCarNumber(parsedData.carNumber || "");
        setDoorNumber(parsedData.doorNumber || "");
        setEntranceName(parsedData.entranceName || "");
      }
    } catch (error) {
      console.error("Error parsing saved data:", error);
    }
  }, []);

  const handleSave = () => {
    const data = { station: stationName, carNumber, doorNumber, entranceName };
    localStorage.setItem("savedInformation", JSON.stringify(data));
    setSavedInfo(data);
    alert("情報を保存しました！");
  };

  const handleGoToAdmin = () => {
    router.push("/admin");
  };

  const renderSavedInfo = () => {
    if (!savedInfo) return null;
    return (
      <div style={styles.savedInfo}>
        <h3>保存済み情報</h3>
        <p>駅名: {savedInfo.station}</p>
        <p>号車番号: {savedInfo.carNumber}</p>
        <p>ドア番号: {savedInfo.doorNumber}</p>
        <p>口名: {savedInfo.entranceName}</p>
      </div>
    );
  };

  const renderInput = (
    id: string,
    label: string,
    value: string,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
    placeholder: string
  ) => (
    <label htmlFor={id}>
      {label}
      <input
        id={id}
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={styles.input}
        aria-label={placeholder}
      />
    </label>
  );

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>情報入力</h1>

      {renderSavedInfo()}

      <div style={styles.section}>
        <h2>[介護不要]</h2>
        {renderInput(
          "carNumber",
          "スロープの受け渡し場所:",
          carNumber,
          (e) => setCarNumber(e.target.value),
          "号車番号を入力"
        )}
        号車
        {renderInput(
          "doorNumber",
          "",
          doorNumber,
          (e) => setDoorNumber(e.target.value),
          "ドア番号を入力"
        )}
        番ドア
        <p>時間: 15分前</p>
      </div>

      <div style={styles.section}>
        <h2>[介護必要]</h2>
        {renderInput(
          "stationName",
          "待ち合わせ場所:",
          stationName,
          (e) => setStationName(e.target.value),
          "駅名を入力"
        )}
        駅
        {renderInput(
          "entranceName",
          "",
          entranceName,
          (e) => setEntranceName(e.target.value),
          "口名を入力"
        )}
        口
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

const styles: Record<string, React.CSSProperties> = {
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
  savedInfo: {
    marginBottom: "20px",
    padding: "10px",
    backgroundColor: "#E3F2FD",
    borderRadius: "5px",
  },
};

export default InformationPage;
