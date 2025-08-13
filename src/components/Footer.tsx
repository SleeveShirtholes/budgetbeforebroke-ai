import Button from "./Button";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-accent-200 py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <span className="text-accent-600 text-sm sm:text-base text-center sm:text-left">
            © {currentYear} BudgetBeforeBroke. All rights reserved.
          </span>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-6 items-center">
            <Button variant="text" href="/privacy">
              Privacy
            </Button>
            <Button variant="text" href="/terms">
              Terms
            </Button>
            <Button variant="text" href="/contact">
              Contact
            </Button>
          </div>
        </div>
      </div>
    </footer>
  );
}
