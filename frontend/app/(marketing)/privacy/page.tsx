import type { Metadata } from 'next';
import BackButton from '@/components/BackButton';

export const metadata: Metadata = {
    title: 'Privacy Policy | REstart',
    description: 'Privacy Policy describing how REstart collects and uses student data.',
};

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-white pt-24 pb-16">
            <div className="max-w-4xl mx-auto px-6">
                <BackButton />

                <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Privacy Policy</h1>
                <p className="text-gray-500 mb-10">Last updated: January 2026</p>

                <div className="prose prose-indigo max-w-none text-gray-600">
                    <section className="mb-8">
                        <h2 className="text-xl font-bold text-gray-900 mb-3">1. Overview</h2>
                        <p>
                            At REstart, we respect your privacy. This policy explains how we collect, use, and protect the personal information of students and users who utilize our Platform for engineering college discovery and prep.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-bold text-gray-900 mb-3">2. Information We Collect</h2>
                        <ul className="list-disc pl-5 space-y-2">
                            <li><strong>Account Details:</strong> Name, email address, password, class/grade, and basic academic profile (e.g., PCM stream) provided during signup.</li>
                            <li><strong>Usage Data:</strong> Pages visited, colleges saved, search queries, and interactions with prep plans to improve our recommendations.</li>
                            <li><strong>Optional Data:</strong> Exam preferences, target colleges, and mock test scores if you choose to track them.</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-bold text-gray-900 mb-3">3. How We Use Your Information</h2>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>To personalize, college recommendations, and prep schedules.</li>
                            <li>To send important alerts regarding exam deadlines, admits cards, and platform updates.</li>
                            <li>To analyze platform usage and improve user experience.</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-bold text-gray-900 mb-3">4. Cookies and Tracking</h2>
                        <p>
                            We use cookies and local storage to remember your login session and preferences (such as your saved colleges). We may also use anonymous analytics tools to understand how the site is being used.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-bold text-gray-900 mb-3">5. Data Sharing</h2>
                        <p>
                            <strong>We do NOT sell your personal data.</strong> We may share data only in the following circumstances:
                        </p>
                        <ul className="list-disc pl-5 space-y-2 mt-2">
                            <li><strong>Service Providers:</strong> Reliable third parties who help us operate the platform (hosting, email delivery, analytics), bound by strict confidentiality agreements.</li>
                            <li><strong>Legal Requirements:</strong> If required by law or to protect the rights and safety of REstart and its users.</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-bold text-gray-900 mb-3">6. Data Security</h2>
                        <p>
                            We implement commercially reasonable technical and organizational measures to secure your data. However, please be aware that no method of transmission over the internet is 100% secure.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-bold text-gray-900 mb-3">7. Data Retention</h2>
                        <p>
                            We retain your information as long as your account is active or as needed to provide you services. You may request to delete your account and associated data at any time.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-bold text-gray-900 mb-3">8. User Rights</h2>
                        <p>
                            You have the right to access, update, or delete your personal information. You can manage most settings within your account profile. For specific requests, contact our support team.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-bold text-gray-900 mb-3">9. Children's Privacy</h2>
                        <p>
                            We do not knowingly collect personal information from children under 13 without parental consent. Users under 18 should use the platform with the guidance of a parent or guardian.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-bold text-gray-900 mb-3">10. Contact Information</h2>
                        <p>
                            If you have questions about this Privacy Policy, please contact us at <a href="mailto:letsrestart.here@gmail.com" className="text-indigo-600 hover:underline">letsrestart.here@gmail.com</a>.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
