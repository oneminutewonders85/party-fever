import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Home from './routes/Home'
import Host from './routes/Host'
import Join from './routes/Join'

// Three routes, one codebase:
//   /            home / game grid (TV)
//   /host/:code  TV board (lobby now; gameplay in M2)
//   /join/:code  phone controller
const router = createBrowserRouter([
  { path: '/', element: <Home /> },
  { path: '/host/:code', element: <Host /> },
  { path: '/join/:code', element: <Join /> },
  { path: '*', element: <Home /> },
])

export default function App() {
  return <RouterProvider router={router} />
}
