import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router';
import { AuthProvider } from '../contexts/AuthContext';
import { Toaster } from 'sonner';
import { AppErrorBoundary } from './components/AppErrorBoundary';
import { Navbar } from './components/Navbar';
import { Home } from './pages/Home';
import { BlogPost } from './pages/BlogPost';
import { Category } from './pages/Category';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { AuthorDashboard } from './pages/AuthorDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { NotFound } from './pages/NotFound';
import { ResetPassword } from './pages/ResetPassword';

function AppShell() {
  const location = useLocation();

  return (
    <AppErrorBoundary resetKey={`${location.pathname}${location.search}${location.hash}`}>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route path="/category/:slug" element={<Category />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/author" element={<AuthorDashboard />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
    </AppErrorBoundary>
  );
}

export default function App() {
  useEffect(() => {
    document.title = 'CyberSphere | Securing the Sphere. Powering Innovation. Scaling the Future';
  }, []);

  return (
    <BrowserRouter>
      <AuthProvider>
        <AppShell />
        <Toaster position="top-right" richColors />
      </AuthProvider>
    </BrowserRouter>
  );
}
