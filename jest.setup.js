// Optional: configure or set up a testing framework before each test.
// If you delete this file, remove `setupFilesAfterEnv` from `jest.config.js`

// Used for __tests__/testing-library.js
// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    }
  },
  useSearchParams() {
    return new URLSearchParams()
  },
  usePathname() {
    return '/'
  },
}))

// Mock Supabase (commented out until client is implemented)
// jest.mock('@/lib/supabase/client', () => ({
//   supabase: {
//     auth: {
//       getUser: jest.fn(),
//       signInWithPassword: jest.fn(),
//       signUp: jest.fn(),
//       signOut: jest.fn(),
//     },
//     from: jest.fn(() => ({
//       select: jest.fn(() => ({
//         eq: jest.fn(() => ({
//           single: jest.fn(),
//         })),
//       })),
//       insert: jest.fn(),
//       update: jest.fn(),
//       delete: jest.fn(),
//     })),
//   },
// }))

// Mock environment variables
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = 'test-key'
