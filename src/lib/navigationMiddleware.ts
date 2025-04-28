import { NavigationWithReactIcons } from "@/utils/navigationLoader";
import fs from "fs";
import yaml from "js-yaml";
import path from "path";

/**
 * Load navigation data from the YAML file
 * Used in server components and server actions
 */
export function loadNavigationFromFile(): NavigationWithReactIcons {
  try {
    const filePath = path.join(process.cwd(), "src/data/navigation.yaml");
    const fileContents = fs.readFileSync(filePath, "utf8");
    const data = yaml.load(fileContents) as NavigationWithReactIcons;
    return data;
  } catch (error) {
    console.error("Error loading navigation data:", error);
    return {};
  }
}

/**
 * Example middleware or server function to get navigation data
 * Can be used in layout.tsx or page.tsx files (on the server)
 */
export async function getNavigationData(): Promise<NavigationWithReactIcons> {
  return loadNavigationFromFile();
}
