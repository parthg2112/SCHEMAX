import { Button } from '@/components/ui/button'
import { Check } from 'lucide-react'

interface PricingProps {
    onSelectPlan: (plan: 'free' | 'pro') => void
    currentPlan?: 'free' | 'pro'
}

export default function Pricing({ onSelectPlan, currentPlan = 'free' }: PricingProps) {
    return (
        <section className="py-8">
            <div className="mx-auto max-w-5xl px-6">
                <div className="mx-auto max-w-2xl space-y-6 text-center">
                    <h1 className="text-center text-4xl font-semibold lg:text-5xl">Choose Your Plan</h1>
                    <p className="text-muted-foreground">Generate unlimited database schemas with AI. Start free, upgrade when you need more.</p>
                </div>

                <div className="mt-8 grid gap-6 md:mt-12 md:grid-cols-2 md:gap-6">
                    {/* Free Plan */}
                    <div className="rounded-lg flex flex-col justify-between space-y-6 border p-6 lg:p-8">
                        <div className="space-y-4">
                            <div>
                                <h2 className="text-xl font-semibold">Free</h2>
                                <span className="my-3 block text-3xl font-bold">$0<span className="text-lg font-normal text-muted-foreground">/month</span></span>
                                <p className="text-muted-foreground text-sm">Perfect for trying out SCHEMAX</p>
                            </div>

                            <Button
                                variant={currentPlan === 'free' ? 'outline' : 'default'}
                                className="w-full"
                                disabled={currentPlan === 'free'}
                                onClick={() => onSelectPlan('free')}
                            >
                                {currentPlan === 'free' ? 'Current Plan' : 'Get Started'}
                            </Button>

                            <hr className="border-dashed" />

                            <ul className="list-outside space-y-3 text-sm">
                                {[
                                    '10 AI messages per day',
                                    'Prisma, Drizzle, SQL schemas',
                                    'ERD visual editor',
                                    'Export code as ZIP',
                                    'Community support'
                                ].map((item, index) => (
                                    <li key={index} className="flex items-center gap-2">
                                        <Check className="size-4 text-green-600" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Pro Plan */}
                    <div className="rounded-lg border-2 border-primary p-6 shadow-lg relative lg:p-8">
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-xs font-semibold">
                            BEST VALUE
                        </div>
                        <div className="space-y-4">
                            <div>
                                <h2 className="text-xl font-semibold">Pro</h2>
                                <div className="my-3 flex items-baseline gap-2">
                                    <span className="text-3xl font-bold">$1</span>
                                    <span className="text-muted-foreground line-through text-lg">$5</span>
                                    <span className="text-lg font-normal text-muted-foreground">/first month</span>
                                </div>
                                <p className="text-muted-foreground text-sm">Then $5/month. Cancel anytime.</p>
                            </div>

                            <Button
                                className="w-full"
                                disabled={currentPlan === 'pro'}
                                onClick={() => onSelectPlan('pro')}
                            >
                                {currentPlan === 'pro' ? 'Current Plan' : 'Upgrade to Pro'}
                            </Button>

                            <hr className="border-dashed" />

                            <div className="text-sm font-medium">Everything in Free, plus:</div>

                            <ul className="list-outside space-y-3 text-sm">
                                {[
                                    '100+ AI messages per day',
                                    'Unlimited projects',
                                    'Advanced ERD features',
                                    'Priority AI responses',
                                    'Custom boilerplate templates',
                                    'Priority email support',
                                    'Early access to new features'
                                ].map((item, index) => (
                                    <li key={index} className="flex items-center gap-2">
                                        <Check className="size-4 text-green-600" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Legal Footer */}
                <div className="mt-12 pt-6 border-t text-center">
                    <p className="text-xs text-muted-foreground flex items-center justify-center gap-4">
                        <a href="/terms" target="_blank" className="hover:underline hover:text-foreground transition-colors">
                            Terms of Service
                        </a>
                        <span>•</span>
                        <a href="/privacy" target="_blank" className="hover:underline hover:text-foreground transition-colors">
                            Privacy Policy
                        </a>
                    </p>
                </div>
            </div>
        </section>
    )
}
