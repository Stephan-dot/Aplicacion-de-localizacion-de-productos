import { Outlet, useLocation } from 'react-router';
import { AppProvider } from '../contexts/AppContext';
import Navigation from './Navigation';

// GRASP: Controller - el layout Root decide si mostrar la navegación y envuelve la app con AppProvider.
export default function Root() {
  const location = useLocation();
  const hideNav = location.pathname === '/login' || location.pathname === '/register' || location.pathname === '/';

  return (
    <AppProvider>
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50">
        {!hideNav && <Navigation />}
        <main className={hideNav ? 'h-screen' : 'pt-16 pb-20'}>
          <Outlet />
        </main>
      </div>
    </AppProvider>
  );
}
