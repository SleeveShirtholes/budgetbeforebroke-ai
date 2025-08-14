import Button from "./Button";

export default function Hero() {
  return (
    <div className="pt-24 sm:pt-32 md:pt-40 pb-8 sm:pb-12 md:pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-primary-600 mb-3 sm:mb-4 md:mb-6 leading-tight">
            <span className="block">Budget First,</span>
            <span className="text-secondary-400 block mt-1 sm:mt-0">
              Panic Never
            </span>
          </h1>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-accent-700 max-w-2xl mx-auto mb-4 sm:mb-6 md:mb-8 px-2 sm:px-0 leading-relaxed">
            Take control of your finances with intuitive budgeting tools. Create
            budgets, track spending, and manage debt with our easy-to-use
            platform.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 px-4 sm:px-0">
            <Button
              variant="primary"
              size="lg"
              href="/auth/signup"
              fullWidth
              className="sm:w-auto"
            >
              Get Started Free
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
