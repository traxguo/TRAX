import { createBrowserRouter } from 'react-router-dom';
import Splash from './components/Splash';
import Dashboard from './components/Dashboard';
import Members from './components/Members';
import MemberDetail from './components/MemberDetail';
import CheckIn from './components/CheckIn';

export const router = createBrowserRouter([
  { path: '/', element: <Splash /> },
  { path: '/members', element: <Members /> },
  { path: '/members/:id', element: <MemberDetail /> },
  { path: '/dashboard', element: <Dashboard /> },
  { path: '/checkin', element: <CheckIn /> },
]);
