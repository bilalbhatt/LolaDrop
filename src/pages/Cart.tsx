import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { ShoppingCart, Trash2, Plus, Minus, Lock, Package, ArrowRight, Truck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { LocationPicker } from '@/components/location/LocationPicker';
import { DELIVERY_CHARGE, FREE_DELIVERY_THRESHOLD, MIN_ORDER_AMOUNT } from '@/lib/types';

export default function Cart() {
  const { user } = useAuth();
  const { cartItems, totalItems, totalPrice, updateQuantity, removeFromCart, isLoading } = useCart();

  const deliveryCharge = totalPrice >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_CHARGE;
  const finalTotal = totalPrice + deliveryCharge;
  const freeDeliveryProgress = Math.min((totalPrice / FREE_DELIVERY_THRESHOLD) * 100, 100);
  const amountToFreeDelivery = Math.max(FREE_DELIVERY_THRESHOLD - totalPrice, 0);
  const amountToMinOrder = Math.max(MIN_ORDER_AMOUNT - totalPrice, 0);

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center bg-muted/30">
          <Card className="max-w-md w-full mx-4">
            <CardContent className="pt-6 text-center">
              <ShoppingCart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h2 className="font-display text-xl font-semibold mb-2">Sign in to view your cart</h2>
              <p className="text-muted-foreground mb-6">
                Please sign in to add items and view your cart.
              </p>
              <Link to="/auth">
                <Button className="bg-gradient-hero hover:opacity-90">Sign In</Button>
              </Link>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 bg-muted/30">
        <div className="container py-8">
          <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-6">
            Your Cart
          </h1>

          {isLoading ? (
            <div className="text-center py-12">Loading...</div>
          ) : cartItems.length === 0 ? (
            <Card className="max-w-md mx-auto">
              <CardContent className="pt-6 text-center">
                <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h2 className="font-display text-xl font-semibold mb-2">Your cart is empty</h2>
                <p className="text-muted-foreground mb-6">
                  Add some kits or products to get started!
                </p>
                <div className="flex gap-3 justify-center">
                  <Link to="/kits">
                    <Button variant="outline">Browse Kits</Button>
                  </Link>
                  <Link to="/products">
                    <Button className="bg-gradient-hero hover:opacity-90">Browse Products</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                {cartItems.map((item) => (
                  <Card key={item.id} className="overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        <div className="w-20 h-20 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                          {item.product?.image_url ? (
                            <img 
                              src={item.product.image_url} 
                              alt={item.product.name}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          ) : (
                            <Package className="h-8 w-8 text-muted-foreground" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-medium text-foreground line-clamp-1">
                                {item.product?.name}
                              </h3>
                              <div className="flex items-center gap-2 text-sm">
                                <span className="text-primary font-semibold">
                                  ₹{Number(item.product?.price || 0).toFixed(0)}
                                </span>
                                {item.product?.original_price && item.product.original_price > item.product.price && (
                                  <span className="text-muted-foreground line-through text-xs">
                                    ₹{Number(item.product.original_price).toFixed(0)}
                                  </span>
                                )}
                                <span className="text-muted-foreground">/ {item.product?.unit}</span>
                              </div>
                              {item.is_kit_item && (
                                <span className="inline-flex items-center gap-1 text-xs text-primary mt-1">
                                  <Lock className="h-3 w-3" /> Kit item (minimum)
                                </span>
                              )}
                            </div>
                            <p className="font-display font-semibold text-primary">
                              ₹{(Number(item.product?.price || 0) * item.quantity).toFixed(0)}
                            </p>
                          </div>

                          <div className="flex items-center justify-between mt-3">
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                disabled={item.quantity <= 1 || item.is_kit_item}
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                              <span className="w-8 text-center font-medium">{item.quantity}</span>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                            
                            {!item.is_kit_item && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-destructive hover:text-destructive"
                                onClick={() => removeFromCart(item.id)}
                              >
                                <Trash2 className="h-4 w-4 mr-1" />
                                Remove
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Order Summary */}
              <div>
                <div className="mb-6">
                  <LocationPicker />
                </div>

                <Card className="sticky top-24">
                  <CardHeader>
                    <CardTitle className="font-display">Order Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Free Delivery Progress */}
                    {totalPrice < FREE_DELIVERY_THRESHOLD && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <Truck className="h-4 w-4 text-primary" />
                          <span className="text-muted-foreground">
                            Add ₹{amountToFreeDelivery.toFixed(0)} more for <strong className="text-primary">FREE delivery</strong>
                          </span>
                        </div>
                        <Progress value={freeDeliveryProgress} className="h-2" />
                      </div>
                    )}

                    {/* Minimum Order Warning */}
                    {totalPrice < MIN_ORDER_AMOUNT && (
                      <div className="text-sm text-destructive bg-destructive/10 p-2 rounded">
                        Minimum order: ₹{MIN_ORDER_AMOUNT}. Add ₹{amountToMinOrder.toFixed(0)} more.
                      </div>
                    )}

                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Items ({totalItems})</span>
                      <span>₹{totalPrice.toFixed(0)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Delivery</span>
                      {deliveryCharge === 0 ? (
                        <span className="text-primary font-medium">FREE</span>
                      ) : (
                        <span>₹{deliveryCharge}</span>
                      )}
                    </div>
                    <Separator />
                    <div className="flex justify-between font-display font-semibold text-lg">
                      <span>Total</span>
                      <span className="text-primary">₹{finalTotal.toFixed(0)}</span>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Link to="/checkout" className="w-full">
                      <Button
                        className="w-full bg-gradient-hero hover:opacity-90"
                        size="lg"
                        disabled={totalPrice < MIN_ORDER_AMOUNT}
                      >
                        Proceed to Checkout
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
