import {
  NavDropdown,
  NavItem,
  NavigationData,
  NavigationWithReactIcons,
} from "@/utils/navigationLoader";

import fs from "fs";
import yaml from "js-yaml";
import path from "path";

/**
 * Load raw navigation data from the YAML file
 * Used in server components and server actions
 */
export function loadNavigationFromFile(): NavigationData {
  try {
    const filePath = path.join(process.cwd(), "src/data/navigation.yaml");
    const fileContents = fs.readFileSync(filePath, "utf8");
    const data = yaml.load(fileContents) as NavigationData;
    return data;
  } catch (error) {
    console.error("Error loading navigation data:", error);
    return {};
  }
}

/**
 * Get navigation data with React icons
 * Can be used in layout.tsx or page.tsx files (on the server)
 */
export async function getServerNavigationData(): Promise<NavigationWithReactIcons> {
  const rawData = loadNavigationFromFile();
  // Note: This is a simplified version since we don't have access to React components on the server
  // The actual icon components will be added on the client side
  return Object.entries(rawData).reduce(
    (acc, [key, dropdown]: [string, NavDropdown]) => {
      acc[key] = {
        label: dropdown.label,
        items: dropdown.items.map((item: NavItem) => ({
          ...item,
          icon: null, // Icons will be added on the client side
        })),
      };
      return acc;
    },
    {} as NavigationWithReactIcons,
  );
}
