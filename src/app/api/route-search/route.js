import { NextResponse } from "next/server";
import { getRoute } from "../otp/otp_route";

export async function POST(request) {
    try {
      const body = await request.json();
      console.log("リクエストデータ:", body); // ここでデータを確認
      const result = await getRoute(body);
      return NextResponse.json(result);
    } catch (error) {
      console.error("APIエラー:", error);
      return NextResponse.json({ error: "経路検索に失敗しました。" }, { status: 500 });
    }
  }