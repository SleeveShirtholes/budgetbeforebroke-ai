import { ReactNode } from "react";

interface FeatureCardProps {
    icon: ReactNode;
    title: string;
    description: string;
    hoverBorderColor?: string;
}

export default function FeatureCard({ icon, title, description, hoverBorderColor = "primary" }: FeatureCardProps) {
    return (
        <div
            className={`bg-accent-50 p-8 rounded-xl border border-accent-200 hover:border-${hoverBorderColor}-200 hover:shadow-lg transition-all duration-200`}
        >
            <div className={`w-12 h-12 bg-${hoverBorderColor}-100 rounded-lg flex items-center justify-center mb-4`}>
                {icon}
            </div>
            <h3 className="text-xl font-semibold text-primary-800 mb-2">{title}</h3>
            <p className="text-accent-700">{description}</p>
        </div>
    );
}
