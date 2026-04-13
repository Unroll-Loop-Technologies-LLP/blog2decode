import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { subscriptionService } from '../../services/subscription.service';
import type { User, Subscription } from '../../types';
import { Users, Mail, Tags, Folder, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

export function AdminDashboard() {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'users' | 'subscriptions' | 'categories' | 'tags'>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAdmin) {
      navigate('/');
      return;
    }
    loadData();
  }, [isAdmin, activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'users') {
        const { data } = await supabase
          .from('users')
          .select('*')
          .order('created_at', { ascending: false });
        setUsers(data || []);
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
      await supabase
        .from('users')
        .update({ role: newRole })
        .eq('id', userId);

      toast.success('User role updated successfully!');
      await loadData();
    } catch (error) {
      toast.error('Failed to update user role');
    }
  };

  const tabs = [
    { id: 'users' as const, label: 'Users', icon: Users },
    { id: 'subscriptions' as const, label: 'Subscriptions', icon: Mail },
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

      {loading ? (
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
                      <th className="px-6 py-3 text-left text-sm font-medium">Joined</th>
                      <th className="px-6 py-3 text-left text-sm font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">{user.name}</td>
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
                        <td className="px-6 py-4 text-gray-600">
                          {format(new Date(user.created_at), 'MMM d, yyyy')}
                        </td>
                        <td className="px-6 py-4">
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
        </>
      )}
    </div>
  );
}
