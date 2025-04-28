import {
    ArrowPathIcon,
    Bars4Icon,
    ChartBarIcon,
    ChartBarSquareIcon,
    CheckCircleIcon,
    PlusIcon,
    PresentationChartLineIcon,
    TagIcon,
} from "@heroicons/react/24/outline";
import React, { ReactNode } from "react";

import rawNavigationData from "../data/navigation.json";

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

const iconComponents: { [key: string]: typeof ChartBarSquareIcon } = {
    BARS4: Bars4Icon,
    PLUS: PlusIcon,
    ARROW_PATH: ArrowPathIcon,
    CHART_BAR: ChartBarIcon,
    TAG: TagIcon,
    CHECK_CIRCLE: CheckCircleIcon,
    PRESENTATION_CHART_LINE: PresentationChartLineIcon,
    CHART_BAR_SQUARE: ChartBarSquareIcon,
};

function getIconComponent(iconName: string): ReactNode {
    const IconComponent = iconComponents[iconName];
    if (!IconComponent) {
        console.warn(`Icon not found: ${iconName}`);
        return <ChartBarSquareIcon className="w-5 h-5" />; // Default icon
    }
    return <IconComponent className="w-5 h-5" />;
}

// Convert the navigation data into a format with React icon components
export const navigationData: NavigationWithReactIcons = Object.entries(rawNavigationData).reduce(
    (acc, [key, dropdown]: [string, NavDropdown]) => {
        acc[key] = {
            label: dropdown.label,
            items: dropdown.items.map((item) => ({
                ...item,
                icon: getIconComponent(item.icon),
            })),
        };
        return acc;
    },
    {} as NavigationWithReactIcons
);
