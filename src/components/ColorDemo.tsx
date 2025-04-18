export default function ColorDemo() {
    const colorShades = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900];

    return (
        <div className="min-h-screen bg-accent-50 p-8">
            <h1 className="text-4xl font-bold text-primary-800 mb-8">Color Palette</h1>

            {/* Primary Colors */}
            <div className="mb-12">
                <h2 className="text-2xl font-semibold text-primary-700 mb-4">Primary Colors</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                    {colorShades.map((shade) => (
                        <div key={`primary-${shade}`} className="flex flex-col items-center">
                            <div
                                className={`w-full h-24 rounded-lg border border-accent-300 bg-primary-${shade} mb-2`}
                            />
                            <span className="text-sm font-medium text-accent-800">primary-{shade}</span>
                            <span className="text-xs text-accent-600">bg-primary-{shade}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Secondary Colors */}
            <div className="mb-12">
                <h2 className="text-2xl font-semibold text-secondary-700 mb-4">Secondary Colors</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                    {colorShades.map((shade) => (
                        <div key={`secondary-${shade}`} className="flex flex-col items-center">
                            <div
                                className={`w-full h-24 rounded-lg border border-accent-300 bg-secondary-${shade} mb-2`}
                            />
                            <span className="text-sm font-medium text-accent-800">secondary-{shade}</span>
                            <span className="text-xs text-accent-600">bg-secondary-{shade}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Accent Colors */}
            <div className="mb-12">
                <h2 className="text-2xl font-semibold text-accent-700 mb-4">Accent Colors</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                    {colorShades.map((shade) => (
                        <div key={`accent-${shade}`} className="flex flex-col items-center">
                            <div
                                className={`w-full h-24 rounded-lg border border-accent-300 bg-accent-${shade} mb-2`}
                            />
                            <span className="text-sm font-medium text-accent-800">accent-{shade}</span>
                            <span className="text-xs text-accent-600">bg-accent-{shade}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
