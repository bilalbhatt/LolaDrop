import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Feedback, UserMessage } from '@/lib/types';
import { toast } from 'sonner';

export function useFeedback() {
  return useQuery({
    queryKey: ['feedback'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('feedback')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Feedback[];
    },
  });
}

export function useUserFeedback(userId: string | undefined) {
  return useQuery({
    queryKey: ['feedback', userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from('feedback')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Feedback[];
    },
    enabled: !!userId,
  });
}

export function useCreateFeedback() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (feedbackData: {
      userId: string;
      type: Feedback['type'];
      message: string;
    }) => {
      const { error } = await supabase
        .from('feedback')
        .insert({
          user_id: feedbackData.userId,
          type: feedbackData.type,
          message: feedbackData.message,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedback'] });
      toast.success('Feedback submitted successfully!');
    },
    onError: (error) => {
      console.error('Error submitting feedback:', error);
      toast.error('Failed to submit feedback');
    },
  });
}

export function useUpdateFeedback() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status, adminResponse }: { 
      id: string; 
      status?: Feedback['status']; 
      adminResponse?: string;
    }) => {
      const updates: any = {};
      if (status) updates.status = status;
      if (adminResponse) updates.admin_response = adminResponse;

      const { error } = await supabase
        .from('feedback')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedback'] });
      toast.success('Feedback updated');
    },
    onError: (error) => {
      console.error('Error updating feedback:', error);
      toast.error('Failed to update feedback');
    },
  });
}

// User Messages hooks
export function useUserMessages() {
  return useQuery({
    queryKey: ['user-messages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as UserMessage[];
    },
  });
}

export function useMyMessages(userId: string | undefined) {
  return useQuery({
    queryKey: ['my-messages', userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from('user_messages')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as UserMessage[];
    },
    enabled: !!userId,
  });
}

export function useCreateUserMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (messageData: {
      userId: string;
      message: string;
      isCustomOrder: boolean;
    }) => {
      const { error } = await supabase
        .from('user_messages')
        .insert({
          user_id: messageData.userId,
          message: messageData.message,
          is_custom_order: messageData.isCustomOrder,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-messages'] });
      queryClient.invalidateQueries({ queryKey: ['my-messages'] });
      toast.success('Message sent successfully!');
    },
    onError: (error) => {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    },
  });
}

export function useUpdateUserMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status, adminResponse }: { 
      id: string; 
      status?: UserMessage['status']; 
      adminResponse?: string;
    }) => {
      const updates: any = {};
      if (status) updates.status = status;
      if (adminResponse) updates.admin_response = adminResponse;

      const { error } = await supabase
        .from('user_messages')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-messages'] });
      toast.success('Message updated');
    },
    onError: (error) => {
      console.error('Error updating message:', error);
      toast.error('Failed to update message');
    },
  });
}
