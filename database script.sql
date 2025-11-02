 

-- 1. Tabla de propiedades
CREATE TABLE IF NOT EXISTS properties (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    landlord_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    address TEXT NOT NULL,
    type TEXT NOT NULL,
    bedrooms INTEGER NOT NULL,
    bathrooms INTEGER NOT NULL,
    rent DECIMAL(10,2) NOT NULL,
    status TEXT CHECK (status IN ('occupied', 'vacant', 'maintenance')) NOT NULL DEFAULT 'vacant',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabla de inquilinos
CREATE TABLE IF NOT EXISTS tenants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    lease_start DATE NOT NULL,
    lease_end DATE NOT NULL,
    rent_amount DECIMAL(10,2) NOT NULL,
    payment_status TEXT CHECK (payment_status IN ('paid', 'pending', 'overdue')) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tabla de solicitudes de mantenimiento
CREATE TABLE IF NOT EXISTS maintenance_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    issue TEXT NOT NULL,
    issue_type TEXT,
    status TEXT CHECK (status IN ('pending', 'in progress', 'completed')) NOT NULL DEFAULT 'pending',
    priority TEXT CHECK (priority IN ('low', 'medium', 'high')) NOT NULL DEFAULT 'medium',
    date_submitted DATE NOT NULL DEFAULT CURRENT_DATE,
    description TEXT NOT NULL,
    assigned_vendor_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Tabla de mensajes
CREATE TABLE IF NOT EXISTS messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    sender TEXT NOT NULL,
    content TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    read BOOLEAN DEFAULT FALSE,
    avatar TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Tabla de proveedores favoritos
CREATE TABLE IF NOT EXISTS favorite_vendors (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    landlord_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    specialty TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    address TEXT NOT NULL,
    rating DECIMAL(3,2) DEFAULT 0,
    notes TEXT,
    avatar TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Tabla de landlords (en mayúsculas como en el código)
CREATE TABLE IF NOT EXISTS "LANDLORDS" (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    name TEXT,
    theme_prefered TEXT DEFAULT 'light',
    accent_color TEXT DEFAULT '#0a0',
    phone TEXT,
    ubication TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Configuración de RLS (Row Level Security)

-- Properties RLS
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own properties" ON properties
    FOR ALL USING (auth.uid() = landlord_id);

-- Tenants RLS
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own tenants" ON tenants
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM properties 
            WHERE properties.id = tenants.property_id 
            AND properties.landlord_id = auth.uid()
        )
    );

-- Maintenance Requests RLS
ALTER TABLE maintenance_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own maintenance requests" ON maintenance_requests
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM properties 
            WHERE properties.id = maintenance_requests.property_id 
            AND properties.landlord_id = auth.uid()
        )
    );

-- Messages RLS
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own messages" ON messages
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM properties 
            WHERE properties.id = messages.property_id 
            AND properties.landlord_id = auth.uid()
        )
    );

-- Favorite Vendors RLS
ALTER TABLE favorite_vendors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own favorite vendors" ON favorite_vendors
    FOR ALL USING (auth.uid() = landlord_id);

-- LANDLORDS RLS
ALTER TABLE "LANDLORDS" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own landlord profile" ON "LANDLORDS"
    FOR ALL USING (auth.uid() = id);

-- Función para actualizar timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
CREATE TRIGGER update_properties_updated_at 
    BEFORE UPDATE ON properties 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tenants_updated_at 
    BEFORE UPDATE ON tenants 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_maintenance_requests_updated_at 
    BEFORE UPDATE ON maintenance_requests 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_favorite_vendors_updated_at 
    BEFORE UPDATE ON favorite_vendors 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_landlords_updated_at 
    BEFORE UPDATE ON "LANDLORDS" 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger para crear registro automático en LANDLORDS
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public."LANDLORDS" (id, email)
    VALUES (new.id, new.email);
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Configuración de almacenamiento para imágenes (opcional)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('property-images', 'property-images', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas para el bucket de imágenes
CREATE POLICY "Users can upload property images" ON storage.objects
FOR INSERT TO authenticated WITH CHECK (
    bucket_id = 'property-images' 
    AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can view own property images" ON storage.objects
FOR SELECT TO authenticated USING (
    bucket_id = 'property-images' 
    AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can update own property images" ON storage.objects
FOR UPDATE TO authenticated USING (
    bucket_id = 'property-images' 
    AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete own property images" ON storage.objects
FOR DELETE TO authenticated USING (
    bucket_id = 'property-images' 
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_properties_landlord_id ON properties(landlord_id);
CREATE INDEX IF NOT EXISTS idx_tenants_property_id ON tenants(property_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_requests_property_id ON maintenance_requests(property_id);
CREATE INDEX IF NOT EXISTS idx_messages_property_id ON messages(property_id);
CREATE INDEX IF NOT EXISTS idx_favorite_vendors_landlord_id ON favorite_vendors(landlord_id);
