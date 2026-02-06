import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { 
  useUserFeedback, 
  useCreateFeedback, 
  useMyMessages, 
  useCreateUserMessage 
} from '@/hooks/useFeedback';
import { Feedback, UserMessage } from '@/lib/types';
import { format } from 'date-fns';
import { MessageSquare, Send, ShoppingCart, Plus } from 'lucide-react';
import { Navigate } from 'react-router-dom';

const typeColors: Record<string, string> = {
  feedback: 'bg-blue-100 text-blue-800',
  suggestion: 'bg-green-100 text-green-800',
  complaint: 'bg-red-100 text-red-800',
};

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  reviewed: 'bg-blue-100 text-blue-800',
  resolved: 'bg-green-100 text-green-800',
  processed: 'bg-green-100 text-green-800',
};

export default function FeedbackPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { data: feedback } = useUserFeedback(user?.id);
  const { data: messages } = useMyMessages(user?.id);
  const createFeedback = useCreateFeedback();
  const createMessage = useCreateUserMessage();

  const [feedbackType, setFeedbackType] = useState<Feedback['type']>('feedback');
  const [feedbackText, setFeedbackText] = useState('');
  const [messageText, setMessageText] = useState('');
  const [isCustomOrder, setIsCustomOrder] = useState(false);

  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/auth" />;
  }

  const handleSubmitFeedback = async () => {
    if (!feedbackText.trim()) return;
    await createFeedback.mutateAsync({
      userId: user.id,
      type: feedbackType,
      message: feedbackText,
    });
    setFeedbackText('');
  };

  const handleSubmitMessage = async () => {
    if (!messageText.trim()) return;
    await createMessage.mutateAsync({
      userId: user.id,
      message: messageText,
      isCustomOrder,
    });
    setMessageText('');
    setIsCustomOrder(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 bg-muted/30">
        <div className="container py-8">
          <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-6">
            Feedback & Support
          </h1>

          <Tabs defaultValue="feedback" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 max-w-md">
              <TabsTrigger value="feedback" className="gap-2">
                <MessageSquare className="h-4 w-4" />
                Feedback
              </TabsTrigger>
              <TabsTrigger value="messages" className="gap-2">
                <ShoppingCart className="h-4 w-4" />
                Custom Orders
              </TabsTrigger>
            </TabsList>

            <TabsContent value="feedback" className="space-y-6">
              {/* Submit Feedback */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Share Your Feedback</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <RadioGroup
                      value={feedbackType}
                      onValueChange={(v) => setFeedbackType(v as Feedback['type'])}
                      className="flex gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="feedback" id="feedback" />
                        <Label htmlFor="feedback">Feedback</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="suggestion" id="suggestion" />
                        <Label htmlFor="suggestion">Suggestion</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="complaint" id="complaint" />
                        <Label htmlFor="complaint">Complaint</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="space-y-2">
                    <Label>Message</Label>
                    <Textarea
                      placeholder="Write your feedback here..."
                      value={feedbackText}
                      onChange={(e) => setFeedbackText(e.target.value)}
                      className="min-h-[100px]"
                    />
                  </div>

                  <Button 
                    onClick={handleSubmitFeedback}
                    disabled={!feedbackText.trim() || createFeedback.isPending}
                    className="gap-2"
                  >
                    <Send className="h-4 w-4" />
                    {createFeedback.isPending ? 'Submitting...' : 'Submit Feedback'}
                  </Button>
                </CardContent>
              </Card>

              {/* Previous Feedback */}
              <div className="space-y-4">
                <h3 className="font-semibold">Your Previous Feedback</h3>
                {!feedback?.length ? (
                  <p className="text-muted-foreground text-sm">No feedback submitted yet</p>
                ) : (
                  feedback.map((item) => (
                    <Card key={item.id}>
                      <CardContent className="p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge className={typeColors[item.type]}>{item.type}</Badge>
                            <Badge className={statusColors[item.status]}>{item.status}</Badge>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(item.created_at), 'PP')}
                          </span>
                        </div>
                        <p className="text-sm">{item.message}</p>
                        {item.admin_response && (
                          <div className="bg-muted p-3 rounded-lg">
                            <span className="text-xs font-medium">Admin Response:</span>
                            <p className="text-sm mt-1">{item.admin_response}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="messages" className="space-y-6">
              {/* Submit Custom Order/Message */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Send a Message or Custom Order</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="customOrder"
                      checked={isCustomOrder}
                      onChange={(e) => setIsCustomOrder(e.target.checked)}
                      className="rounded"
                    />
                    <Label htmlFor="customOrder">This is a custom order request</Label>
                  </div>

                  <div className="space-y-2">
                    <Label>Message</Label>
                    <Textarea
                      placeholder={isCustomOrder 
                        ? "Describe what you'd like to order..."
                        : "Write your message here..."
                      }
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      className="min-h-[100px]"
                    />
                  </div>

                  <Button 
                    onClick={handleSubmitMessage}
                    disabled={!messageText.trim() || createMessage.isPending}
                    className="gap-2"
                  >
                    <Send className="h-4 w-4" />
                    {createMessage.isPending ? 'Sending...' : 'Send Message'}
                  </Button>
                </CardContent>
              </Card>

              {/* Previous Messages */}
              <div className="space-y-4">
                <h3 className="font-semibold">Your Messages</h3>
                {!messages?.length ? (
                  <p className="text-muted-foreground text-sm">No messages sent yet</p>
                ) : (
                  messages.map((item) => (
                    <Card key={item.id}>
                      <CardContent className="p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {item.is_custom_order && (
                              <Badge className="bg-purple-100 text-purple-800">
                                <ShoppingCart className="h-3 w-3 mr-1" />
                                Custom Order
                              </Badge>
                            )}
                            <Badge className={statusColors[item.status]}>{item.status}</Badge>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(item.created_at), 'PP')}
                          </span>
                        </div>
                        <p className="text-sm">{item.message}</p>
                        {item.admin_response && (
                          <div className="bg-muted p-3 rounded-lg">
                            <span className="text-xs font-medium">Admin Response:</span>
                            <p className="text-sm mt-1">{item.admin_response}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
}
