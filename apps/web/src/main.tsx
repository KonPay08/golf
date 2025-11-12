import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import "@fontsource/noto-sans-jp/400.css";
import "@fontsource/noto-sans-jp/500.css";
import "@fontsource/noto-sans-jp/600.css";
import "@fontsource/noto-sans-jp/700.css";
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import AudioProvider from './providers/AudioProvider'
import ScoreRegistration from './routes/score-registration'
import Home from './routes/home'

// TanStack Query の設定
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5分間
      gcTime: 1000 * 60 * 10, // 10分間
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

const router = createBrowserRouter([
  {
    path: '/',
    children: [
      { index: true, Component: Home },
      { path: 'score-registration', Component:  ScoreRegistration },
    ],
  },
])

ReactDOM.createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AudioProvider>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </AudioProvider>
  </StrictMode>,
)
