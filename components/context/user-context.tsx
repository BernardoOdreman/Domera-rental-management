"use client"

import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';


interface Landlord {
  id: string;
  email: string;
  name: string;
  avatar: string;
  themePrefered: string;
  accent_color: string;
  phoneNumber: string;
  ubication: string;
}

interface LandlordContextType {
  landlord: Landlord;
  isAuthenticated: boolean;
  updateLandlord: (newData: Partial<Landlord>) => Promise<void>;
  resetLandlord: () => void;
}

const LandlordContext = createContext<LandlordContextType | undefined>(undefined);

const initialLandlordState: Landlord = {
  id: "",
  email: '',
  name: '',
  avatar: "",
  themePrefered: 'light',
  accent_color: '#0a0',
  phoneNumber: '',
  ubication: '',
};

export const LandlordProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [landlord, setLandlord] = useState<Landlord>(initialLandlordState);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Mantenemos las mismas funciones públicas
  const updateLandlord = async (newData: Partial<Landlord>) => {
    const { error } = await supabase
    .from('LANDLORDS')
    .update({
      name: newData.name,
      phone: newData.phoneNumber,
      ubication: newData.ubication,
      theme_prefered: newData.themePrefered,
      accent_color: newData.accent_color,
      avatar: newData.avatar
    })
    .eq('id', landlord.id);

    if (!error) {
      setLandlord(prev => ({ ...prev, ...newData }));
    }
  };

  const resetLandlord = () => {
    setLandlord(initialLandlordState);
    setIsAuthenticated(false);
    supabase.auth.signOut();
  };

  // Funciones internas iguales pero con mejor manejo de errores
  const fetchLandlord = async (userId: string) => {
    try {
      const { data, error } = await supabase
      .from('LANDLORDS')
      .select('*')
      .eq('id', userId)
      .single();

      if (!error && data) {
        setLandlord({
          id: data.id,
          email: data.email,
          name: data.name,
          phoneNumber: data.phone,
          ubication: data.ubication,
          themePrefered: data.theme_prefered,
          accent_color: data.accent_color,
          avatar: data.avatar || ""
        });
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Error fetching landlord:', error);
    }
  };

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          await fetchLandlord(session.user.id);
          const channel = supabase.channel('landlord-updates')
          .on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: 'LANDLORDS',
            filter: `id=eq.${session.user.id}`
          }, () => fetchLandlord(session.user.id))
          .subscribe();
        }
        if (event === 'SIGNED_OUT') resetLandlord();
      }
    );

    const initialize = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) await fetchLandlord(user.id);
    };

      initialize();

      return () => {
        authListener?.subscription.unsubscribe();
      };
  }, []);

  // Aplicar tema y color de acento globalmente
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.style.setProperty('--accent-color', landlord.accent_color);
      document.documentElement.classList.toggle('dark', landlord.themePrefered === 'dark');
    }
  }, [landlord.accent_color, landlord.themePrefered]);

  return (
    <LandlordContext.Provider value={{ landlord, isAuthenticated, updateLandlord, resetLandlord }}>
    {children}
    </LandlordContext.Provider>
  );
};

export const useLandlord = () => {
  const context = useContext(LandlordContext);
  if (!context) {
    throw new Error('useLandlord debe usarse dentro de LandlordProvider');
  }
  return context;
};
