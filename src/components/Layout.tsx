import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, PlusCircle, LogOut, User, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { logOut } from '../firebase';
import { useAuth } from '../App';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import Logo from './Logo';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function Layout() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logOut();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'New Initiative', path: '/builder', icon: PlusCircle },
  ];

  return (
    <div className="min-h-screen bg-brand-bg text-brand-ink font-sans">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-64 fixed inset-y-0 bg-white border-r border-brand-line/10 z-50">
        <div className="p-6">
          <Link to="/" className="flex items-center gap-3">
            <Logo className="w-10 h-10" />
            <h1 className="text-xl font-bold tracking-tight serif text-brand-ink">Karya Shaastra</h1>
          </Link>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                location.pathname === item.path
                  ? "bg-brand-primary text-white shadow-lg shadow-brand-primary/20"
                  : "text-brand-ink/60 hover:bg-brand-bg hover:text-brand-ink"
              )}
            >
              <item.icon size={20} />
              <span className="font-medium">{item.name}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-brand-line/10">
          <div className="flex items-center gap-3 px-4 py-3 mb-2">
            <img src={profile?.photoURL} alt="" className="w-8 h-8 rounded-full bg-brand-bg" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate text-brand-ink">{profile?.displayName}</p>
              <p className="text-xs text-brand-ink/60 truncate">{profile?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 text-brand-ink/60 hover:bg-red-50 hover:text-red-600 rounded-xl transition-colors"
          >
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between p-4 bg-white border-b border-brand-line/10 sticky top-0 z-50">
        <Link to="/" className="flex items-center gap-2">
          <Logo className="w-8 h-8" />
          <h1 className="text-lg font-bold tracking-tight serif text-brand-ink">Karya Shaastra</h1>
        </Link>
        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 text-brand-ink">
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-brand-bg z-40 pt-20 px-6">
          <nav className="space-y-4">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMenuOpen(false)}
                className={cn(
                  "flex items-center gap-4 p-4 rounded-2xl text-lg font-medium",
                  location.pathname === item.path ? "bg-brand-primary text-white" : "text-brand-ink/60"
                )}
              >
                <item.icon size={24} />
                {item.name}
              </Link>
            ))}
            <button
              onClick={handleLogout}
              className="flex items-center gap-4 w-full p-4 rounded-2xl text-lg font-medium text-red-600"
            >
              <LogOut size={24} />
              Logout
            </button>
          </nav>
        </div>
      )}

      {/* Main Content */}
      <main className="md:pl-64 min-h-screen">
        <div className="max-w-5xl mx-auto p-6 md:p-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
