"use server"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

import { getBackendUrl } from "@/lib/api-url"

// Cashfree will be dynamically imported when needed
// import {
//     Cashfree,
//     CardNumber,
//     CardHolder,
//     CardExpiry,
//     CardCVV,
// } from "@cashfreepayments/pg-react"

interface CheckoutProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    amount: number
    planName: string
}

export function CheckoutDialog({ open, onOpenChange, amount, planName }: CheckoutProps) {
    const [isProcessing, setIsProcessing] = React.useState(false)
    const [cardNumber, setCardNumber] = React.useState("")
    const [cardHolder, setCardHolder] = React.useState("")
    const [expiry, setExpiry] = React.useState("")
    const [cvv, setCvv] = React.useState("")

    const handlePay = async () => {
        setIsProcessing(true)

        try {
            // TODO: Create payment session on backend
            const backendUrl = getBackendUrl()
            const response = await fetch(`${backendUrl}/payment/create-order`, {
                method: "POST",
                credentials: 'include',
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    amount,
                    plan: planName,
                }),
            })

            if (!response.ok) {
                throw new Error("Failed to create payment order")
            }

            const data = await response.json()

            // Handle Cashfree payment flow
            console.log("Payment order created:", data)

            // For now, simulate success
            setTimeout(() => {
                alert("Payment successful! (Demo mode)")
                onOpenChange(false)
                setIsProcessing(false)
            }, 2000)
        } catch (error) {
            console.error("Payment error:", error)
            alert("Payment failed. Please try again.")
            setIsProcessing(false)
        }
    }

    const isFormValid = cardNumber.length >= 16 && cardHolder.length > 0 && expiry.length >= 5 && cvv.length >= 3

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Upgrade to {planName}</DialogTitle>
                    <DialogDescription>
                        Complete your payment to unlock {planName === "Pro" ? "100+ messages/day" : "unlimited features"}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                        <div>
                            <p className="font-semibold">Total Amount</p>
                            <p className="text-sm text-muted-foreground">First month special</p>
                        </div>
                        <p className="text-2xl font-bold">${amount}</p>
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-2">
                            <Label className="text-sm font-medium">Card Number</Label>
                            <Input
                                placeholder="1234 5678 9012 3456"
                                value={cardNumber}
                                onChange={(e) => setCardNumber(e.target.value.replace(/\s/g, '').slice(0, 16))}
                                maxLength={16}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-sm font-medium">Cardholder Name</Label>
                            <Input
                                placeholder="JOHN DOE"
                                value={cardHolder}
                                onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-sm font-medium">Expiry (MM/YY)</Label>
                                <Input
                                    placeholder="MM/YY"
                                    value={expiry}
                                    onChange={(e) => {
                                        let val = e.target.value.replace(/\D/g, '')
                                        if (val.length >= 2) {
                                            val = val.slice(0, 2) + '/' + val.slice(2, 4)
                                        }
                                        setExpiry(val.slice(0, 5))
                                    }}
                                    maxLength={5}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-medium">CVV</Label>
                                <Input
                                    placeholder="123"
                                    type="password"
                                    value={cvv}
                                    onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                                    maxLength={4}
                                />
                            </div>
                        </div>

                        <Button
                            onClick={handlePay}
                            disabled={!isFormValid || isProcessing}
                            className="w-full mt-2 bg-black hover:bg-gray-800 text-white"
                        >
                            {isProcessing ? "Processing..." : `Pay $${amount}`}
                        </Button>
                    </div>

                    <p className="text-xs text-center text-muted-foreground mt-4">
                        🔒 Secured by Cashfree Payments
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    )
}
