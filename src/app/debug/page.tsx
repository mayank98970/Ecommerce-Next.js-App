"use client";

import React from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

interface UserData {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    hasRoleField: boolean;
    createdAt: string;
    updatedAt: string;
  };
  session: {
    id: string;
    name: string;
    email: string;
    role: string;
    hasRoleField: boolean;
  };
}

interface RoleStatus {
  totalUsers: number;
  usersWithRole: number;
  usersWithoutRole: number;
  adminUsers: number;
  regularUsers: number;
  needsFix: boolean;
}

export default function DebugPage() {
  const { data: session, status } = useSession();
  const [userData, setUserData] = React.useState<UserData | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [roleStatus, setRoleStatus] = React.useState<RoleStatus | null>(null);
  const [fixingRoles, setFixingRoles] = React.useState(false);

  const fetchUserData = async () => {
    if (!session) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/debug/user');
      if (response.ok) {
        const data = await response.json();
        setUserData(data);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkRoleStatus = async () => {
    try {
      const response = await fetch('/api/admin/fix-roles');
      if (response.ok) {
        const data = await response.json();
        setRoleStatus(data);
      }
    } catch (error) {
      console.error('Error checking role status:', error);
    }
  };

  const fixRoles = async () => {
    setFixingRoles(true);
    try {
      const response = await fetch('/api/admin/fix-roles', {
        method: 'POST'
      });
      if (response.ok) {
        const data = await response.json();
        setRoleStatus(data);
        // Refresh user data after fixing roles
        setTimeout(() => {
          fetchUserData();
        }, 1000);
      }
    } catch (error) {
      console.error('Error fixing roles:', error);
    } finally {
      setFixingRoles(false);
    }
  };

  React.useEffect(() => {
    if (session) {
      fetchUserData();
      checkRoleStatus();
    }
  }, [session]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Session Debug Info</h1>
        
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <h2 className="text-xl font-semibold text-white mb-4">Current Session Status</h2>
          
          <div className="space-y-4">
            <div>
              <span className="text-gray-300">Status: </span>
              <span className={`font-semibold ${status === 'loading' ? 'text-yellow-400' : status === 'authenticated' ? 'text-green-400' : 'text-red-400'}`}>
                {status}
              </span>
            </div>

            {session ? (
              <div className="space-y-4">
                <div>
                  <span className="text-gray-300">User ID: </span>
                  <span className="text-white font-mono">{session.user?.id}</span>
                </div>
                
                <div>
                  <span className="text-gray-300">Name: </span>
                  <span className="text-white">{session.user?.name}</span>
                </div>
                
                <div>
                  <span className="text-gray-300">Email: </span>
                  <span className="text-white">{session.user?.email}</span>
                </div>
                
                <div>
                  <span className="text-gray-300">Role: </span>
                  <span className={`font-semibold ${session.user?.role === 'admin' ? 'text-green-400' : 'text-red-400'}`}>
                    {session.user?.role || 'Not set'}
                  </span>
                </div>

                <div className="mt-6 p-4 bg-white/5 rounded-lg">
                  <h3 className="text-lg font-semibold text-white mb-2">Full Session Object:</h3>
                  <pre className="text-sm text-gray-300 overflow-auto">
                    {JSON.stringify(session, null, 2)}
                  </pre>
                </div>

                <div className="mt-6 p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                  <h3 className="text-lg font-semibold text-blue-400 mb-2">Admin Access Check:</h3>
                  <div className="space-y-2">
                    <div>
                      <span className="text-gray-300">Is Admin: </span>
                      <span className={`font-semibold ${session.user?.role === 'admin' ? 'text-green-400' : 'text-red-400'}`}>
                        {session.user?.role === 'admin' ? 'YES' : 'NO'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-300">Can Access Admin Dashboard: </span>
                      <span className={`font-semibold ${session.user?.role === 'admin' ? 'text-green-400' : 'text-red-400'}`}>
                        {session.user?.role === 'admin' ? 'YES' : 'NO'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-300">Admin Button Should Show: </span>
                      <span className={`font-semibold ${session.user?.role === 'admin' ? 'text-green-400' : 'text-red-400'}`}>
                        {session.user?.role === 'admin' ? 'YES' : 'NO'}
                      </span>
                    </div>
                  </div>
                </div>

                {userData && (
                  <div className="mt-6 p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                    <h3 className="text-lg font-semibold text-green-400 mb-2">Database User Info:</h3>
                    <div className="space-y-2">
                      <div>
                        <span className="text-gray-300">Database Role: </span>
                        <span className={`font-semibold ${userData.user.role === 'admin' ? 'text-green-400' : 'text-red-400'}`}>
                          {userData.user.role || 'Not set'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-300">Has Role Field: </span>
                        <span className={`font-semibold ${userData.user.hasRoleField ? 'text-green-400' : 'text-red-400'}`}>
                          {userData.user.hasRoleField ? 'YES' : 'NO'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-300">Session Has Role Field: </span>
                        <span className={`font-semibold ${userData.session.hasRoleField ? 'text-green-400' : 'text-red-400'}`}>
                          {userData.session.hasRoleField ? 'YES' : 'NO'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="mt-4 p-3 bg-white/5 rounded-lg">
                      <h4 className="text-md font-semibold text-white mb-2">Database User Object:</h4>
                      <pre className="text-sm text-gray-300 overflow-auto">
                        {JSON.stringify(userData.user, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}

                {loading && (
                  <div className="mt-6 p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                    <p className="text-yellow-400">Loading database info...</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-red-400">
                No session found. Please log in first.
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <h2 className="text-xl font-semibold text-white mb-4">Troubleshooting Steps</h2>
          
          <div className="space-y-3 text-gray-300">
            <div className="flex items-start gap-2">
              <span className="text-blue-400">1.</span>
              <span>Make sure you've visited <code className="bg-black/20 px-2 py-1 rounded">/admin-setup</code> and set your role to admin</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-400">2.</span>
              <span>Log out completely and log back in to refresh your session</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-400">3.</span>
              <span>Check that your role shows as "admin" above</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-400">4.</span>
              <span>If role is still "user", the database update may have failed</span>
            </div>
          </div>
        </div>

        {roleStatus && (
          <div className="mt-8 bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <h2 className="text-xl font-semibold text-white mb-4">Database Role Status</h2>
            <div className="space-y-2 text-gray-300">
              <div>Total Users: <span className="text-white font-semibold">{roleStatus.totalUsers}</span></div>
              <div>Users with Role: <span className="text-white font-semibold">{roleStatus.usersWithRole}</span></div>
              <div>Users without Role: <span className="text-white font-semibold">{roleStatus.usersWithoutRole}</span></div>
              <div>Admin Users: <span className="text-green-400 font-semibold">{roleStatus.adminUsers}</span></div>
              <div>Regular Users: <span className="text-blue-400 font-semibold">{roleStatus.regularUsers}</span></div>
            </div>
            
            {roleStatus.needsFix && (
              <div className="mt-4 p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                <p className="text-yellow-400 mb-3">Some users don't have role field. This needs to be fixed.</p>
                <button
                  onClick={fixRoles}
                  disabled={fixingRoles}
                  className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 disabled:bg-yellow-800 text-white rounded-lg transition-colors duration-200 font-semibold"
                >
                  {fixingRoles ? 'Fixing...' : 'Fix User Roles'}
                </button>
              </div>
            )}
          </div>
        )}

        <div className="mt-8 flex gap-4">
          <Link
            href="/admin-setup"
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors duration-200 font-semibold"
          >
            Go to Admin Setup
          </Link>
          <Link href="/" className="text-blue-400 hover:text-blue-600 underline">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
} 