import * as OutlineIcons from "@heroicons/react/24/outline";

import { ReactNode } from "react";

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

export interface NavItemWithReactIcon {
  label: string;
  href: string;
  icon: ReactNode;
  description: string;
}

export interface NavDropdownWithReactIcon {
  label: string;
  items: NavItemWithReactIcon[];
}

export type NavigationWithReactIcons = Record<string, NavDropdownWithReactIcon>;
export type NavigationData = Record<string, NavDropdown>;

function getIconComponent(iconName: string): ReactNode {
  const IconComponent = (
    OutlineIcons as Record<string, React.ComponentType<{ className?: string }>>
  )[iconName];
  if (!IconComponent) {
    console.warn(`Icon not found: ${iconName}`);
    return <OutlineIcons.ChartBarSquareIcon className="w-5 h-5" />; // Default icon
  }
  return <IconComponent className="w-5 h-5" />;
}

export async function getNavigationData(): Promise<NavigationWithReactIcons> {
  const response = await fetch("/api/navigation");
  if (!response.ok) {
    throw new Error("Failed to fetch navigation data");
  }
  const rawNavigationData = (await response.json()) as NavigationData;

  return Object.entries(rawNavigationData).reduce((acc, [key, dropdown]) => {
    acc[key] = {
      label: dropdown.label,
      items: dropdown.items.map((item) => ({
        ...item,
        icon: getIconComponent(item.icon),
      })),
    };
    return acc;
  }, {} as NavigationWithReactIcons);
}
