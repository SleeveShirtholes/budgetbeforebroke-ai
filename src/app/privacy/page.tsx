import Footer from "@/components/Footer";
import Navigation from "@/components/Navigation";
import Card from "@/components/Card";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen">
      <Navigation />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-secondary-900 mb-4">
              Privacy Policy
            </h1>
            <p className="text-lg text-secondary-600">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>

          <Card>
            <div className="prose prose-secondary max-w-none">
              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-secondary-900 mb-4">
                  Introduction
                </h2>
                <p className="text-secondary-700 mb-4">
                  Welcome to Budget Before Broke. We respect your privacy and are
                  committed to protecting your personal data. This privacy policy
                  explains how we collect, use, and protect your information when you
                  use our budgeting and financial management services.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-secondary-900 mb-4">
                  Information We Collect
                </h2>
                <h3 className="text-lg font-medium text-secondary-800 mb-3">
                  Personal Information
                </h3>
                <ul className="list-disc pl-6 text-secondary-700 mb-4 space-y-1">
                  <li>Name and email address</li>
                  <li>Phone number (if provided)</li>
                  <li>Profile information you choose to provide</li>
                </ul>
                
                <h3 className="text-lg font-medium text-secondary-800 mb-3">
                  Financial Information
                </h3>
                <ul className="list-disc pl-6 text-secondary-700 mb-4 space-y-1">
                  <li>Bank account information (through secure third-party connections)</li>
                  <li>Transaction data</li>
                  <li>Budget categories and spending patterns</li>
                  <li>Financial goals and preferences</li>
                </ul>

                <h3 className="text-lg font-medium text-secondary-800 mb-3">
                  Usage Information
                </h3>
                <ul className="list-disc pl-6 text-secondary-700 mb-4 space-y-1">
                  <li>Device information and IP address</li>
                  <li>Browser type and version</li>
                  <li>Pages visited and features used</li>
                  <li>Time spent on our platform</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-secondary-900 mb-4">
                  How We Use Your Information
                </h2>
                <ul className="list-disc pl-6 text-secondary-700 space-y-2">
                  <li>Provide and improve our budgeting services</li>
                  <li>Analyze your spending patterns and provide insights</li>
                  <li>Send you account updates and important notifications</li>
                  <li>Provide customer support</li>
                  <li>Comply with legal obligations</li>
                  <li>Prevent fraud and ensure platform security</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-secondary-900 mb-4">
                  Information Sharing and Disclosure
                </h2>
                <p className="text-secondary-700 mb-4">
                  We do not sell, trade, or otherwise transfer your personal information
                  to third parties except in the following circumstances:
                </p>
                <ul className="list-disc pl-6 text-secondary-700 space-y-2">
                  <li>With your explicit consent</li>
                  <li>To comply with legal requirements or court orders</li>
                  <li>To protect our rights, property, or safety</li>
                  <li>With trusted service providers who assist in our operations (under strict confidentiality agreements)</li>
                  <li>In connection with a business transfer or merger</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-secondary-900 mb-4">
                  Data Security
                </h2>
                <p className="text-secondary-700 mb-4">
                  We implement industry-standard security measures to protect your
                  personal and financial information:
                </p>
                <ul className="list-disc pl-6 text-secondary-700 space-y-2">
                  <li>SSL/TLS encryption for data transmission</li>
                  <li>Secure database storage with encryption at rest</li>
                  <li>Regular security audits and monitoring</li>
                  <li>Limited access controls and employee training</li>
                  <li>Partnership with bank-level security providers</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-secondary-900 mb-4">
                  Your Rights
                </h2>
                <p className="text-secondary-700 mb-4">
                  You have the following rights regarding your personal data:
                </p>
                <ul className="list-disc pl-6 text-secondary-700 space-y-2">
                  <li>Access your personal information</li>
                  <li>Correct inaccurate or incomplete data</li>
                  <li>Delete your account and associated data</li>
                  <li>Export your data in a portable format</li>
                  <li>Opt out of marketing communications</li>
                  <li>Withdraw consent (where applicable)</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-secondary-900 mb-4">
                  Cookies and Tracking
                </h2>
                <p className="text-secondary-700 mb-4">
                  We use cookies and similar technologies to enhance your experience
                  and analyze usage patterns. You can control cookie settings through
                  your browser preferences or our cookie consent banner.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-secondary-900 mb-4">
                  Third-Party Services
                </h2>
                <p className="text-secondary-700 mb-4">
                  Our platform integrates with trusted third-party services for
                  banking connections and payments. These services have their own
                  privacy policies, and we encourage you to review them.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-secondary-900 mb-4">
                  Changes to This Policy
                </h2>
                <p className="text-secondary-700 mb-4">
                  We may update this privacy policy from time to time. We will notify
                  you of any significant changes by email or through our platform.
                  Your continued use of our services constitutes acceptance of the
                  updated policy.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-secondary-900 mb-4">
                  Contact Us
                </h2>
                <p className="text-secondary-700 mb-4">
                  If you have any questions about this privacy policy or our data
                  practices, please contact us:
                </p>
                <div className="bg-accent-50 p-4 rounded-lg">
                  <p className="text-secondary-700">
                    <strong>Email:</strong> privacy@budgetbeforebroke.com
                  </p>
                  <p className="text-secondary-700">
                    <strong>Address:</strong> Budget Before Broke, Privacy Team<br />
                    [Your Company Address]
                  </p>
                </div>
              </section>
            </div>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
}