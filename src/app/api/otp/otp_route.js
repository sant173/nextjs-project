
import axios from "axios";

const convertTimestampToDate = (timestamp) => {
  const date = new Date(timestamp);
  const options = {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZone: "Asia/Tokyo",
    hour12: false,
  };
  return date.toLocaleString("ja-JP", options).replace(",", "");
};

const calculateDirection = (fromStation, toStation) => {
  const yamanoteStations = [
    "Tokyo", "Yurakucho", "Shimbashi", "Hamamatsucho", "Tamachi",
    "Takanawa Gateway", "Shinagawa", "Osaki", "Gotanda", "Meguro",
    "Ebisu", "Shibuya", "Harajuku", "Yoyogi", "Shinjuku",
    "Shin-Okubo", "Takadanobaba", "Mejiro", "Ikebukuro", "Otsuka",
    "Sugamo", "Komagome", "Tabata", "Nishi-Nippori", "Nippori",
    "Uguisudani", "Ueno", "Okachimachi", "Akihabara", "Kanda"
  ];
  const fromIndex = yamanoteStations.indexOf(fromStation);
  const toIndex = yamanoteStations.indexOf(toStation);

  if (fromIndex === -1 || toIndex === -1) return "山手線の駅ではありません。";

  const clockwiseDistance = (toIndex - fromIndex + yamanoteStations.length) % yamanoteStations.length;
  const counterClockwiseDistance = (fromIndex - toIndex + yamanoteStations.length) % yamanoteStations.length;

  return clockwiseDistance <= counterClockwiseDistance ? "外回り" : "内回り";
};

const getRoute = async ({ fromPlace, toPlace, date, time }) => {
  const url = "http://34.97.62.115:8080/otp/routers/default/plan";
  const params = {
    fromPlace,
    toPlace,
    date,
    time,
    mode: "TRANSIT,WALK",
    arriveBy: false,
  };

  try {
    const response = await axios.get(url, { params });
    const data = response.data;

    if (!data.plan?.itineraries?.length) return { error: "経路が見つかりませんでした。" };

    const itineraries = data.plan.itineraries.map((itinerary) => ({
      duration: Math.round(itinerary.duration / 60),
      legs: itinerary.legs.map((leg) => ({
        startTime: convertTimestampToDate(leg.startTime),
        endTime: convertTimestampToDate(leg.endTime),
        fromName: leg.from.name || "不明な場所",
        fromLatitude: leg.from.lat || "0.0",
        fromLongitude: leg.from.lon || "0.0",
        toName: leg.to.name || "不明な場所",
        toLatitude: leg.to.lat || "0.0",
        toLongitude: leg.to.lon || "0.0",
        distance: leg.distance.toFixed(2),
        mode: leg.mode,
        agency: leg.agencyName || null,
        route: leg.route || null,
        headsign: leg.headsign || null,
        direction:
          leg.route === "Yamanote Line" ? calculateDirection(leg.from.name, leg.to.name) : null,
        delay: leg.departureDelay ? `${Math.round(leg.departureDelay / 60)} 分遅延` : null,
        vehicleId: leg.tripId || null,
      })),
    }));

    return { itineraries };
  } catch (error) {
    console.error("APIエラー:", error.message);
    return { error: "経路検索に失敗しました。" };
  }
};

module.exports = { getRoute };