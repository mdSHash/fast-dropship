'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Home,
  Users,
  UserCog,
  Plus,
  Clock,
  CheckCircle,
  Truck,
  MessageSquare,
  DollarSign,
  Calendar,
  Lock,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

const menuItems = [
  { icon: Home, label: 'Home', path: '/dashboard' },
  { icon: Users, label: 'Clients', path: '/clients' },
  { icon: Plus, label: 'Add Order', path: '/add-order' },
  { icon: Clock, label: 'Order Pending', path: '/order-pending' },
  { icon: CheckCircle, label: 'Order Completed', path: '/order-completed' },
  { icon: Truck, label: 'Delivery', path: '/delivery' },
  { icon: MessageSquare, label: 'Chat', path: '/chat' },
  { icon: DollarSign, label: 'Budget/Transactions', path: '/transactions' },
  { icon: Calendar, label: 'Previous months', path: '/previous-months' },
];

const adminMenuItems = [
  { icon: UserCog, label: 'Users', path: '/users', adminOnly: true },
];

const bottomMenuItems = [
  { icon: Lock, label: 'Change Password', path: '/change-password' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const { isAdmin } = useAuth();

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={toggleSidebar}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg glass-effect text-white"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed left-0 top-0 h-screen w-64 glass-effect-strong
          transform transition-transform duration-300 ease-in-out z-40
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="flex flex-col h-full p-4">
          {/* Logo */}
          <div className="mb-8 mt-2">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
              Fast-Dropship
            </h1>
          </div>

          {/* Main menu */}
          <nav className="flex-1 space-y-1 overflow-y-auto">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.path;

              return (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={() => setIsOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg
                    transition-all duration-200
                    ${
                      isActive
                        ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-white border border-purple-500/30'
                        : 'text-gray-300 hover:bg-white/5 hover:text-white'
                    }
                  `}
                >
                  <Icon size={20} />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              );
            })}
            
            {/* Admin-only menu items */}
            {isAdmin && adminMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.path;

              return (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={() => setIsOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg
                    transition-all duration-200
                    ${
                      isActive
                        ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-white border border-purple-500/30'
                        : 'text-gray-300 hover:bg-white/5 hover:text-white'
                    }
                  `}
                >
                  <Icon size={20} />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Bottom menu */}
          <div className="space-y-1 pt-4 border-t border-white/10">
            {bottomMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.path;

              return (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={() => setIsOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg
                    transition-all duration-200
                    ${
                      isActive
                        ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-white border border-purple-500/30'
                        : 'text-gray-300 hover:bg-white/5 hover:text-white'
                    }
                  `}
                >
                  <Icon size={20} />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              );
            })}

            <button
              onClick={handleLogout}
              className="
                w-full flex items-center gap-3 px-4 py-3 rounded-lg
                text-gray-300 hover:bg-red-500/10 hover:text-red-400
                transition-all duration-200
              "
            >
              <LogOut size={20} />
              <span className="text-sm font-medium">Log Out</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

// Made with Bob
