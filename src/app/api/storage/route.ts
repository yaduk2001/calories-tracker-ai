import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const DATA_FILE = path.join(process.cwd(), "data.json");

// Helper to read the file safely
async function readData() {
  try {
    const content = await fs.readFile(DATA_FILE, "utf-8");
    return JSON.parse(content);
  } catch (e: any) {
    if (e.code === "ENOENT") {
      return {}; // File doesn't exist yet, return empty object
    }
    console.error("Error reading data.json:", e);
    return {};
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const key = searchParams.get("key");

  const data = await readData();
  if (key) {
    return NextResponse.json({ value: data[key] || null });
  }
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  try {
    const { key, value } = await req.json();
    if (!key) return NextResponse.json({ error: "No key provided" }, { status: 400 });

    const data = await readData();
    data[key] = value;

    await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
    return NextResponse.json({ success: true });
  } catch (e: any) {
    console.error("Error writing data.json:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
