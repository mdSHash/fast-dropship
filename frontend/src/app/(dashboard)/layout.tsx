import Sidebar from '@/components/Sidebar';
import ProtectedRoute from '@/components/ProtectedRoute';
import { AuthProvider } from '@/contexts/AuthContext';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <AuthProvider>
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1 lg:ml-64 p-4 lg:p-8">
            {children}
          </main>
        </div>
      </AuthProvider>
    </ProtectedRoute>
  );
}

// Made with Bob
