import Button from "./Button";

export default function CTA() {
  return (
    <div className="py-12 sm:py-16 bg-primary-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-primary-800 mb-3 sm:mb-4">
          Ready to take control of your finances?
        </h2>
        <p className="text-base sm:text-lg lg:text-xl text-accent-700 mb-6 sm:mb-8 max-w-2xl mx-auto">
          Join thousands of users who are already budgeting smarter.
        </p>
        <Button
          variant="primary"
          size="lg"
          href="/auth/signup"
          className="w-full sm:w-auto"
        >
          Start For Free
        </Button>
      </div>
    </div>
  );
}
