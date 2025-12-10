"use client"

export default function PrivacyPolicy() {
    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-16 max-w-4xl">
                <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
                <div className="prose dark:prose-invert max-w-none space-y-6 text-sm leading-relaxed">
                    <section>
                        <h2 className="text-2xl font-semibold mb-4">1. Information We Collect</h2>
                        <p className="text-muted-foreground mb-3">
                            We collect information that you provide directly to us, including:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                            <li>Account information (email, name)</li>
                            <li>Database schemas and ERD data you create</li>
                            <li>Usage data and analytics</li>
                            <li>Payment information (processed securely through Cashfree)</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">2. How We Use Your Information</h2>
                        <p className="text-muted-foreground mb-3">
                            We use the information we collect to:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                            <li>Provide, maintain, and improve our services</li>
                            <li>Process transactions and send related information</li>
                            <li>Send technical notices and support messages</li>
                            <li>Respond to your comments and questions</li>
                            <li>Monitor and analyze trends and usage</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">3. Data Storage and Security</h2>
                        <p className="text-muted-foreground">
                            We implement appropriate technical and organizational measures to protect your personal
                            information. Your data is stored securely and encrypted in transit. However, no method of
                            transmission over the Internet is 100% secure.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">4. Information Sharing</h2>
                        <p className="text-muted-foreground mb-3">
                            We do not sell your personal information. We may share your information only in the
                            following circumstances:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                            <li>With service providers who perform services on our behalf</li>
                            <li>To comply with legal obligations</li>
                            <li>To protect our rights and prevent fraud</li>
                            <li>With your consent</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">5. Cookies and Tracking</h2>
                        <p className="text-muted-foreground">
                            We use cookies and similar tracking technologies to collect usage information and improve
                            your experience. You can control cookies through your browser settings.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">6. Your Rights</h2>
                        <p className="text-muted-foreground mb-3">
                            You have the right to:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                            <li>Access your personal information</li>
                            <li>Correct inaccurate data</li>
                            <li>Request deletion of your data</li>
                            <li>Object to processing of your data</li>
                            <li>Export your data</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">7. Data Retention</h2>
                        <p className="text-muted-foreground">
                            We retain your information for as long as your account is active or as needed to provide
                            services. You may request deletion of your account at any time.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">8. Children's Privacy</h2>
                        <p className="text-muted-foreground">
                            Our Service is not intended for children under 13. We do not knowingly collect personal
                            information from children under 13.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">9. Changes to This Policy</h2>
                        <p className="text-muted-foreground">
                            We may update this Privacy Policy from time to time. We will notify you of any changes by
                            posting the new Privacy Policy on this page.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">10. Contact Us</h2>
                        <p className="text-muted-foreground">
                            If you have questions about this Privacy Policy, please contact us through our support channels.
                        </p>
                    </section>

                    <p className="text-xs text-muted-foreground mt-8">
                        Last updated: {new Date().toLocaleDateString()}
                    </p>
                </div>
            </div>
        </div>
    )
}
