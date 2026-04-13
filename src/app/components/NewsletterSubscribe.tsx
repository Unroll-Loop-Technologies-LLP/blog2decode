import { useState } from 'react';
import { subscriptionService } from '../../services/subscription.service';
import { Mail } from 'lucide-react';
import { toast } from 'sonner';

export function NewsletterSubscribe() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      await subscriptionService.subscribe(email);
      toast.success('Successfully subscribed to newsletter!');
      setEmail('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to subscribe');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 rounded-lg p-8 text-center">
      <Mail className="w-12 h-12 mx-auto mb-4 text-gray-400" />
      <h3 className="font-bold text-xl mb-2">Subscribe to our newsletter</h3>
      <p className="text-gray-600 mb-6">
        Get the latest articles delivered straight to your inbox.
      </p>
      <form onSubmit={handleSubmit} className="max-w-md mx-auto flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
        >
          {loading ? 'Subscribing...' : 'Subscribe'}
        </button>
      </form>
    </div>
  );
}
