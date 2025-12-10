"use client"

export default function TermsOfService() {
    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-16 max-w-4xl">
                <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
                <div className="prose dark:prose-invert max-w-none space-y-6 text-sm leading-relaxed">
                    <section>
                        <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
                        <p className="text-muted-foreground">
                            By accessing and using SCHEMAX ("the Service"), you agree to be bound by these Terms of Service.
                            If you do not agree to these terms, please do not use the Service.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">2. Service Description</h2>
                        <p className="text-muted-foreground">
                            SCHEMAX provides AI-powered database schema generation and management tools.
                            The Service is provided "as is" and we reserve the right to modify, suspend, or discontinue
                            any part of the Service at any time.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">3. Payment & Refund Policy</h2>
                        <p className="text-muted-foreground mb-3">
                            <strong>All payments are final and non-refundable.</strong> By purchasing a subscription to SCHEMAX,
                            you acknowledge and agree that:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                            <li>All sales are final</li>
                            <li>No refunds will be issued for any reason, including but not limited to user error,
                                dissatisfaction with the Service, or failure to use the Service</li>
                            <li>Subscription fees are charged in advance on a recurring basis</li>
                            <li>You may cancel your subscription at any time, but no refunds will be provided for
                                the current billing period</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">4. User Accounts</h2>
                        <p className="text-muted-foreground">
                            You are responsible for maintaining the confidentiality of your account credentials and
                            for all activities that occur under your account. You agree to notify us immediately of
                            any unauthorized use of your account.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">5. Usage Limits</h2>
                        <p className="text-muted-foreground">
                            Different subscription tiers have different usage limits. Free users are limited to
                            10 messages per day. Pro users receive 100+ messages per day. We reserve the right to
                            modify these limits at any time.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">6. Intellectual Property</h2>
                        <p className="text-muted-foreground">
                            All content, features, and functionality of the Service are owned by SCHEMAX and are
                            protected by international copyright, trademark, and other intellectual property laws.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">7. Limitation of Liability</h2>
                        <p className="text-muted-foreground">
                            SCHEMAX shall not be liable for any indirect, incidental, special, consequential, or
                            punitive damages resulting from your use of or inability to use the Service.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">8. Changes to Terms</h2>
                        <p className="text-muted-foreground">
                            We reserve the right to modify these Terms of Service at any time. Your continued use of
                            the Service after changes constitutes acceptance of the modified terms.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">9. Contact</h2>
                        <p className="text-muted-foreground">
                            For questions about these Terms of Service, please contact us through our support channels.
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
