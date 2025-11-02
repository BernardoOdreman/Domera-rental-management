'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Users, Loader } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase/client';
import type { Session } from '@supabase/supabase-js';

interface Property {
  id: string
  address: string
  rent: number
}

interface FormData {
  name: string
  email: string
  phone: string
  propertyId: string
  leaseStart: string
  leaseEnd: string
  rentAmount: string
  paymentStatus: string
}

export default function AddTenantPage() {
  const { toast } = useToast()
  const router = useRouter()
  const [properties, setProperties] = useState<Property[]>([])
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    propertyId: '',
    leaseStart: new Date().toISOString().split('T')[0],
    leaseEnd: '',
    rentAmount: '',
    paymentStatus: 'pending'
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingProperties, setIsLoadingProperties] = useState(true)
  const [session, setSession] = useState<Session | null>(null)

  // Obtener sesión y propiedades al montar el componente
  useEffect(() => {
    const fetchSessionAndProperties = async () => {
      setIsLoadingProperties(true);
      try {
        // Obtener sesión
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);

        if (!session) {
          toast({
            title: "Authentication required",
            description: "Please sign in to add tenants",
            variant: "destructive"
          });
          setIsLoadingProperties(false);
          router.push('/login');
          return;
        }

        // Obtener propiedades vacantes del landlord
        const { data, error } = await supabase
          .from('properties')
          .select('id, address, rent')
          .eq('status', 'vacant')
          .eq('landlord_id', session.user.id);

        if (error) throw error;

        setProperties(data || []);

      } catch (error: any) {
        toast({
          title: "Error loading properties",
          description: error.message || "Failed to load properties",
          variant: "destructive"
        });
      } finally {
        setIsLoadingProperties(false);
      }
    };

    fetchSessionAndProperties();
  }, [toast, router]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) newErrors.name = "Tenant name is required"
    if (!formData.email.trim() || !/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = "Valid email is required"
    }
    if (!formData.phone.trim() || !/^[\d\s().-]{7,20}$/.test(formData.phone)) {
      newErrors.phone = "Valid phone number is required (7-20 digits)"
    }
    if (!formData.propertyId) newErrors.propertyId = "Property selection is required"
    if (!formData.leaseEnd) newErrors.leaseEnd = "Lease end date is required"
    if (new Date(formData.leaseStart) > new Date(formData.leaseEnd)) {
      newErrors.leaseEnd = "Lease end must be after start date"
    }
    if (!formData.rentAmount || isNaN(parseFloat(formData.rentAmount)) || parseFloat(formData.rentAmount) <= 0) {
      newErrors.rentAmount = "Valid rent amount is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

 
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  if (!validateForm()) return

  setIsSubmitting(true)

  try { 
    if (!session) {
      throw new Error('Authentication failed: no session available');
    }

    // Construir payload para la función Edge
    const tenantData = {
      property_id: formData.propertyId,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      lease_start: formData.leaseStart,
      lease_end: formData.leaseEnd,
      rent_amount: formData.rentAmount,
      payment_status: formData.paymentStatus,
      landlord_id: session.user.id
    };

    // Invocar directamente la función Edge
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/create-tenant`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify(tenantData)
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Failed to create tenant');
    }

    toast({
      title: "Success",
      description: "Tenant created successfully",
    });
    
    // SOLUCIÓN: Cambiar a window.location para forzar recarga completa
    window.location.href = '/dashboard';

  } catch (error: any) {
    toast({
      title: "Error",
      description: error.message || "Failed to create tenant",
      variant: "destructive"
    });
    console.error('Error details:', error);
  } finally {
    setIsSubmitting(false);
  }
}

 
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handlePropertySelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const propertyId = e.target.value
    setFormData(prev => ({ ...prev, propertyId }))

    // Auto-completar rent al seleccionar propiedad
    const selectedProperty = properties.find(p => p.id === propertyId)
    if (selectedProperty) {
      setFormData(prev => ({
        ...prev,
        rentAmount: selectedProperty.rent.toString()
      }))
    }
  }

  const handleStatusSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, paymentStatus: e.target.value }))
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Add New Tenant</h1>
        <p className="text-gray-600 mt-2">Enter tenant and lease information</p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="border rounded-lg overflow-hidden shadow-md">
          <CardHeader className="bg-blue-50 p-6 border-b">
            <CardTitle className="text-xl font-semibold text-gray-800">Tenant Information</CardTitle>
            <CardDescription className="text-gray-600">
              Enter details about the tenant and lease agreement
            </CardDescription>
          </CardHeader>
          
          <CardContent className="p-6 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="font-medium text-gray-700">Full Name *</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                disabled={isSubmitting}
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="font-medium text-gray-700">Email *</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="john@example.com"
                disabled={isSubmitting}
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="font-medium text-gray-700">Phone *</Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="(555) 123-4567"
                disabled={isSubmitting}
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.phone ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.phone && <p className="text-sm text-red-600 mt-1">{errors.phone}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="propertyId" className="font-medium text-gray-700">Property *</Label>
              <div className="relative">
                {isLoadingProperties ? (
                  <div className="flex items-center justify-center w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                    <Loader className="h-4 w-4 animate-spin mr-2 text-blue-600" />
                    <span className="text-gray-600">Loading properties...</span>
                  </div>
                ) : (
                  <>
                    <select
                      id="propertyId"
                      value={formData.propertyId}
                      onChange={handlePropertySelect}
                      disabled={isSubmitting || properties.length === 0}
                      className={`w-full px-3 py-2 border rounded-md appearance-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.propertyId ? 'border-red-500' : 'border-gray-300'
                      } ${properties.length === 0 ? 'bg-gray-100 text-gray-500' : 'bg-white'}`}
                    >
                      <option value="">Select a property</option>
                      {properties.map((property) => (
                        <option key={property.id} value={property.id}>
                          {property.address} - ${property.rent}/mo
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                      <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </>
                )}
              </div>
              {errors.propertyId && <p className="text-sm text-red-600 mt-1">{errors.propertyId}</p>}
              {properties.length === 0 && !isLoadingProperties && (
                <p className="text-sm text-yellow-600 mt-1">No vacant properties available</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="leaseStart" className="font-medium text-gray-700">Lease Start</Label>
                <Input
                  id="leaseStart"
                  name="leaseStart"
                  type="date"
                  value={formData.leaseStart}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="leaseEnd" className="font-medium text-gray-700">Lease End *</Label>
                <Input
                  id="leaseEnd"
                  name="leaseEnd"
                  type="date"
                  value={formData.leaseEnd}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.leaseEnd ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.leaseEnd && <p className="text-sm text-red-600 mt-1">{errors.leaseEnd}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="rentAmount" className="font-medium text-gray-700">Monthly Rent *</Label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">$</span>
                <Input
                  id="rentAmount"
                  name="rentAmount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.rentAmount}
                  onChange={handleChange}
                  placeholder="1500.00"
                  disabled={isSubmitting}
                  className={`w-full pl-8 pr-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.rentAmount ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
              </div>
              {errors.rentAmount && <p className="text-sm text-red-600 mt-1">{errors.rentAmount}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentStatus" className="font-medium text-gray-700">Payment Status</Label>
              <div className="relative">
                <select
                  id="paymentStatus"
                  value={formData.paymentStatus}
                  onChange={handleStatusSelect}
                  disabled={isSubmitting}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md appearance-none bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="overdue">Overdue</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="bg-gray-50 p-6 flex justify-between border-t">
            <Button 
              type="button" 
              variant="outline"
              onClick={() => router.back()}
              disabled={isSubmitting}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || isLoadingProperties || properties.length === 0}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-300 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center"
            >
              {isSubmitting ? (
                <Loader className="h-5 w-5 animate-spin mr-2" />
              ) : (
                <Users className="h-5 w-5 mr-2" />
              )}
              {isSubmitting ? 'Creating...' : 'Create Tenant'}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
} 