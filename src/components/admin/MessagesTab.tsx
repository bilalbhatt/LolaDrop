import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useUserMessages, useUpdateUserMessage } from '@/hooks/useFeedback';
import { UserMessage } from '@/lib/types';
import { format } from 'date-fns';
import { MessageCircle, Send, ShoppingCart } from 'lucide-react';

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  reviewed: 'bg-blue-100 text-blue-800',
  processed: 'bg-green-100 text-green-800',
};

export function MessagesTab() {
  const { data: messages, isLoading } = useUserMessages();
  const updateMessage = useUpdateUserMessage();
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [statusFilter, setStatusFilter] = useState<string>('all');

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-xl" />
        ))}
      </div>
    );
  }

  const filteredMessages = messages?.filter(m => 
    statusFilter === 'all' || m.status === statusFilter
  ) || [];

  const handleStatusChange = (id: string, status: UserMessage['status']) => {
    updateMessage.mutate({ id, status });
  };

  const handleRespond = (id: string) => {
    const response = responses[id];
    if (!response?.trim()) return;
    
    updateMessage.mutate({ 
      id, 
      status: 'reviewed',
      adminResponse: response 
    });
    setResponses(prev => ({ ...prev, [id]: '' }));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Messages</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="reviewed">Reviewed</SelectItem>
            <SelectItem value="processed">Processed</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-muted-foreground text-sm">
          {filteredMessages.length} messages
        </span>
      </div>

      {filteredMessages.length === 0 ? (
        <Card className="p-8 text-center">
          <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No messages found</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredMessages.map((message) => (
            <Card key={message.id}>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {message.is_custom_order && (
                      <Badge className="bg-purple-100 text-purple-800">
                        <ShoppingCart className="h-3 w-3 mr-1" />
                        Custom Order
                      </Badge>
                    )}
                    <Badge className={statusColors[message.status]}>
                      {message.status}
                    </Badge>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(message.created_at), 'PPp')}
                  </span>
                </div>

                <p className="text-sm">{message.message}</p>

                {message.admin_response && (
                  <div className="bg-muted p-3 rounded-lg">
                    <span className="text-xs font-medium text-muted-foreground">Admin Response:</span>
                    <p className="text-sm mt-1">{message.admin_response}</p>
                  </div>
                )}

                {message.status !== 'processed' && (
                  <div className="flex items-end gap-2">
                    <div className="flex-1">
                      <Textarea
                        placeholder="Write a response..."
                        value={responses[message.id] || ''}
                        onChange={(e) => setResponses(prev => ({ 
                          ...prev, 
                          [message.id]: e.target.value 
                        }))}
                        className="min-h-[60px]"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button 
                        size="sm"
                        onClick={() => handleRespond(message.id)}
                        disabled={!responses[message.id]?.trim()}
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatusChange(message.id, 'processed')}
                      >
                        Mark Done
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
