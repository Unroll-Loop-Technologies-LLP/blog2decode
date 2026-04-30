import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';
import { portalId, supabase } from '../../lib/supabase';
import { subscriptionService } from '../../services/subscription.service';
import type { User, Subscription } from '../../types';
import { Users, Mail, Loader2, Save, KeyRound, Settings, UserCheck, UserX } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

type PortalUser = User & {
  is_active: boolean;
};

export function AdminDashboard() {
  const { isAdmin, user: currentUser, updateProfile, sendPasswordResetEmail, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'users' | 'subscriptions' | 'account'>('users');
  const [users, setUsers] = useState<PortalUser[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingUserId, setSavingUserId] = useState<string | null>(null);
  const [resettingUserId, setResettingUserId] = useState<string | null>(null);
  const [updatingAccessUserId, setUpdatingAccessUserId] = useState<string | null>(null);
  const [userNames, setUserNames] = useState<Record<string, string>>({});
  const [accountName, setAccountName] = useState('');
  const [accountEmail, setAccountEmail] = useState('');
  const [savingAccount, setSavingAccount] = useState(false);

  useEffect(() => {
    if (authLoading) return;

    if (!isAdmin) {
      navigate('/');
      return;
    }
    loadData();
  }, [authLoading, isAdmin, activeTab]);

  useEffect(() => {
    setAccountName(currentUser?.name || '');
    setAccountEmail(currentUser?.email || '');
  }, [currentUser]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'users') {
        const { data, error } = await supabase
          .from('portal_user_access')
          .select(`
            is_active,
            user:users(*)
          `)
          .eq('portal_id', portalId)
          .order('created_at', { ascending: false });

        if (error) throw error;

        const nextUsers = (data || [])
          .map((row: any) => (row.user ? { ...row.user, is_active: row.is_active } : null))
          .filter(Boolean) as PortalUser[];

        setUsers(nextUsers);
        setUserNames(
          nextUsers.reduce<Record<string, string>>((acc, user) => {
            acc[user.id] = user.name || '';
            return acc;
          }, {})
        );
      } else if (activeTab === 'subscriptions') {
        const data = await subscriptionService.getSubscriptions();
        setSubscriptions(data);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUserRole = async (userId: string, newRole: 'reader' | 'author' | 'admin') => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ role: newRole })
        .eq('id', userId);

      if (error) throw error;

      toast.success('User role updated successfully!');
      await loadData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update user role');
    }
  };

  const handleUpdateUserName = async (userId: string) => {
    setSavingUserId(userId);
    try {
      const { error } = await supabase
        .from('users')
        .update({ name: userNames[userId]?.trim() || null })
        .eq('id', userId);

      if (error) throw error;

      toast.success('User name updated successfully!');
      await loadData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update user name');
    } finally {
      setSavingUserId(null);
    }
  };

  const handleSendReset = async (email: string, userId: string) => {
    setResettingUserId(userId);
    try {
      await sendPasswordResetEmail(email);
      toast.success('Password reset email sent successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to send password reset email');
    } finally {
      setResettingUserId(null);
    }
  };

  const handleSetUserActive = async (userId: string, isActive: boolean) => {
    if (userId === currentUser?.id && !isActive) {
      toast.error('You cannot deactivate your own portal access.');
      return;
    }

    setUpdatingAccessUserId(userId);
    try {
      const { error } = await supabase
        .from('portal_user_access')
        .update({ is_active: isActive })
        .eq('portal_id', portalId)
        .eq('user_id', userId);

      if (error) throw error;

      toast.success(isActive ? 'User activated for this portal.' : 'User deactivated for this portal.');
      await loadData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update portal access');
    } finally {
      setUpdatingAccessUserId(null);
    }
  };

  const handleUpdateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingAccount(true);
    try {
      await updateProfile({
        name: accountName,
        email: accountEmail,
      });

      toast.success(
        accountEmail !== currentUser?.email
          ? 'Account updated. Check your new email inbox to confirm the email change.'
          : 'Account updated successfully!'
      );
    } catch (error: any) {
      toast.error(error.message || 'Failed to update account');
    } finally {
      setSavingAccount(false);
    }
  };

  const tabs = [
    { id: 'users' as const, label: 'Users', icon: Users },
    { id: 'subscriptions' as const, label: 'Subscriptions', icon: Mail },
    { id: 'account' as const, label: 'Account', icon: Settings },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="font-bold text-3xl mb-8">Admin Dashboard</h1>

      <div className="border-b mb-8">
        <div className="flex gap-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 pb-4 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-black font-medium'
                  : 'border-transparent text-gray-500 hover:text-black'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {authLoading || loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      ) : (
        <>
          {activeTab === 'users' && (
            <div>
              <div className="bg-white border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-medium">Name</th>
                      <th className="px-6 py-3 text-left text-sm font-medium">Email</th>
                      <th className="px-6 py-3 text-left text-sm font-medium">Role</th>
                      <th className="px-6 py-3 text-left text-sm font-medium">Portal Access</th>
                      <th className="px-6 py-3 text-left text-sm font-medium">Joined</th>
                      <th className="px-6 py-3 text-left text-sm font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={userNames[user.id] ?? ''}
                              onChange={(e) =>
                                setUserNames((current) => ({
                                  ...current,
                                  [user.id]: e.target.value,
                                }))
                              }
                              className="w-full max-w-xs px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
                            />
                            <button
                              onClick={() => handleUpdateUserName(user.id)}
                              disabled={savingUserId === user.id}
                              className="inline-flex items-center gap-1 px-3 py-2 border rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50"
                            >
                              <Save className="w-4 h-4" />
                              Save
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-600">{user.email}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-sm ${
                              user.role === 'admin'
                                ? 'bg-purple-100 text-purple-700'
                                : user.role === 'author'
                                  ? 'bg-blue-100 text-blue-700'
                                  : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-sm ${
                              user.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {user.is_active ? 'Active' : 'Deactivated'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {format(new Date(user.created_at), 'MMM d, yyyy')}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-2">
                            <select
                              value={user.role}
                              onChange={(e) =>
                                handleUpdateUserRole(user.id, e.target.value as 'reader' | 'author' | 'admin')
                              }
                              className="px-3 py-1 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-black"
                            >
                              <option value="reader">Reader</option>
                              <option value="author">Author</option>
                              <option value="admin">Admin</option>
                            </select>
                            {user.email && (
                              <button
                                onClick={() => handleSendReset(user.email!, user.id)}
                                disabled={resettingUserId === user.id}
                                className="inline-flex items-center gap-1 px-3 py-1 border rounded text-sm hover:bg-gray-50 disabled:opacity-50"
                              >
                                <KeyRound className="w-4 h-4" />
                                Reset Password
                              </button>
                            )}
                            <button
                              onClick={() => handleSetUserActive(user.id, !user.is_active)}
                              disabled={updatingAccessUserId === user.id || (user.id === currentUser?.id && user.is_active)}
                              className={`inline-flex items-center gap-1 px-3 py-1 border rounded text-sm transition-colors disabled:opacity-50 ${
                                user.is_active
                                  ? 'text-red-700 hover:bg-red-50'
                                  : 'text-green-700 hover:bg-green-50'
                              }`}
                              title={
                                user.id === currentUser?.id && user.is_active
                                  ? 'You cannot deactivate your own portal access'
                                  : undefined
                              }
                            >
                              {user.is_active ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                              {user.is_active ? 'Deactivate' : 'Activate'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {users.length === 0 && (
                  <div className="text-center py-8 text-gray-500">No users found</div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'subscriptions' && (
            <div>
              <div className="bg-white border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-medium">Email</th>
                      <th className="px-6 py-3 text-left text-sm font-medium">Subscribed At</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {subscriptions.map((sub) => (
                      <tr key={sub.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">{sub.email}</td>
                        <td className="px-6 py-4 text-gray-600">
                          {format(new Date(sub.created_at), 'MMM d, yyyy HH:mm')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {subscriptions.length === 0 && (
                  <div className="text-center py-8 text-gray-500">No subscriptions yet</div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'account' && (
            <div className="max-w-2xl">
              <div className="bg-white border rounded-2xl p-8">
                <h2 className="font-bold text-2xl mb-2">Admin Account Settings</h2>
                <p className="text-gray-600 mb-6">
                  Update your display name, request an email change, or send yourself a password reset email.
                </p>

                <form onSubmit={handleUpdateAccount} className="space-y-5">
                  <div>
                    <label htmlFor="accountName" className="block text-sm font-medium mb-2">
                      Display Name
                    </label>
                    <input
                      id="accountName"
                      type="text"
                      value={accountName}
                      onChange={(e) => setAccountName(e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>

                  <div>
                    <label htmlFor="accountEmail" className="block text-sm font-medium mb-2">
                      Email Address
                    </label>
                    <input
                      id="accountEmail"
                      type="email"
                      value={accountEmail}
                      onChange={(e) => setAccountEmail(e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                    />
                    <p className="mt-2 text-sm text-gray-500">
                      Email changes require confirmation from the new inbox before they fully take effect.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <button
                      type="submit"
                      disabled={savingAccount}
                      className="px-5 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
                    >
                      {savingAccount ? 'Saving...' : 'Save Account Changes'}
                    </button>

                    {currentUser?.email && (
                      <button
                        type="button"
                        onClick={() => handleSendReset(currentUser.email!, currentUser.id)}
                        disabled={resettingUserId === currentUser.id}
                        className="px-5 py-3 border rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                      >
                        Send Password Reset Email
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
