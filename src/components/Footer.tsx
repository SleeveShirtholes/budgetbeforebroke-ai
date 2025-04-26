import Button from "./Button";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-accent-200 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <span className="text-accent-600">
            © {currentYear} BudgetBeforeBroke. All rights reserved.
          </span>
          <div className="flex space-x-6">
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
