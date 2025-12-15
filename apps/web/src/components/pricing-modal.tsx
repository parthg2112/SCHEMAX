"use server"

import * as React from "react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import Pricing from "./pricing"
import { CheckoutDialog } from "./checkout-dialog"

interface PricingModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    currentPlan?: 'free' | 'pro'
    onSelectPlan: (plan: 'free' | 'pro') => void
}

export function PricingModal({ open, onOpenChange, currentPlan, onSelectPlan }: PricingModalProps) {
    const [checkoutOpen, setCheckoutOpen] = React.useState(false)

    const handleSelectPlan = (plan: 'free' | 'pro') => {
        if (plan === 'pro') {
            setCheckoutOpen(true)
        } else {
            onSelectPlan(plan)
            onOpenChange(false)
        }
    }

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="sr-only">Choose Your Plan</DialogTitle>
                    </DialogHeader>
                    <Pricing onSelectPlan={handleSelectPlan} currentPlan={currentPlan} />
                </DialogContent>
            </Dialog>

            <CheckoutDialog
                open={checkoutOpen}
                onOpenChange={setCheckoutOpen}
                amount={1}
                planName="Pro"
            />
        </>
    )
}
