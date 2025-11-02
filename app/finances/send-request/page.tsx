"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { CreditCard, DollarSign, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { usePropertyContext } from "@/context/property-context"
import { useToast } from "@/hooks/use-toast"

export default function SendPaymentRequestPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tenantIdParam = searchParams.get("tenantId")
  const { toast } = useToast()

  const { tenants } = usePropertyContext()

  const [formData, setFormData] = useState({
    tenantId: tenantIdParam || "",
    amount: "",
    dueDate: "",
    description: "Monthly rent payment",
    paymentMethod: "both",
    sendReminder: true,
  })

  useEffect(() => {
    if (tenantIdParam) {
      const tenant = tenants.find((t) => t.id === tenantIdParam)
      if (tenant) {
        setFormData((prev) => ({
          ...prev,
          tenantId: tenantIdParam,
          amount: tenant.rentAmount.toString(),
        }))
      }
    }
  }, [tenantIdParam, tenants])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Update amount when tenant changes
    if (name === "tenantId") {
      const tenant = tenants.find((t) => t.id === value)
      if (tenant) {
        setFormData((prev) => ({ ...prev, amount: tenant.rentAmount.toString() }))
      }
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Simulate sending payment request
    toast({
      title: "Payment request sent",
      description: `Payment request sent to ${tenants.find((t) => t.id === formData.tenantId)?.name}`,
    })

    router.push("/finances")
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Send Payment Request</h1>
        <p className="text-muted-foreground">Request payment from a tenant</p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Payment Request Details</CardTitle>
            <CardDescription>Create a payment request to send to your tenant</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tenantId">Tenant</Label>
              <Select
                value={formData.tenantId}
                onValueChange={(value) => handleSelectChange("tenantId", value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select tenant" />
                </SelectTrigger>
                <SelectContent>
                  {tenants.map((tenant) => (
                    <SelectItem key={tenant.id} value={tenant.id}>
                      {tenant.name} - {tenant.propertyAddress}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount ($)</Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                min="0"
                step="0.01"
                placeholder="1200.00"
                value={formData.amount}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                name="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Payment details..."
                value={formData.description}
                onChange={handleChange}
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label>Payment Methods</Label>
              <RadioGroup
                defaultValue={formData.paymentMethod}
                onValueChange={(value) => handleSelectChange("paymentMethod", value)}
                className="flex flex-col space-y-1"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="stripe" id="stripe" />
                  <Label htmlFor="stripe" className="flex items-center">
                    <CreditCard className="mr-2 h-4 w-4" />
                    Stripe Only
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="paypal" id="paypal" />
                  <Label htmlFor="paypal" className="flex items-center">
                    <DollarSign className="mr-2 h-4 w-4" />
                    PayPal Only
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="both" id="both" />
                  <Label htmlFor="both">Both Payment Methods</Label>
                </div>
              </RadioGroup>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit">
              <Send className="mr-2 h-4 w-4" />
              Send Request
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}
