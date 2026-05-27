// src/data/navigation.ts
import type { ReactNode } from 'react';

import {
    ImageIcon,
    Repeat,
    Eraser,
    FileText,
    Maximize2,
    Layers,
    FlaskConical,
    UserRound,
    Braces,
    CreditCard,
    PanelsTopLeft,
    // additional icons for future categories go here
} from "lucide-react";

export interface NavItem {
    label: string;
    icon: ReactNode;
    route: string;
    description: string;
}

export interface NavCategory {
    id: string;
    label: string;
    icon: ReactNode; // icon used in the dropdown trigger button
    items: NavItem[];
}

// Categories that appear as dropdowns in the main nav.
// Order here = order in the header.
export const navCategories: NavCategory[] = [
    {
        id: "tools",
        label: "Tools",
        icon: <Layers className="h-4 w-4" />,
        items: [
            {
                label: "Diagrams",                      // new item
                icon: <PanelsTopLeft className="h-4 w-4" />,
                route: "/diagrams",
                description: "Create various diagrams",
            },
            {
                label: "Image Resizer",
                icon: <Maximize2 className="h-4 w-4" />,
                route: "/image/resizer",
                description: "Resize to exact dimensions",
            },
            {
                label: "Converter",
                icon: <Repeat className="h-4 w-4" />,
                route: "/image/converter",
                description: "Convert format or to Base64",
            },
            {
                label: "Favicons",
                icon: <ImageIcon className="h-4 w-4" />,
                route: "/image/generate-favicon",
                description: "Generate favicons for your site",
            },
            {
                label: "Remove BG",
                icon: <Eraser className="h-4 w-4" />,
                route: "/image/remove-bg",
                description: "Remove image backgrounds",
            },
            {
                label: "OCR Formatter",
                icon: <FileText className="h-4 w-4" />,
                route: "/image/ocr-doc-formatter",
                description: "Extract & format text from images",
            },
        ],
    },
    {
        id: "mock",
        label: "MOCK",
        icon: <FlaskConical className="h-4 w-4" />,
        items: [
            {
                label: "Mock Profile",
                icon: <UserRound className="h-4 w-4" />,
                route: "/mock/profile",
                description: "View mock profile page",
            },
            {
                label: "JSON Viewer",
                icon: <Braces className="h-4 w-4" />,
                route: "/mock/json-viewer",
                description: "View and format JSON data",
            },
            {
                label: "Stripe Test Customers",
                icon: <CreditCard className="h-4 w-4" />,
                route: "/mock/stripe-test-customers",
                description: "Create test Stripe customers & payment methods",
            },
        ],
    },
];

// Static links that appear as pill‑shaped buttons (About, Help).
export const staticLinks = [
    { label: "About", route: "/about" },
    { label: "Help", route: "/help" },
];