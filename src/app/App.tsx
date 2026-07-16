import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Home from '../shared/routes/Home'
import HostShell from '../shared/routes/HostShell'
import JoinShell from '../shared/routes/JoinShell'
import PhoneHome from '../shared/routes/PhoneHome'

// Three routes, one codebase:
//   /            home / game grid (TV)
//   /host/:code  TV board — lobby, then dispatches to the active game module
//   /join/:code  phone controller — join, then dispatches to the game module
//   /phone       phone home base — profile + scan-to-join
const router = createBrowserRouter([
  { path: '/', element: <Home /> },
  { path: '/phone', element: <PhoneHome /> },
  { path: '/host/:code', element: <HostShell /> },
  { path: '/join/:code', element: <JoinShell /> },
  { path: '*', element: <Home /> },
])

export default function App() {
  return <RouterProvider router={router} />
}
