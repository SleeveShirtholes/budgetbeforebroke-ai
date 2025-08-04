import Footer from "@/components/Footer";
import Navigation from "@/components/Navigation";
import Card from "@/components/Card";

export default function TermsPage() {
  return (
    <div className="min-h-screen">
      <Navigation />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-secondary-900 mb-4">
              Terms and Conditions
            </h1>
            <p className="text-lg text-secondary-600">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>

          <Card>
            <div className="prose prose-secondary max-w-none">
              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-secondary-900 mb-4">
                  Agreement to Terms
                </h2>
                <p className="text-secondary-700 mb-4">
                  By accessing and using Budget Before Broke, you accept and agree to
                  be bound by the terms and provision of this agreement. If you do not
                  agree to abide by the above, please do not use this service.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-secondary-900 mb-4">
                  Description of Service
                </h2>
                <p className="text-secondary-700 mb-4">
                  Budget Before Broke is a personal financial management platform that
                  helps users track expenses, create budgets, and achieve their
                  financial goals. Our service includes:
                </p>
                <ul className="list-disc pl-6 text-secondary-700 space-y-2">
                  <li>Expense tracking and categorization</li>
                  <li>Budget creation and monitoring</li>
                  <li>Financial insights and analytics</li>
                  <li>Goal setting and progress tracking</li>
                  <li>Bank account integration (through third-party providers)</li>
                  <li>Financial education resources</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-secondary-900 mb-4">
                  User Accounts and Responsibilities
                </h2>
                <h3 className="text-lg font-medium text-secondary-800 mb-3">
                  Account Creation
                </h3>
                <ul className="list-disc pl-6 text-secondary-700 mb-4 space-y-1">
                  <li>You must provide accurate and complete information</li>
                  <li>You are responsible for maintaining account security</li>
                  <li>You must be at least 18 years old to create an account</li>
                  <li>One account per person is permitted</li>
                </ul>

                <h3 className="text-lg font-medium text-secondary-800 mb-3">
                  Account Security
                </h3>
                <ul className="list-disc pl-6 text-secondary-700 mb-4 space-y-1">
                  <li>Keep your password confidential and secure</li>
                  <li>Notify us immediately of any unauthorized access</li>
                  <li>You are responsible for all activities under your account</li>
                  <li>Use strong passwords and enable two-factor authentication when available</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-secondary-900 mb-4">
                  Acceptable Use Policy
                </h2>
                <p className="text-secondary-700 mb-4">
                  You agree not to use our service for any of the following purposes:
                </p>
                <ul className="list-disc pl-6 text-secondary-700 space-y-2">
                  <li>Any unlawful purpose or activity</li>
                  <li>Harassing, abusing, or harming others</li>
                  <li>Violating intellectual property rights</li>
                  <li>Distributing spam or malicious content</li>
                  <li>Attempting to gain unauthorized access to our systems</li>
                  <li>Interfering with the proper functioning of our service</li>
                  <li>Creating multiple accounts to circumvent limitations</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-secondary-900 mb-4">
                  Financial Information and Disclaimers
                </h2>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                  <p className="text-yellow-800 font-medium">
                    Important: Budget Before Broke is a financial management tool, not a financial advisor.
                  </p>
                </div>
                <ul className="list-disc pl-6 text-secondary-700 space-y-2">
                  <li>We do not provide financial, investment, or tax advice</li>
                  <li>Our insights and recommendations are for informational purposes only</li>
                  <li>You should consult with qualified financial professionals for specific advice</li>
                  <li>We are not responsible for financial decisions made based on our platform</li>
                  <li>Past performance does not guarantee future results</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-secondary-900 mb-4">
                  Data Accuracy and Responsibility
                </h2>
                <p className="text-secondary-700 mb-4">
                  While we strive to provide accurate financial data through our
                  third-party integrations:
                </p>
                <ul className="list-disc pl-6 text-secondary-700 space-y-2">
                  <li>You are responsible for verifying the accuracy of your financial data</li>
                  <li>We recommend regularly reviewing your account information</li>
                  <li>Report any discrepancies immediately</li>
                  <li>We are not liable for decisions based on inaccurate data</li>
                  <li>Always refer to your official bank statements for definitive information</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-secondary-900 mb-4">
                  Subscription and Payment Terms
                </h2>
                <h3 className="text-lg font-medium text-secondary-800 mb-3">
                  Free and Paid Services
                </h3>
                <ul className="list-disc pl-6 text-secondary-700 mb-4 space-y-1">
                  <li>Basic features are available for free</li>
                  <li>Premium features require a paid subscription</li>
                  <li>Pricing is subject to change with notice</li>
                  <li>Subscriptions automatically renew unless cancelled</li>
                </ul>

                <h3 className="text-lg font-medium text-secondary-800 mb-3">
                  Cancellation and Refunds
                </h3>
                <ul className="list-disc pl-6 text-secondary-700 mb-4 space-y-1">
                  <li>You may cancel your subscription at any time</li>
                  <li>Cancellation takes effect at the end of the current billing period</li>
                  <li>Refunds are provided according to our refund policy</li>
                  <li>No refunds for partial months of service</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-secondary-900 mb-4">
                  Intellectual Property
                </h2>
                <p className="text-secondary-700 mb-4">
                  The Budget Before Broke platform, including all content, features,
                  and functionality, is owned by us and protected by copyright,
                  trademark, and other intellectual property laws.
                </p>
                <ul className="list-disc pl-6 text-secondary-700 space-y-2">
                  <li>You may not copy, modify, or distribute our content</li>
                  <li>You retain ownership of your personal financial data</li>
                  <li>You grant us license to use your data to provide our services</li>
                  <li>Feedback and suggestions may be used without compensation</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-secondary-900 mb-4">
                  Limitation of Liability
                </h2>
                <p className="text-secondary-700 mb-4">
                  To the maximum extent permitted by law:
                </p>
                <ul className="list-disc pl-6 text-secondary-700 space-y-2">
                  <li>We provide our service &quot;as is&quot; without warranties</li>
                  <li>We are not liable for indirect or consequential damages</li>
                  <li>Our total liability is limited to the amount you paid us</li>
                  <li>We are not responsible for third-party service failures</li>
                  <li>Some jurisdictions do not allow these limitations</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-secondary-900 mb-4">
                  Termination
                </h2>
                <p className="text-secondary-700 mb-4">
                  We may terminate or suspend your account immediately, without prior
                  notice, for conduct that we believe violates these terms or is
                  harmful to other users, us, or third parties.
                </p>
                <p className="text-secondary-700 mb-4">
                  Upon termination, your right to use the service will cease
                  immediately. You may delete your account at any time by contacting
                  customer support.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-secondary-900 mb-4">
                  Changes to Terms
                </h2>
                <p className="text-secondary-700 mb-4">
                  We reserve the right to modify these terms at any time. We will
                  notify users of any material changes via email or through our
                  platform. Your continued use of the service constitutes acceptance
                  of the revised terms.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-secondary-900 mb-4">
                  Governing Law
                </h2>
                <p className="text-secondary-700 mb-4">
                  These terms are governed by and construed in accordance with the
                  laws of [Your Jurisdiction], and you irrevocably submit to the
                  exclusive jurisdiction of the courts in that state or location.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-secondary-900 mb-4">
                  Contact Information
                </h2>
                <p className="text-secondary-700 mb-4">
                  If you have any questions about these Terms and Conditions, please
                  contact us:
                </p>
                <div className="bg-accent-50 p-4 rounded-lg">
                  <p className="text-secondary-700">
                    <strong>Email:</strong> legal@budgetbeforebroke.com
                  </p>
                  <p className="text-secondary-700">
                    <strong>Address:</strong> Budget Before Broke, Legal Department<br />
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