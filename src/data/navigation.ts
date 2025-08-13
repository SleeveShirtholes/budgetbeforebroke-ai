import fs from "fs";
import yaml from "js-yaml";
import path from "path";

const navigationYaml = yaml.load(
  fs.readFileSync(path.join(__dirname, "navigation.yaml"), "utf8"),
);

export interface NavItem {
  label: string;
  href: string;
  icon: string;
  description: string;
}

export interface NavDropdown {
  label: string;
  items: NavItem[];
}

export type NavigationData = Record<string, NavDropdown>;

export const navigationData: NavigationData = navigationYaml as NavigationData;
