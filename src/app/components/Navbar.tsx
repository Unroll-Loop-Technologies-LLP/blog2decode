import { Link, useNavigate } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';
import { PenSquare, LogOut, User, Settings } from 'lucide-react';
import icon from '../../res/icon.png';
import { toast } from 'sonner';

export function Navbar() {
  const { user, signOut, isAuthor, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Signed out successfully.');
      window.location.assign('/');
    } catch (error: any) {
      toast.error(error.message || 'Could not sign out cleanly, but your local session was cleared.');
      navigate('/');
    }
  };

  return (
    <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-3">
              <img src={icon} alt="CyberSphere logo" className="h-9 w-9 rounded-lg object-cover" />
             
            </Link>
            <div className="hidden md:flex items-center gap-6">
              <Link to="/" className="hover:text-gray-600 transition-colors">
                Home
              </Link>
              <Link to="/category/technology" className="hover:text-gray-600 transition-colors">
                Technology
              </Link>
              <Link to="/category/design" className="hover:text-gray-600 transition-colors">
                Design
              </Link>
              <Link to="/category/business" className="hover:text-gray-600 transition-colors">
                Business
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <>
                {isAuthor && (
                  <Link
                    to="/author"
                    className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-full hover:bg-gray-800 transition-colors"
                  >
                    <PenSquare className="w-4 h-4" />
                    <span className="hidden sm:inline">Write</span>
                  </Link>
                )}
                {isAdmin && (
                  <Link
                    to="/admin"
                    className="flex items-center gap-2 px-4 py-2 border rounded-full hover:bg-gray-50 transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                    <span className="hidden sm:inline">Admin</span>
                  </Link>
                )}
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4" />
                  </div>
                  <span className="hidden md:inline text-sm">{user.name}</span>
                </div>
                <button
                  onClick={handleSignOut}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 hover:bg-gray-50 rounded-full transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 bg-black text-white rounded-full hover:bg-gray-800 transition-colors"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
