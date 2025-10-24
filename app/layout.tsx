import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import { ThemeProvider } from 'next-themes'
import './globals.css'

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : 'http://localhost:3000'

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: 'Delta Consult LTDA - Gestión Integral de Riesgos',
  description: 'Plataforma especializada en gestión de riesgos empresariales con marcos COSO II e ISO 27001. Consultoría profesional en seguridad de la información.',
  keywords: ['gestión de riesgos', 'COSO II', 'ISO 27001', 'consultoría empresarial', 'seguridad información', 'Delta Consult'],
  authors: [{ name: 'Delta Consult LTDA' }],
  creator: 'Delta Consult LTDA',
  publisher: 'Delta Consult LTDA',
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: 'website',
    locale: 'es_ES',
    url: defaultUrl,
    title: 'Delta Consult LTDA - Gestión Integral de Riesgos',
    description: 'Especialistas en gestión de riesgos empresariales y seguridad de la información',
    siteName: 'Delta Consult LTDA',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Delta Consult LTDA - Gestión Integral de Riesgos',
    description: 'Especialistas en gestión de riesgos empresariales y seguridad de la información',
  },
}

const geistSans = Geist({
  variable: '--font-geist-sans',
  display: 'swap',
  subsets: ['latin'],
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${geistSans.className} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
