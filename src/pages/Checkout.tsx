import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { LocationPicker } from '@/components/location/LocationPicker';
import { useCreateOrder } from '@/hooks/useOrders';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { IndianRupee, CreditCard, Banknote, Copy, CheckCircle, AlertTriangle } from 'lucide-react';
import { DELIVERY_CHARGE, FREE_DELIVERY_THRESHOLD, MIN_ORDER_AMOUNT } from '@/lib/types';

const UPI_ID = '9622927445@pthdfc';

export default function Checkout() {
  const { user } = useAuth();
  const { cartItems, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();
  const createOrder = useCreateOrder();

  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [latitude, setLatitude] = useState<number | undefined>();
  const [longitude, setLongitude] = useState<number | undefined>();
  const [deliveryInstructions, setDeliveryInstructions] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'upi'>('cod');
  const [upiCopied, setUpiCopied] = useState(false);

  if (!user) {
    navigate('/auth');
    return null;
  }

  if (cartItems.length === 0) {
    navigate('/cart');
    return null;
  }

  const deliveryCharge = totalPrice >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_CHARGE;
  const finalTotal = totalPrice + deliveryCharge;
  const isBelowMinimum = totalPrice < MIN_ORDER_AMOUNT;

  const handleLocationDetected = (lat: number, lng: number, address: string) => {
    setLatitude(lat);
    setLongitude(lng);
    setDeliveryAddress(address);
  };

  const copyUPI = () => {
    navigator.clipboard.writeText(UPI_ID);
    setUpiCopied(true);
    toast.success('UPI ID copied!');
    setTimeout(() => setUpiCopied(false), 3000);
  };

  const handlePlaceOrder = async () => {
    if (isBelowMinimum) {
      toast.error(`Minimum order amount is ₹${MIN_ORDER_AMOUNT}`);
      return;
    }

    if (!deliveryAddress.trim()) {
      toast.error('Please enter delivery address');
      return;
    }

    try {
      await createOrder.mutateAsync({
        userId: user.id,
        totalAmount: totalPrice,
        deliveryAddress,
        deliveryLatitude: latitude,
        deliveryLongitude: longitude,
        deliveryInstructions,
        paymentMethod,
        deliveryCharge,
        items: cartItems.map(item => ({
          productId: item.product_id,
          quantity: item.quantity,
          unitPrice: item.product?.price || 0,
        })),
      });

      await supabase
        .from('cart_items')
        .delete()
        .eq('cart_id', cartItems[0].cart_id);

      navigate('/orders');
    } catch (error) {
      console.error('Error placing order:', error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 bg-muted/30">
        <div className="container py-8">
          <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-6">
            Checkout
          </h1>

          {/* Minimum Order Warning */}
          {isBelowMinimum && (
            <div className="mb-6 p-4 bg-destructive/10 border border-destructive/30 rounded-lg flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0" />
              <p className="text-sm text-destructive">
                Minimum order amount is <strong>₹{MIN_ORDER_AMOUNT}</strong>. Please add ₹{(MIN_ORDER_AMOUNT - totalPrice).toFixed(0)} more to proceed.
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Delivery & Payment */}
            <div className="lg:col-span-2 space-y-6">
              {/* Delivery Address */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Delivery Address</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <LocationPicker onLocationSelect={handleLocationDetected} />
                  
                  <div className="space-y-2">
                    <Label htmlFor="address">Full Address</Label>
                    <Textarea
                      id="address"
                      placeholder="Enter your complete delivery address..."
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      className="min-h-[80px]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="instructions">Delivery Instructions (Optional)</Label>
                    <Input
                      id="instructions"
                      placeholder="e.g., Ring the doorbell twice, leave at gate..."
                      value={deliveryInstructions}
                      onChange={(e) => setDeliveryInstructions(e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Payment Method */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Payment Method</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <RadioGroup
                    value={paymentMethod}
                    onValueChange={(v) => setPaymentMethod(v as 'cod' | 'upi')}
                    className="space-y-3"
                  >
                    <div className="flex items-center space-x-3 p-3 border rounded-lg">
                      <RadioGroupItem value="cod" id="cod" />
                      <Label htmlFor="cod" className="flex items-center gap-2 cursor-pointer flex-1">
                        <Banknote className="h-5 w-5 text-green-600" />
                        <div>
                          <p className="font-medium">Cash on Delivery</p>
                          <p className="text-sm text-muted-foreground">Pay when you receive your order</p>
                        </div>
                      </Label>
                    </div>

                    <div className="flex items-center space-x-3 p-3 border rounded-lg">
                      <RadioGroupItem value="upi" id="upi" />
                      <Label htmlFor="upi" className="flex items-center gap-2 cursor-pointer flex-1">
                        <CreditCard className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="font-medium">UPI Payment</p>
                          <p className="text-sm text-muted-foreground">Pay using UPI apps</p>
                        </div>
                      </Label>
                    </div>
                  </RadioGroup>

                  {paymentMethod === 'upi' && (
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 space-y-3">
                      <p className="text-sm font-medium">Pay to this UPI ID:</p>
                      <div className="flex items-center gap-2">
                        <code className="bg-white px-3 py-2 rounded border flex-1 font-mono text-lg">
                          {UPI_ID}
                        </code>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={copyUPI}
                          className="gap-2"
                        >
                          {upiCopied ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                          {upiCopied ? 'Copied!' : 'Copy'}
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        After payment, place order and share payment screenshot with our support if needed.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div>
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle className="text-lg">Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span>{item.product?.name} × {item.quantity}</span>
                        <span>₹{(Number(item.product?.price || 0) * item.quantity).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>₹{totalPrice.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Delivery</span>
                      {deliveryCharge === 0 ? (
                        <span className="text-primary font-medium">FREE</span>
                      ) : (
                        <span>₹{deliveryCharge}</span>
                      )}
                    </div>
                    {deliveryCharge > 0 && (
                      <p className="text-xs text-muted-foreground">
                        Add ₹{(FREE_DELIVERY_THRESHOLD - totalPrice).toFixed(0)} more for free delivery
                      </p>
                    )}
                  </div>

                  <Separator />

                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span className="flex items-center gap-1">
                      <IndianRupee className="h-4 w-4" />
                      {finalTotal.toLocaleString()}
                    </span>
                  </div>

                  <Button 
                    className="w-full" 
                    size="lg"
                    onClick={handlePlaceOrder}
                    disabled={createOrder.isPending || isBelowMinimum}
                  >
                    {createOrder.isPending ? 'Placing Order...' : `Place Order — ₹${finalTotal.toLocaleString()}`}
                  </Button>

                  <p className="text-xs text-center text-muted-foreground">
                    By placing order, you agree to our terms and conditions
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
