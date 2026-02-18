import { createRouter, createRoute, createRootRoute, RouterProvider, Outlet } from '@tanstack/react-router';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from 'next-themes';
import Layout from './components/Layout';
import StorefrontPage from './pages/StorefrontPage';
import ProductDetailPage from './pages/ProductDetailPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import BuyerLibraryPage from './pages/BuyerLibraryPage';
import CategoryStorefrontPage from './pages/CategoryStorefrontPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';

const rootRoute = createRootRoute({
  component: () => (
    <Layout>
      <Outlet />
    </Layout>
  ),
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: StorefrontPage,
});

const productRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/product/$productId',
  component: ProductDetailPage,
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin',
  component: AdminDashboardPage,
});

const libraryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/library',
  component: BuyerLibraryPage,
});

const categoryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/category/$categoryId',
  component: CategoryStorefrontPage,
});

const aboutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/about',
  component: AboutPage,
});

const contactRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/contact',
  component: ContactPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  productRoute,
  adminRoute,
  libraryRoute,
  categoryRoute,
  aboutRoute,
  contactRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <RouterProvider router={router} />
      <Toaster />
    </ThemeProvider>
  );
}
