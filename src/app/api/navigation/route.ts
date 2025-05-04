import fs from "fs";
import yaml from "js-yaml";
import { NextResponse } from "next/server";
import path from "path";

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), "src/data/navigation.yaml");
    const fileContents = fs.readFileSync(filePath, "utf8");
    const data = yaml.load(fileContents);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error loading navigation data:", error);
    return NextResponse.json(
      { error: "Failed to load navigation data" },
      { status: 500 },
    );
  }
}
