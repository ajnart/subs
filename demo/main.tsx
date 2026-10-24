import { ThemeProvider } from 'next-themes'
import { createRoot } from 'react-dom/client'
import { SubsApp } from '@/components/subs/app'
import { Toaster } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import '@/demo/styles.css'

const root = document.getElementById('root')
if (!root) throw new Error('Demo root element is missing')

createRoot(root).render(
  <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
    <TooltipProvider>
      <SubsApp />
      <Toaster />
    </TooltipProvider>
  </ThemeProvider>,
)
