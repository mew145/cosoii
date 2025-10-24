// =============================================
// STORE GLOBAL CON ZUSTAND
// Sistema de Gestión de Riesgos COSO II + ISO 27001
// =============================================

import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { Database } from '@/lib/supabase/types'

// Tipos de usuario y sesión
type Usuario = Database['public']['Tables']['usuarios']['Row']

// Estado de autenticación
interface AuthState {
  user: Usuario | null
  isLoading: boolean
  isAuthenticated: boolean
  setUser: (user: Usuario | null) => void
  setLoading: (loading: boolean) => void
  logout: () => void
}

// Estado de la aplicación
interface AppState {
  sidebarCollapsed: boolean
  currentModule: 'coso' | 'iso27001' | 'dashboard'
  notifications: Notification[]
  setSidebarCollapsed: (collapsed: boolean) => void
  setCurrentModule: (module: 'coso' | 'iso27001' | 'dashboard') => void
  addNotification: (notification: Omit<Notification, 'id'>) => void
  removeNotification: (id: string) => void
}

// Tipo de notificación
interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string
  timestamp: Date
}

// Store de autenticación
export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      set => ({
        user: null,
        isLoading: false,
        isAuthenticated: false,
        setUser: user =>
          set({
            user,
            isAuthenticated: !!user,
          }),
        setLoading: isLoading => set({ isLoading }),
        logout: () =>
          set({
            user: null,
            isAuthenticated: false,
          }),
      }),
      {
        name: 'auth-storage',
        partialize: state => ({
          user: state.user,
          isAuthenticated: state.isAuthenticated,
        }),
      }
    ),
    {
      name: 'auth-store',
    }
  )
)

// Store de la aplicación
export const useAppStore = create<AppState>()(
  devtools(
    persist(
      set => ({
        sidebarCollapsed: false,
        currentModule: 'dashboard',
        notifications: [],
        setSidebarCollapsed: sidebarCollapsed => set({ sidebarCollapsed }),
        setCurrentModule: currentModule => set({ currentModule }),
        addNotification: notification =>
          set(state => ({
            notifications: [
              ...state.notifications,
              {
                ...notification,
                id: crypto.randomUUID(),
                timestamp: new Date(),
              },
            ],
          })),
        removeNotification: id =>
          set(state => ({
            notifications: state.notifications.filter(n => n.id !== id),
          })),
      }),
      {
        name: 'app-storage',
        partialize: state => ({
          sidebarCollapsed: state.sidebarCollapsed,
          currentModule: state.currentModule,
        }),
      }
    ),
    {
      name: 'app-store',
    }
  )
)

// Hook para notificaciones
export const useNotifications = () => {
  const { notifications, addNotification, removeNotification } = useAppStore()

  const showSuccess = (title: string, message: string) => {
    addNotification({ type: 'success', title, message, timestamp: new Date() })
  }

  const showError = (title: string, message: string) => {
    addNotification({ type: 'error', title, message, timestamp: new Date() })
  }

  const showWarning = (title: string, message: string) => {
    addNotification({ type: 'warning', title, message, timestamp: new Date() })
  }

  const showInfo = (title: string, message: string) => {
    addNotification({ type: 'info', title, message, timestamp: new Date() })
  }

  return {
    notifications,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    removeNotification,
  }
}

// Exportar tipos para uso en otros archivos
export type { Usuario, Notification, AuthState, AppState }
