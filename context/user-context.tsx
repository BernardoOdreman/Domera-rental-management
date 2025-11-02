"use client"

import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Channel } from '@supabase/supabase-js';

interface Landlord {
  id: string;
  email: string;
  name: string;
  themePrefered: string;
  accent_color: string;
  phone: string;
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
  themePrefered: 'light',
  accent_color: '#0a0',
  phone: '',
  ubication: '',
};

export const LandlordProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [landlord, setLandlord] = useState<Landlord>(initialLandlordState);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const channelRef = useRef<Channel | null>(null);

  const updateLandlord = async (newData: Partial<Landlord>) => {
    const { error } = await supabase
    .from('LANDLORDS')
    .update({
      name: newData.name,
      phone: newData.phone,
      ubication: newData.ubication,
      theme_prefered: newData.themePrefered,
      accent_color: newData.accent_color
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

  const fetchLandlord = async (userId: string) => {
    const { data, error } = await supabase
    .from('LANDLORDS')
    .select('*')
    .eq('id', userId)
    .single();

    if (!error && data) {
      setLandlord({
        id: data.id,
        email: data.email,
        name: data.name || '',
        phone: data.phone || '',
        ubication: data.ubication || '',
        themePrefered: data.theme_prefered || 'light',
        accent_color: data.accent_color || '#0a0'
      });
      setIsAuthenticated(true);
    }
  };

  const setupRealtimeUpdates = (userId: string) => {
    if (channelRef.current) {
      channelRef.current.unsubscribe();
      channelRef.current = null;
    }

    channelRef.current = supabase.channel('landlord-updates')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'LANDLORDS',
      filter: `id=eq.${userId}`
    }, () => fetchLandlord(userId))
    .subscribe();
  };

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          await fetchLandlord(session.user.id);
          setupRealtimeUpdates(session.user.id);
        }
        if (event === 'SIGNED_OUT') {
          if (channelRef.current) {
            channelRef.current.unsubscribe();
            channelRef.current = null;
          }
          resetLandlord();
        }
      }
    );

    const initializeSession = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await fetchLandlord(user.id);
        setupRealtimeUpdates(user.id);
      }
    };

    initializeSession();

    return () => {
      authListener?.subscription.unsubscribe();
      if (channelRef.current) {
        channelRef.current.unsubscribe();
      }
    };
  }, []);

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
