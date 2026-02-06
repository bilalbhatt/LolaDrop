import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useFeedback, useUpdateFeedback } from '@/hooks/useFeedback';
import { Feedback } from '@/lib/types';
import { format } from 'date-fns';
import { MessageSquare, Send } from 'lucide-react';

const typeColors: Record<string, string> = {
  feedback: 'bg-blue-100 text-blue-800',
  suggestion: 'bg-green-100 text-green-800',
  complaint: 'bg-red-100 text-red-800',
};

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  reviewed: 'bg-blue-100 text-blue-800',
  resolved: 'bg-green-100 text-green-800',
};

export function FeedbackTab() {
  const { data: feedbackList, isLoading } = useFeedback();
  const updateFeedback = useUpdateFeedback();
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

  const filteredFeedback = feedbackList?.filter(f => 
    statusFilter === 'all' || f.status === statusFilter
  ) || [];

  const handleStatusChange = (id: string, status: Feedback['status']) => {
    updateFeedback.mutate({ id, status });
  };

  const handleRespond = (id: string) => {
    const response = responses[id];
    if (!response?.trim()) return;
    
    updateFeedback.mutate({ 
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
            <SelectItem value="all">All Feedback</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="reviewed">Reviewed</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-muted-foreground text-sm">
          {filteredFeedback.length} items
        </span>
      </div>

      {filteredFeedback.length === 0 ? (
        <Card className="p-8 text-center">
          <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No feedback found</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredFeedback.map((feedback) => (
            <Card key={feedback.id}>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Badge className={typeColors[feedback.type]}>
                      {feedback.type}
                    </Badge>
                    <Badge className={statusColors[feedback.status]}>
                      {feedback.status}
                    </Badge>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(feedback.created_at), 'PPp')}
                  </span>
                </div>

                <p className="text-sm">{feedback.message}</p>

                {feedback.admin_response && (
                  <div className="bg-muted p-3 rounded-lg">
                    <span className="text-xs font-medium text-muted-foreground">Admin Response:</span>
                    <p className="text-sm mt-1">{feedback.admin_response}</p>
                  </div>
                )}

                {feedback.status !== 'resolved' && (
                  <div className="flex items-end gap-2">
                    <div className="flex-1">
                      <Textarea
                        placeholder="Write a response..."
                        value={responses[feedback.id] || ''}
                        onChange={(e) => setResponses(prev => ({ 
                          ...prev, 
                          [feedback.id]: e.target.value 
                        }))}
                        className="min-h-[60px]"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button 
                        size="sm"
                        onClick={() => handleRespond(feedback.id)}
                        disabled={!responses[feedback.id]?.trim()}
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatusChange(feedback.id, 'resolved')}
                      >
                        Resolve
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
