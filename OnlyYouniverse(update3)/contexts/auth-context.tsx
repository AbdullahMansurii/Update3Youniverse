"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { User as SupabaseUser } from "@supabase/supabase-js";
import { Database } from "@/types/database";

type Profile = Database['public']['Tables']['profiles']['Row'];

interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
  role: "student_in_india" | "student_abroad";
  bio: string;
  country: string;
  university?: string;
  course?: string;
  preferredDestination?: string;
  yearOfStudy?: string;
  phone?: string;
  currentEducationLevel?: string;
  expectedAdmissionYear?: string;
  currentCity?: string;
  profileComplete: boolean;
  isNewUser: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  updateProfile: (profile: Partial<Profile>) => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        loadUserProfile(session.user);
      }
      setIsLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          await loadUserProfile(session.user);
        } else {
          setUser(null);
        }
        setIsLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (supabaseUser: SupabaseUser) => {
    try {
      console.log('🔍 Loading profile for user:', supabaseUser.id);
      
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', supabaseUser.id)
        .single();

      console.log('📊 Profile query result:', { profile, error });
      if (error) {
        if (error.code === 'PGRST116') {
          console.log('⚠️ No profile found, creating new profile for user');
          // Profile doesn't exist, create one
          const newProfile = {
            id: supabaseUser.id,
            email: supabaseUser.email || '',
            name: supabaseUser.user_metadata?.full_name || supabaseUser.user_metadata?.name || 'User',
            role: 'student_in_india' as const,
            country: 'India',
            bio: '',
            profile_completed: false,
            is_new_user: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };

          const { data: createdProfile, error: createError } = await supabase
            .from('profiles')
            .insert(newProfile)
            .select()
            .single();

          if (createError) {
            console.error('Error creating profile:', createError);
            return;
          }

          console.log('✅ New profile created successfully:', createdProfile);

          // Use the created profile
          if (createdProfile) {
            setUser({
              id: createdProfile.id,
              name: createdProfile.name,
              email: createdProfile.email,
              image: createdProfile.image_url || undefined,
              role: createdProfile.role,
              bio: createdProfile.bio || '',
              country: createdProfile.country,
              university: createdProfile.university || undefined,
              course: createdProfile.course || undefined,
              preferredDestination: createdProfile.preferred_destination || undefined,
              yearOfStudy: createdProfile.year_of_study || undefined,
             phone: createdProfile.phone || undefined,
             currentEducationLevel: createdProfile.current_education_level || undefined,
             expectedAdmissionYear: createdProfile.expected_admission_year || undefined,
             currentCity: createdProfile.current_city || undefined,
              profileComplete: createdProfile.profile_completed || false,
              isNewUser: createdProfile.is_new_user !== false, // Default to true for new users
            });
          }
          return;
        } else {
          console.error('Error loading profile:', error);
          return;
        }
      }

      if (profile) {
        console.log('✅ Existing profile loaded successfully:', profile);
        
        setUser({
          id: profile.id,
          name: profile.name,
          email: profile.email,
          image: profile.image_url || undefined,
          role: profile.role,
          bio: profile.bio || '',
          country: profile.country,
          university: profile.university || undefined,
          course: profile.course || undefined,
          preferredDestination: profile.preferred_destination || undefined,
          yearOfStudy: profile.year_of_study || undefined,
          phone: profile.phone || undefined,
          currentEducationLevel: profile.current_education_level || undefined,
          expectedAdmissionYear: profile.expected_admission_year || undefined,
          currentCity: profile.current_city || undefined,
          profileComplete: profile.profile_completed || false,
          isNewUser: profile.is_new_user !== false, // Default to true if not set
        });
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          }
        }
      });
      
      if (error) throw error;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
      });
      if (error) throw error;
    } catch (error) {
      console.error('Google login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const updateProfile = async (profileUpdate: Partial<Profile>) => {
    if (!user) return;
    
    try {
      console.log('🔄 Updating profile with data:', profileUpdate);
      
      const { error } = await supabase
        .from('profiles')
        .update({
          ...profileUpdate,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);
      
      if (error) {
        console.error('❌ Profile update error:', error);
        throw error;
      }
      
      console.log('✅ Profile updated successfully');
      
      // Update local state
      setUser(prev => {
        if (!prev) return null;
        
        const updatedUser = {
          ...prev,
          name: profileUpdate.name || prev.name,
          bio: profileUpdate.bio || prev.bio,
          country: profileUpdate.country || prev.country,
          university: profileUpdate.university || prev.university,
          course: profileUpdate.course || prev.course,
          yearOfStudy: profileUpdate.year_of_study || prev.yearOfStudy,
          preferredDestination: profileUpdate.preferred_destination || prev.preferredDestination,
          phone: profileUpdate.phone || prev.phone,
          currentEducationLevel: profileUpdate.current_education_level || prev.currentEducationLevel,
          expectedAdmissionYear: profileUpdate.expected_admission_year || prev.expectedAdmissionYear,
          currentCity: profileUpdate.current_city || prev.currentCity,
        };
        
        console.log('🔄 Updated user state:', updatedUser);
        return updatedUser;
      });
      
    } catch (error) {
      console.error('Profile update error:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      loginWithGoogle,
      register,
      logout,
      updateProfile,
      isLoading
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}