import { createBrowserRouter, Navigate } from 'react-router';
import Root from './components/Root';
import Login from './components/Login';
import Register from './components/Register';
import Home from './components/Home';
import AddCommerce from './components/AddCommerce';
import AddProduct from './components/AddProduct';
import Search from './components/Search';
import Profile from './components/Profile';
import Map from './components/Map';
import Admin from './components/Admin';
import NotFound from './components/NotFound';
import EditCommerce from './components/EditCommerce';
import EditProduct from './components/EditProduct';

// GRASP: Controller - la definición de rutas actúa como controlador de navegación de la aplicación.
// GOF: Facade - `createBrowserRouter` simplifica la creación de rutas complejas.
export const router = createBrowserRouter([
  {
    path: '/',
    Component: Root,
    children: [
      { index: true, element: <Navigate to="/login" replace /> },
      { path: 'login', Component: Login },
      { path: 'register', Component: Register },
      { path: 'home', Component: Home },
      { path: 'comercios/nuevo', Component: AddCommerce },
      { path: 'productos/nuevo', Component: AddProduct },
      { path: 'buscar', Component: Search },
      { path: 'perfil', Component: Profile },
      { path: 'mapa', Component: Map },
      { path: 'admin', Component: Admin },
      { path: '*', Component: NotFound },
      { path: 'comercio/edit/:id', Component: EditCommerce },
      { path: 'producto/edit/:id', Component: EditProduct }
    ],
  },
]);
