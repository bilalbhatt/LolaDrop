import { useState, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { 
  useUserFeedback, 
  useCreateFeedback, 
  useMyMessages, 
  useCreateUserMessage 
} from '@/hooks/useFeedback';
import { useProducts } from '@/hooks/useProducts';
import { Feedback, UserMessage, Product } from '@/lib/types';
import { format } from 'date-fns';
import { MessageSquare, Send, ShoppingBag, Search, Plus, Minus, X } from 'lucide-react';
import { Navigate, useSearchParams } from 'react-router-dom';

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

interface SelectedItem {
  product: Product;
  quantity: number;
}

export default function FeedbackPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get('tab') || 'feedback';
  const { data: feedback } = useUserFeedback(user?.id);
  const { data: messages } = useMyMessages(user?.id);
  const { data: products } = useProducts();
  const createFeedback = useCreateFeedback();
  const createMessage = useCreateUserMessage();

  const [feedbackType, setFeedbackType] = useState<Feedback['type']>('feedback');
  const [feedbackText, setFeedbackText] = useState('');
  const [messageText, setMessageText] = useState('');
  const [isCustomOrder, setIsCustomOrder] = useState(defaultTab === 'messages');

  // Custom order product search
  const [productSearch, setProductSearch] = useState('');
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);

  const searchResults = useMemo(() => {
    if (!productSearch.trim() || !products) return [];
    return products
      .filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase()) && p.in_stock)
      .slice(0, 6);
  }, [productSearch, products]);

  const addItem = (product: Product) => {
    setSelectedItems(prev => {
      const existing = prev.find(i => i.product.id === product.id);
      if (existing) {
        return prev.map(i => i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { product, quantity: 1 }];
    });
    setProductSearch('');
  };

  const updateItemQty = (productId: string, qty: number) => {
    if (qty < 1) {
      setSelectedItems(prev => prev.filter(i => i.product.id !== productId));
      return;
    }
    setSelectedItems(prev => prev.map(i => i.product.id === productId ? { ...i, quantity: qty } : i));
  };

  const removeItem = (productId: string) => {
    setSelectedItems(prev => prev.filter(i => i.product.id !== productId));
  };

  const totalOrderAmount = selectedItems.reduce((sum, item) => sum + Number(item.product.price) * item.quantity, 0);

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
    let fullMessage = messageText;

    if (selectedItems.length > 0) {
      const itemsList = selectedItems
        .map(i => `• ${i.product.name} × ${i.quantity} (₹${(Number(i.product.price) * i.quantity).toFixed(0)})`)
        .join('\n');
      fullMessage = `Custom Order Items:\n${itemsList}\n\nEstimated Total: ₹${totalOrderAmount.toFixed(0)}\n\n${messageText}`.trim();
    }

    if (!fullMessage.trim()) return;
    await createMessage.mutateAsync({
      userId: user.id,
      message: fullMessage,
      isCustomOrder: true,
    });
    setMessageText('');
    setSelectedItems([]);
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

          <Tabs defaultValue={defaultTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 max-w-md">
              <TabsTrigger value="feedback" className="gap-2">
                <MessageSquare className="h-4 w-4" />
                Feedback
              </TabsTrigger>
              <TabsTrigger value="messages" className="gap-2">
                <ShoppingBag className="h-4 w-4" />
                Make Your Own Order
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
              {/* Custom Order with Product Search */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Make Your Own Order</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Search and select items with quantities, or describe what you need below.
                  </p>

                  {/* Product Search */}
                  <div className="space-y-2">
                    <Label>Search Products</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="Search for items..."
                        value={productSearch}
                        onChange={(e) => setProductSearch(e.target.value)}
                        className="pl-10"
                      />
                      {searchResults.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-card border rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                          {searchResults.map((product) => (
                            <button
                              key={product.id}
                              className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted transition-colors text-left"
                              onClick={() => addItem(product)}
                            >
                              <div className="flex items-center gap-3">
                                {product.image_url ? (
                                  <img src={product.image_url} alt="" className="h-8 w-8 rounded object-cover" />
                                ) : (
                                  <ShoppingBag className="h-8 w-8 text-muted-foreground p-1" />
                                )}
                                <div>
                                  <p className="text-sm font-medium">{product.name}</p>
                                  <p className="text-xs text-muted-foreground">{product.unit}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-semibold text-primary">₹{Number(product.price).toFixed(0)}</p>
                                <Plus className="h-4 w-4 text-primary ml-auto" />
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Selected Items */}
                  {selectedItems.length > 0 && (
                    <div className="space-y-2">
                      <Label>Selected Items</Label>
                      <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                        {selectedItems.map((item) => (
                          <div key={item.product.id} className="flex items-center justify-between gap-2 bg-background rounded-lg px-3 py-2">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{item.product.name}</p>
                              <p className="text-xs text-muted-foreground">₹{Number(item.product.price).toFixed(0)}/{item.product.unit}</p>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => updateItemQty(item.product.id, item.quantity - 1)}>
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                              <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => updateItemQty(item.product.id, item.quantity + 1)}>
                                <Plus className="h-3 w-3" />
                              </Button>
                              <span className="text-sm font-semibold text-primary w-14 text-right">₹{(Number(item.product.price) * item.quantity).toFixed(0)}</span>
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => removeItem(item.product.id)}>
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        ))}
                        <div className="flex justify-between pt-2 border-t font-semibold text-sm">
                          <span>Estimated Total</span>
                          <span className="text-primary">₹{totalOrderAmount.toFixed(0)}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Additional Notes */}
                  <div className="space-y-2">
                    <Label>Additional Notes / Special Requests</Label>
                    <Textarea
                      placeholder="Any special brands, sizes, or items not listed above..."
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      className="min-h-[80px]"
                    />
                  </div>

                  <Button 
                    onClick={handleSubmitMessage}
                    disabled={(selectedItems.length === 0 && !messageText.trim()) || createMessage.isPending}
                    className="gap-2"
                  >
                    <Send className="h-4 w-4" />
                    {createMessage.isPending ? 'Sending...' : 'Send Order Request'}
                  </Button>
                </CardContent>
              </Card>

              {/* Previous Messages */}
              <div className="space-y-4">
                <h3 className="font-semibold">Your Requests</h3>
                {!messages?.length ? (
                  <p className="text-muted-foreground text-sm">No requests sent yet</p>
                ) : (
                  messages.map((item) => (
                    <Card key={item.id}>
                      <CardContent className="p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {item.is_custom_order && (
                              <Badge className="bg-purple-100 text-purple-800">
                                <ShoppingBag className="h-3 w-3 mr-1" />
                                Custom Order
                              </Badge>
                            )}
                            <Badge className={statusColors[item.status]}>{item.status}</Badge>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(item.created_at), 'PP')}
                          </span>
                        </div>
                        <p className="text-sm whitespace-pre-line">{item.message}</p>
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
