import type { Metadata } from 'next';
import BackButton from '@/components/BackButton';

export const metadata: Metadata = {
    title: 'Terms of Service | REstart',
    description: 'Terms of Service for using the REstart platform.',
};

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-white pt-24 pb-16">
            <div className="max-w-4xl mx-auto px-6">
                <BackButton />

                <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Terms of Service</h1>
                <p className="text-gray-500 mb-10">Last updated: January 2026</p>

                <div className="prose prose-indigo max-w-none text-gray-600">
                    <section className="mb-8">
                        <h2 className="text-xl font-bold text-gray-900 mb-3">1. Acceptance of Terms</h2>
                        <p>
                            By accessing or using the REstart web application ("Platform"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our Platform.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-bold text-gray-900 mb-3">2. Eligibility</h2>
                        <p>
                            The Platform is designed for students, parents, and educators. Users under the age of 18 should use the Platform with the consent and supervision of a parent or legal guardian.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-bold text-gray-900 mb-3">3. Description of Service</h2>
                        <p>
                            REstart provides educational tools, including engineering college discovery, exam timelines, and PCM preparation structure.
                            <strong> Disclaimer:</strong> We do not guarantee admission to any college, specific exam results, or seat allotments. The information provided is for guidance purposes only and is subject to change.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-bold text-gray-900 mb-3">4. User Accounts</h2>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>You agree to provide accurate and complete information during registration.</li>
                            <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
                            <li>Notify us immediately of any unauthorized use of your account.</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-bold text-gray-900 mb-3">5. Use of Platform</h2>
                        <p>
                            You agree not to misuse the Platform. Prohibited actions include scraping data, reverse engineering the code, using the service for unauthorized commercial purposes, or engaging in any activity that disrupts the service.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-bold text-gray-900 mb-3">6. Content and Data Accuracy</h2>
                        <p>
                            We strive to provide accurate data regarding colleges and exams. However, this information is sourced from publicly available records and may change. Users are strongly advised to verify critical details (such as fees, dates, and eligibility) on official college or exam websites.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-bold text-gray-900 mb-3">7. Limitation of Liability</h2>
                        <p>
                            REstart shall not be liable for any indirect, incidental, or consequential damages resulting from the use of the Platform, including but not limited to missed deadlines, admissions outcomes, or reliance on provided information.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-bold text-gray-900 mb-3">8. Third-Party Links</h2>
                        <p>
                            The Platform may contain links to third-party websites (e.g., college admission portals, payment gateways). We are not responsible for the content or practices of these external sites.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-bold text-gray-900 mb-3">9. Changes to Terms</h2>
                        <p>
                            We reserve the right to modify these terms at any time. Significant changes will be communicated through the Platform. Continued use after changes constitutes acceptance of the new terms.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-bold text-gray-900 mb-3">10. Contact Information</h2>
                        <p>
                            For any questions regarding these Terms, please contact us at <a href="mailto:letsrestart.here@gmail.com" className="text-indigo-600 hover:underline">letsrestart.here@gmail.com</a>.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
