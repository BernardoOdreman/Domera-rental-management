"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { supabase } from '@/lib/supabase/client';



export type Property = {
  id: string
  address: string
  type: string
  bedrooms: number
  bathrooms: number
  rent: number
  status: "occupied" | "vacant" | "maintenance"
  tenantName?: string
  leaseEnd?: string
  image?: string
}

export type MaintenanceRequest = {
  id: string
  propertyId: string
  propertyAddress: string
  issue: string
  issueType?: string
  status: "pending" | "in progress" | "completed"
  priority: "low" | "medium" | "high"
  dateSubmitted: string
  description: string
  assignedVendorId?: string
}

export type Tenant = {
  id: string
  name: string
  email: string
  phone: string
  propertyId: string
  propertyAddress: string
  leaseStart: string
  leaseEnd: string
  rentAmount: number
  paymentStatus: "paid" | "pending" | "overdue"
}

export type Message = {
  id: string
  sender: string
  content: string
  timestamp: string
  read: boolean
  avatar?: string
}

export type FavoriteVendor = {
  id: string
  name: string
  specialty: string
  phone: string
  email: string
  address: string
  rating: number
  notes?: string
  avatar?: string
}

type PropertyContextType = {
  properties: Property[]
  addProperty: (property: Omit<Property, "id">) => Promise<string>
  updateProperty: (id: string, updates: Partial<Property>) => Promise<void>
  deleteProperty: (id: string) => Promise<void>
  totalProperties: number
  vacantProperties: number

  maintenanceRequests: MaintenanceRequest[]
  addMaintenanceRequest: (request: Omit<MaintenanceRequest, "id">) => Promise<void>
  updateMaintenanceRequest: (id: string, updates: Partial<MaintenanceRequest>) => Promise<void>
  deleteMaintenanceRequest: (id: string) => Promise<void>
  totalMaintenanceRequests: number

  tenants: Tenant[]
  addTenant: (tenant: Omit<Tenant, "id">) => Promise<void>
  updateTenant: (id: string, updates: Partial<Tenant>) => Promise<void>
  deleteTenant: (id: string) => Promise<void>
  totalTenants: number

  messages: Message[]
  addMessage: (message: Omit<Message, "id">) => Promise<void>
  updateMessage: (id: string, updates: Partial<Message>) => Promise<void>
  deleteMessage: (id: string) => Promise<void>
  unreadMessages: number

  favoriteVendors: FavoriteVendor[]
  addFavoriteVendor: (vendor: Omit<FavoriteVendor, "id">) => Promise<void>
  updateFavoriteVendor: (id: string, updates: Partial<FavoriteVendor>) => Promise<void>
  removeFavoriteVendor: (id: string) => Promise<void>

  rentCollected: number
  rentPending: number
  loading: boolean
  error: string | null
  refreshData: () => Promise<void>
}

const PropertyContext = createContext<PropertyContextType | undefined>(undefined)

const getImageUrl = (userId: string, propertyId: string): string => {


  return "none yet "
}

export function PropertyProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState({
    properties: [] as Property[],
    maintenanceRequests: [] as MaintenanceRequest[],
    tenants: [] as Tenant[],
    messages: [] as Message[],
    favoriteVendors: [] as FavoriteVendor[],
    loading: false,
    error: null as string | null
  })

  const fetchUserData = async (userId: string) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }))

      // 1. Obtener propiedades del usuario
      const { data: properties, error: propError } = await supabase
        .from('properties')
        .select('*')
        .eq('landlord_id', userId)

      if (propError) throw propError

      // 2. Obtener datos relacionados usando los IDs de propiedades
      const propertyIds = properties?.map(p => p.id) || []
      
      const [
        { data: tenants, error: tenantsError },
        { data: maintenanceRequests, error: maintError },
        { data: messages, error: messagesError },
        { data: favoriteVendors, error: vendorsError }
      ] = await Promise.all([
        supabase.from('tenants').select('*').in('property_id', propertyIds),
        supabase.from('maintenance_requests').select('*').in('property_id', propertyIds),
        supabase.from('messages').select('*').in('property_id', propertyIds),
        supabase.from('favorite_vendors').select('*').eq('landlord_id', userId)
      ])

      if (tenantsError || maintError || messagesError || vendorsError) {
        throw tenantsError || maintError || messagesError || vendorsError
      }

      // Mapear datos para incluir relaciones
      const propertiesWithTenants = properties?.map(property => {
        const tenant = tenants?.find(t => t.property_id === property.id)
        const imageUrl = getImageUrl(userId, property.id)
        

        return {
          ...property,
          tenantName: tenant?.name,
          leaseEnd: tenant?.lease_end,
          image: imageUrl
        }
      }) || []

      const maintenanceWithAddress = maintenanceRequests?.map(request => {
        const property = properties?.find(p => p.id === request.property_id)
        return {
          ...request,
          propertyAddress: property?.address || ''
        }
      }) || []

      const tenantsWithAddress = tenants?.map(tenant => {
        const property = properties?.find(p => p.id === tenant.property_id);
        return {
          id: tenant.id,
          name: tenant.name,
          email: tenant.email,
          phone: tenant.phone,
          propertyId: tenant.property_id, // Mapear correctamente
          propertyAddress: property?.address || '',
          leaseStart: tenant.lease_start,
          leaseEnd: tenant.lease_end,
          rentAmount: tenant.rent_amount,
          paymentStatus: tenant.payment_status
        };
      }) || [];

      setState({
        properties: propertiesWithTenants,
        maintenanceRequests: maintenanceWithAddress,
        tenants: tenantsWithAddress,
        messages: messages || [],
        favoriteVendors: favoriteVendors || [],
        loading: false,
        error: null
      })

    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Error fetching data'
      }))
    }
  }

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        fetchUserData(session.user.id)
      } else {
        setState({
          properties: [],
          maintenanceRequests: [],
          tenants: [],
          messages: [],
          favoriteVendors: [],
          loading: false,
          error: null
        })
      }
    })

    return () => {
      authListener?.subscription.unsubscribe()
    }
  }, [])

  // Property CRUD
  const addProperty = async (property: Omit<Property, "id">) => {
    try {
      const { data, error } = await supabase
        .from('properties')
        .insert(property)
        .select()
        .single()

      if (error) throw error

      setState(prev => ({
        ...prev,
        properties: [...prev.properties, data]
      }))

      return data.id
    } catch (error) {
      setState(prev => ({ ...prev, error: error instanceof Error ? error.message : 'Error adding property' }))
      throw error
    }
  }

  const updateProperty = async (id: string, updates: Partial<Property>) => {
    try {
      const { data, error } = await supabase
        .from('properties')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      setState(prev => ({
        ...prev,
        properties: prev.properties.map(prop => 
          prop.id === id ? { ...prop, ...data } : prop
        )
      }))
    } catch (error) {
      setState(prev => ({ ...prev, error: error instanceof Error ? error.message : 'Error updating property' }))
      throw error
    }
  }

  const deleteProperty = async (id: string) => {
    try {
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', id)

      if (error) throw error

      setState(prev => ({
        ...prev,
        properties: prev.properties.filter(prop => prop.id !== id),
        tenants: prev.tenants.filter(tenant => tenant.propertyId !== id),
        maintenanceRequests: prev.maintenanceRequests.filter(req => req.propertyId !== id),
        messages: prev.messages.filter(msg => msg.propertyId !== id)
      }))
    } catch (error) {
      setState(prev => ({ ...prev, error: error instanceof Error ? error.message : 'Error deleting property' }))
      throw error
    }
  }

  // Maintenance CRUD
  const addMaintenanceRequest = async (request: Omit<MaintenanceRequest, "id">) => {
    try {
      const { data, error } = await supabase
        .from('maintenance_requests')
        .insert({
          property_id: request.propertyId,
          issue: request.issue,
          issue_type: request.issueType,
          status: request.status,
          priority: request.priority,
          date_submitted: request.dateSubmitted,
          description: request.description,
          assigned_vendor_id: request.assignedVendorId
        })
        .select()
        .single()

      if (error) throw error

      const property = state.properties.find(p => p.id === request.propertyId)

      setState(prev => ({
        ...prev,
        maintenanceRequests: [
          ...prev.maintenanceRequests,
          {
            ...data,
            propertyAddress: property?.address || '',
            propertyId: data.property_id,
            assignedVendorId: data.assigned_vendor_id
          }
        ]
      }))
    } catch (error) {
      setState(prev => ({ ...prev, error: error instanceof Error ? error.message : 'Error adding maintenance request' }))
      throw error
    }
  }

  const updateMaintenanceRequest = async (id: string, updates: Partial<MaintenanceRequest>) => {
    try {
      const { data, error } = await supabase
        .from('maintenance_requests')
        .update({
          issue: updates.issue,
          issue_type: updates.issueType,
          status: updates.status,
          priority: updates.priority,
          description: updates.description,
          assigned_vendor_id: updates.assignedVendorId
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      setState(prev => ({
        ...prev,
        maintenanceRequests: prev.maintenanceRequests.map(req => 
          req.id === id ? { 
            ...req, 
            ...data,
            propertyId: data.property_id,
            assignedVendorId: data.assigned_vendor_id
          } : req
        )
      }))
    } catch (error) {
      setState(prev => ({ ...prev, error: error instanceof Error ? error.message : 'Error updating maintenance request' }))
      throw error
    }
  }

  const deleteMaintenanceRequest = async (id: string) => {
    try {
      const { error } = await supabase
        .from('maintenance_requests')
        .delete()
        .eq('id', id)

      if (error) throw error

      setState(prev => ({
        ...prev,
        maintenanceRequests: prev.maintenanceRequests.filter(req => req.id !== id)
      }))
    } catch (error) {
      setState(prev => ({ ...prev, error: error instanceof Error ? error.message : 'Error deleting maintenance request' }))
      throw error
    }
  }

  // Tenant CRUD
  const addTenant = async (tenant: Omit<Tenant, "id">) => {
    try {
      const { data, error } = await supabase
        .from('tenants')
        .insert({
          property_id: tenant.propertyId,
          name: tenant.name,
          email: tenant.email,
          phone: tenant.phone,
          lease_start: tenant.leaseStart,
          lease_end: tenant.leaseEnd,
          rent_amount: tenant.rentAmount,
          payment_status: tenant.paymentStatus
        })
        .select()
        .single()

      if (error) throw error

      const property = state.properties.find(p => p.id === tenant.propertyId)

      setState(prev => ({
        ...prev,
        tenants: [
          ...prev.tenants,
          {
            ...data,
            propertyId: data.property_id,
            propertyAddress: property?.address || '',
            leaseStart: data.lease_start,
            leaseEnd: data.lease_end,
            rentAmount: data.rent_amount,
            paymentStatus: data.payment_status
          }
        ],
        properties: prev.properties.map(prop =>
          prop.id === tenant.propertyId
            ? { ...prop, status: "occupied", tenantName: tenant.name, leaseEnd: tenant.leaseEnd }
            : prop
        )
      }))
    } catch (error) {
      setState(prev => ({ ...prev, error: error instanceof Error ? error.message : 'Error adding tenant' }))
      throw error
    }
  }

  const updateTenant = async (id: string, updates: Partial<Tenant>) => {
    try {
      const { data, error } = await supabase
        .from('tenants')
        .update({
          name: updates.name,
          email: updates.email,
          phone: updates.phone,
          lease_end: updates.leaseEnd,
          rent_amount: updates.rentAmount,
          payment_status: updates.paymentStatus
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      setState(prev => ({
        ...prev,
        tenants: prev.tenants.map(tenant =>
          tenant.id === id
            ? {
                ...tenant,
                ...data,
                propertyId: data.property_id,
                leaseStart: data.lease_start,
                leaseEnd: data.lease_end,
                rentAmount: data.rent_amount,
                paymentStatus: data.payment_status
              }
            : tenant
        ),
        properties: prev.properties.map(prop =>
          prop.id === data.property_id
            ? {
                ...prop,
                tenantName: updates.name || prop.tenantName,
                leaseEnd: updates.leaseEnd || prop.leaseEnd
              }
            : prop
        )
      }))
    } catch (error) {
      setState(prev => ({ ...prev, error: error instanceof Error ? error.message : 'Error updating tenant' }))
      throw error
    }
  }

  const deleteTenant = async (id: string) => {
    try {
      const tenant = state.tenants.find(t => t.id === id)
      if (!tenant) throw new Error('Tenant not found')

      const { error } = await supabase
        .from('tenants')
        .delete()
        .eq('id', id)

      if (error) throw error

      setState(prev => ({
        ...prev,
        tenants: prev.tenants.filter(t => t.id !== id),
        properties: prev.properties.map(prop =>
          prop.id === tenant.propertyId
            ? { ...prop, status: "vacant", tenantName: undefined, leaseEnd: undefined }
            : prop
        )
      }))
    } catch (error) {
      setState(prev => ({ ...prev, error: error instanceof Error ? error.message : 'Error deleting tenant' }))
      throw error
    }
  }

  // Message CRUD
  const addMessage = async (message: Omit<Message, "id">) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          property_id: message.propertyId,
          sender: message.sender,
          content: message.content,
          timestamp: message.timestamp,
          read: message.read,
          avatar: message.avatar
        })
        .select()
        .single()

      if (error) throw error

      setState(prev => ({
        ...prev,
        messages: [
          ...prev.messages,
          {
            ...data,
            propertyId: data.property_id
          }
        ]
      }))
    } catch (error) {
      setState(prev => ({ ...prev, error: error instanceof Error ? error.message : 'Error adding message' }))
      throw error
    }
  }

  const updateMessage = async (id: string, updates: Partial<Message>) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .update({
          read: updates.read,
          content: updates.content
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      setState(prev => ({
        ...prev,
        messages: prev.messages.map(msg =>
          msg.id === id
            ? {
                ...msg,
                ...data,
                propertyId: data.property_id
              }
            : msg
        )
      }))
    } catch (error) {
      setState(prev => ({ ...prev, error: error instanceof Error ? error.message : 'Error updating message' }))
      throw error
    }
  }

  const deleteMessage = async (id: string) => {
    try {
      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('id', id)

      if (error) throw error

      setState(prev => ({
        ...prev,
        messages: prev.messages.filter(msg => msg.id !== id)
      }))
    } catch (error) {
      setState(prev => ({ ...prev, error: error instanceof Error ? error.message : 'Error deleting message' }))
      throw error
    }
  }

  // Favorite Vendors CRUD
  const addFavoriteVendor = async (vendor: Omit<FavoriteVendor, "id">) => {
    try {
      const { data, error } = await supabase
        .from('favorite_vendors')
        .insert(vendor)
        .select()
        .single()

      if (error) throw error

      setState(prev => ({
        ...prev,
        favoriteVendors: [...prev.favoriteVendors, data]
      }))
    } catch (error) {
      setState(prev => ({ ...prev, error: error instanceof Error ? error.message : 'Error adding vendor' }))
      throw error
    }
  }

  const updateFavoriteVendor = async (id: string, updates: Partial<FavoriteVendor>) => {
    try {
      const { data, error } = await supabase
        .from('favorite_vendors')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      setState(prev => ({
        ...prev,
        favoriteVendors: prev.favoriteVendors.map(vendor =>
          vendor.id === id ? { ...vendor, ...data } : vendor
        )
      }))
    } catch (error) {
      setState(prev => ({ ...prev, error: error instanceof Error ? error.message : 'Error updating vendor' }))
      throw error
    }
  }

  const removeFavoriteVendor = async (id: string) => {
    try {
      const { error } = await supabase
        .from('favorite_vendors')
        .delete()
        .eq('id', id)

      if (error) throw error

      setState(prev => ({
        ...prev,
        favoriteVendors: prev.favoriteVendors.filter(vendor => vendor.id !== id),
        maintenanceRequests: prev.maintenanceRequests.map(req =>
          req.assignedVendorId === id ? { ...req, assignedVendorId: undefined } : req
        )
      }))
    } catch (error) {
      setState(prev => ({ ...prev, error: error instanceof Error ? error.message : 'Error removing vendor' }))
      throw error
    }
  }

  // Refresh data
  const refreshData = async () => {
    const session = await supabase.auth.getSession()
    if (session.data.session?.user) {
      await fetchUserData(session.data.session.user.id)
    }
  }

  // Calculated values
  const totalProperties = state.properties.length
  const vacantProperties = state.properties.filter(p => p.status === "vacant").length
  const totalMaintenanceRequests = state.maintenanceRequests.length
  const totalTenants = state.tenants.length
  const unreadMessages = state.messages.filter(m => !m.read).length

  const totalRent = state.tenants.reduce((sum, tenant) => sum + tenant.rentAmount, 0)
  const rentCollected = state.tenants
    .filter(t => t.paymentStatus === "paid")
    .reduce((sum, tenant) => sum + tenant.rentAmount, 0)
  const rentPending = totalRent - rentCollected

  const value = {
    properties: state.properties,
    addProperty,
    updateProperty,
    deleteProperty,
    totalProperties,
    vacantProperties,

    maintenanceRequests: state.maintenanceRequests,
    addMaintenanceRequest,
    updateMaintenanceRequest,
    deleteMaintenanceRequest,
    totalMaintenanceRequests,

    tenants: state.tenants,
    addTenant,
    updateTenant,
    deleteTenant,
    totalTenants,

    messages: state.messages,
    addMessage,
    updateMessage,
    deleteMessage,
    unreadMessages,

    favoriteVendors: state.favoriteVendors,
    addFavoriteVendor,
    updateFavoriteVendor,
    removeFavoriteVendor,

    rentCollected,
    rentPending,
    loading: state.loading,
    error: state.error,
    refreshData
  }

  return (
    <PropertyContext.Provider value={value}>
      {(state.loading && false )  ? (
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        children
      )}
    </PropertyContext.Provider>
  )
}

export function usePropertyContext() {
  const context = useContext(PropertyContext)
  if (context === undefined) {
    throw new Error("usePropertyContext must be used within a PropertyProvider")
  }
  return context
}
