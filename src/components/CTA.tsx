import Button from "./Button";

export default function CTA() {
  return (
    <div className="py-16 bg-primary-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl font-bold text-primary-800 mb-4">
          Ready to take control of your finances?
        </h2>
        <p className="text-xl text-accent-700 mb-8">
          Join thousands of users who are already budgeting smarter.
        </p>
        <Button variant="primary" size="lg" href="/signup">
          Start Your Free Trial
        </Button>
      </div>
    </div>
  );
}
