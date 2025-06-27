import Button from "./Button";

export default function Hero() {
  return (
    <div className="pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-primary-600 mb-6">
            Budget first,
            <span className="text-secondary-400 md:text-5xl">
              <br />
              panic never
            </span>
          </h1>
          <p className="text-xl text-accent-700 max-w-2xl mx-auto mb-8">
            Take control of your finances with intuitive budgeting tools. Create
            budgets, track spending, and manage debt with our easy-to-use
            platform.
          </p>
          <div className="flex justify-center space-x-4">
            <Button variant="primary" size="lg" href="/signup">
              Get Started Free
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
