import navigationJson from "./navigation.json";

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

export const navigationData: NavigationData = navigationJson;
