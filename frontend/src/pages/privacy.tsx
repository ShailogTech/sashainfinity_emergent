import React from 'react';
import PageHeader from '@/components/public/PageHeader';

const breadcrumbs = [
  { name: 'Home', path: '/' },
  { name: 'Privacy Policy', path: '/privacy' },
];

export function PrivacyPage() {
  return (
    <>
      <PageHeader title="Privacy Policy" breadcrumbs={breadcrumbs} />
      <div className="container-custom py-16">
        <div className="max-w-4xl mx-auto prose prose-lg">
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-3xl font-bold mb-6 text-neutral-900">Privacy Policy</h2>
            <p className="text-neutral-600 mb-6">
              Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>

            <p className="mb-6 text-neutral-700">
              At SashaInfinity, we are committed to protecting your privacy and ensuring the security of your
              personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your
              information when you use our platform.
            </p>

            <section className="mb-8">
              <h3 className="text-2xl font-semibold mb-4 text-neutral-800">1. Information We Collect</h3>

              <h4 className="text-xl font-semibold mb-3 text-neutral-700">Personal Information</h4>
              <p className="mb-4 text-neutral-700">
                We collect information that you provide directly to us, including:
              </p>
              <ul className="list-disc pl-6 mb-4 text-neutral-700 space-y-2">
                <li>Name, email address, and contact information</li>
                <li>Username and password</li>
                <li>Profile photo and bio</li>
                <li>Payment and billing information</li>
                <li>Educational background and preferences</li>
                <li>Course enrollment and progress data</li>
              </ul>

              <h4 className="text-xl font-semibold mb-3 text-neutral-700">Automatically Collected Information</h4>
              <p className="mb-4 text-neutral-700">
                When you use our platform, we automatically collect:
              </p>
              <ul className="list-disc pl-6 mb-4 text-neutral-700 space-y-2">
                <li>Device information (IP address, browser type, operating system)</li>
                <li>Usage data (pages viewed, time spent, courses accessed)</li>
                <li>Cookies and similar tracking technologies</li>
                <li>Location data (approximate location based on IP address)</li>
              </ul>
            </section>

            <section className="mb-8">
              <h3 className="text-2xl font-semibold mb-4 text-neutral-800">2. How We Use Your Information</h3>
              <p className="mb-4 text-neutral-700">
                We use the information we collect to:
              </p>
              <ul className="list-disc pl-6 mb-4 text-neutral-700 space-y-2">
                <li>Provide, maintain, and improve our services</li>
                <li>Process your course enrollments and payments</li>
                <li>Send you course updates, certificates, and important notifications</li>
                <li>Personalize your learning experience and recommend relevant courses</li>
                <li>Respond to your comments, questions, and support requests</li>
                <li>Monitor and analyze usage patterns and trends</li>
                <li>Detect, prevent, and address technical issues and fraudulent activity</li>
                <li>Send marketing communications (with your consent)</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            <section className="mb-8">
              <h3 className="text-2xl font-semibold mb-4 text-neutral-800">3. Information Sharing and Disclosure</h3>
              <p className="mb-4 text-neutral-700">
                We may share your information in the following circumstances:
              </p>

              <h4 className="text-xl font-semibold mb-3 text-neutral-700">With Instructors</h4>
              <p className="mb-4 text-neutral-700">
                When you enroll in a course, we share your name and email with the instructor to facilitate
                communication and support.
              </p>

              <h4 className="text-xl font-semibold mb-3 text-neutral-700">With Service Providers</h4>
              <p className="mb-4 text-neutral-700">
                We use third-party service providers for:
              </p>
              <ul className="list-disc pl-6 mb-4 text-neutral-700 space-y-2">
                <li>Payment processing (payment gateways)</li>
                <li>Email delivery and communications</li>
                <li>Cloud hosting and storage</li>
                <li>Analytics and performance monitoring</li>
                <li>Customer support tools</li>
              </ul>

              <h4 className="text-xl font-semibold mb-3 text-neutral-700">For Legal Reasons</h4>
              <p className="mb-4 text-neutral-700">
                We may disclose your information if required by law or in response to:
              </p>
              <ul className="list-disc pl-6 mb-4 text-neutral-700 space-y-2">
                <li>Legal processes (court orders, subpoenas)</li>
                <li>Government or law enforcement requests</li>
                <li>Protection of our rights, property, or safety</li>
                <li>Investigation of fraud or security issues</li>
              </ul>
            </section>

            <section className="mb-8">
              <h3 className="text-2xl font-semibold mb-4 text-neutral-800">4. Data Security</h3>
              <p className="mb-4 text-neutral-700">
                We implement appropriate security measures to protect your personal information:
              </p>
              <ul className="list-disc pl-6 mb-4 text-neutral-700 space-y-2">
                <li>Encryption of data in transit and at rest</li>
                <li>Secure server infrastructure with regular security audits</li>
                <li>Access controls and authentication mechanisms</li>
                <li>Regular backups and disaster recovery procedures</li>
                <li>Employee training on data protection practices</li>
              </ul>
              <p className="mb-4 text-neutral-700">
                However, no method of transmission over the internet is 100% secure. While we strive to protect your
                information, we cannot guarantee absolute security.
              </p>
            </section>

            <section className="mb-8">
              <h3 className="text-2xl font-semibold mb-4 text-neutral-800">5. Cookies and Tracking Technologies</h3>
              <p className="mb-4 text-neutral-700">
                We use cookies and similar technologies to:
              </p>
              <ul className="list-disc pl-6 mb-4 text-neutral-700 space-y-2">
                <li>Remember your preferences and settings</li>
                <li>Keep you logged in to your account</li>
                <li>Analyze how you use our platform</li>
                <li>Deliver personalized content and advertisements</li>
                <li>Measure the effectiveness of our marketing campaigns</li>
              </ul>
              <p className="mb-4 text-neutral-700">
                You can control cookies through your browser settings. However, disabling cookies may affect your
                ability to use certain features of our platform.
              </p>
            </section>

            <section className="mb-8">
              <h3 className="text-2xl font-semibold mb-4 text-neutral-800">6. Your Data Rights</h3>
              <p className="mb-4 text-neutral-700">
                You have the following rights regarding your personal information:
              </p>
              <ul className="list-disc pl-6 mb-4 text-neutral-700 space-y-2">
                <li><strong>Access:</strong> Request a copy of the personal data we hold about you</li>
                <li><strong>Correction:</strong> Update or correct inaccurate information in your account settings</li>
                <li><strong>Deletion:</strong> Request deletion of your account and associated data</li>
                <li><strong>Portability:</strong> Request a copy of your data in a machine-readable format</li>
                <li><strong>Opt-out:</strong> Unsubscribe from marketing communications at any time</li>
                <li><strong>Restriction:</strong> Request restriction of processing in certain circumstances</li>
              </ul>
              <p className="mb-4 text-neutral-700">
                To exercise any of these rights, please contact us at{' '}
                <a href="mailto:privacy@sashainfinity.com" className="text-primary-600 hover:text-primary-700">
                  privacy@sashainfinity.com
                </a>
              </p>
            </section>

            <section className="mb-8">
              <h3 className="text-2xl font-semibold mb-4 text-neutral-800">7. Data Retention</h3>
              <p className="mb-4 text-neutral-700">
                We retain your personal information for as long as necessary to:
              </p>
              <ul className="list-disc pl-6 mb-4 text-neutral-700 space-y-2">
                <li>Provide our services and maintain your account</li>
                <li>Comply with legal obligations and resolve disputes</li>
                <li>Enforce our agreements and protect our rights</li>
              </ul>
              <p className="mb-4 text-neutral-700">
                When you delete your account, we will delete or anonymize your personal information, except where we
                are required to retain it for legal or legitimate business purposes.
              </p>
            </section>

            <section className="mb-8">
              <h3 className="text-2xl font-semibold mb-4 text-neutral-800">8. Children's Privacy</h3>
              <p className="mb-4 text-neutral-700">
                Our services are not intended for children under 13 years of age. We do not knowingly collect personal
                information from children under 13. If you are a parent or guardian and believe your child has provided
                us with personal information, please contact us so we can delete it.
              </p>
            </section>

            <section className="mb-8">
              <h3 className="text-2xl font-semibold mb-4 text-neutral-800">9. International Data Transfers</h3>
              <p className="mb-4 text-neutral-700">
                Your information may be transferred to and processed in countries other than India. We ensure that
                appropriate safeguards are in place to protect your data in accordance with this Privacy Policy.
              </p>
            </section>

            <section className="mb-8">
              <h3 className="text-2xl font-semibold mb-4 text-neutral-800">10. Changes to This Privacy Policy</h3>
              <p className="mb-4 text-neutral-700">
                We may update this Privacy Policy from time to time. We will notify you of significant changes via
                email or through a notice on our platform. We encourage you to review this policy periodically.
              </p>
            </section>

            <section className="mb-8">
              <h3 className="text-2xl font-semibold mb-4 text-neutral-800">11. Contact Us</h3>
              <p className="mb-4 text-neutral-700">
                If you have any questions or concerns about this Privacy Policy or our data practices, please contact us:
              </p>
              <div className="bg-neutral-50 p-6 rounded-lg">
                <p className="mb-2 text-neutral-700">
                  <strong>Email:</strong>{' '}
                  <a href="mailto:privacy@sashainfinity.com" className="text-primary-600 hover:text-primary-700">
                    privacy@sashainfinity.com
                  </a>
                </p>
                <p className="mb-2 text-neutral-700">
                  <strong>Support:</strong>{' '}
                  <a href="mailto:support@sashainfinity.com" className="text-primary-600 hover:text-primary-700">
                    support@sashainfinity.com
                  </a>
                </p>
                <p className="mb-2 text-neutral-700">
                  <strong>Phone:</strong> +91 8438740893
                </p>
                <p className="text-neutral-700">
                  <strong>Address:</strong> Ward 1, Uthayapuri Colony, Narasothipatti, Salem, Tamil Nadu 636004
                </p>
              </div>
            </section>

            <div className="mt-8 p-4 bg-primary-50 border-l-4 border-primary-600 rounded">
              <p className="text-sm text-neutral-700">
                By using SashaInfinity, you acknowledge that you have read and understood this Privacy Policy and
                consent to the collection, use, and disclosure of your information as described herein.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
