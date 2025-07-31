import Button from "./Button";

export default function Hero() {
  return (
    <div className="pt-20 sm:pt-24 pb-12 sm:pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-primary-600 mb-4 sm:mb-6">
            Budget first,
            <span className="text-secondary-400 block sm:inline">
              <br className="hidden sm:block" />
              panic never
            </span>
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-accent-700 max-w-2xl mx-auto mb-6 sm:mb-8 px-4 sm:px-0">
            Take control of your finances with intuitive budgeting tools. Create
            budgets, track spending, and manage debt with our easy-to-use
            platform.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 px-4 sm:px-0">
            <Button variant="primary" size="lg" href="/signup" fullWidth className="sm:w-auto">
              Get Started Free
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
