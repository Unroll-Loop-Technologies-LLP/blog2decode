import { supabase } from '../lib/supabase';

export const subscriptionService = {
  // Subscribe to newsletter
  async subscribe(email: string): Promise<void> {
    const { error } = await supabase
      .from('subscriptions')
      .insert({ email });

    if (error) {
      if (error.code === '23505') {
        throw new Error('This email is already subscribed');
      }
      throw error;
    }
  },

  // Get all subscriptions (admin only)
  async getSubscriptions() {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },
};
