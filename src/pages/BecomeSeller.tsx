import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Store, TrendingUp, Users, Truck, ShieldCheck, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

export default function BecomeSeller() {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [business, setBusiness] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim() || !phone.trim()) {
      toast.error('Please fill in your name and phone number');
      return;
    }

    setIsSubmitting(true);
    try {
      const fullMessage = `[SELLER APPLICATION]\nName: ${name}\nPhone: ${phone}\nBusiness: ${business}\n\n${message}`;
      
      const { error } = await supabase
        .from('user_messages')
        .insert({
          user_id: user?.id || '00000000-0000-0000-0000-000000000000',
          message: fullMessage,
          is_custom_order: false,
        });

      if (error) throw error;
      toast.success('Your seller application has been submitted! We\'ll contact you soon.');
      setName('');
      setPhone('');
      setBusiness('');
      setMessage('');
    } catch (error) {
      toast.error('Failed to submit. Please try again or contact us directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero */}
        <section className="bg-gradient-hero py-16 md:py-24">
          <div className="container text-center text-primary-foreground">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-background/20 backdrop-blur-sm mb-6">
              <Store className="h-5 w-5 text-lola-yellow-400" />
              <span className="font-medium">Partner with LolaDrop</span>
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
              Become a Seller
            </h1>
            <p className="text-lg text-primary-foreground/80 max-w-2xl mx-auto">
              Join LolaDrop's growing network of local sellers. Reach thousands of customers in your area with zero upfront costs.
            </p>
          </div>
        </section>

        {/* Benefits */}
        <section className="py-12 bg-background">
          <div className="container">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-center mb-8">Why Sell on LolaDrop?</h2>
            <div className="grid md:grid-cols-4 gap-6">
              {[
                { icon: <TrendingUp className="h-8 w-8" />, title: 'Grow Your Sales', desc: 'Reach thousands of new customers in your locality' },
                { icon: <Users className="h-8 w-8" />, title: 'Zero Upfront Cost', desc: 'No registration fees. Start selling immediately' },
                { icon: <Truck className="h-8 w-8" />, title: 'We Handle Delivery', desc: 'Our delivery partners pick up and deliver orders' },
                { icon: <ShieldCheck className="h-8 w-8" />, title: 'Trusted Platform', desc: 'Transparent pricing and timely payments' },
              ].map((benefit, i) => (
                <Card key={i} className="text-center hover:shadow-hover transition-shadow">
                  <CardContent className="p-6 space-y-3">
                    <div className="mx-auto h-14 w-14 rounded-2xl bg-accent flex items-center justify-center text-primary">
                      {benefit.icon}
                    </div>
                    <h3 className="font-display font-semibold text-lg">{benefit.title}</h3>
                    <p className="text-sm text-muted-foreground">{benefit.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Application Form */}
        <section className="py-12 bg-muted/30">
          <div className="container max-w-lg">
            <Card>
              <CardContent className="p-6 space-y-5">
                <div className="text-center">
                  <h2 className="font-display text-2xl font-bold">Apply Now</h2>
                  <p className="text-sm text-muted-foreground mt-1">Fill out the form and our team will reach out within 24 hours</p>
                </div>

                {!user && (
                  <div className="bg-accent p-3 rounded-lg text-center">
                    <p className="text-sm text-accent-foreground">
                      <Link to="/auth" className="text-primary font-medium underline">Sign in</Link> first for a faster application process.
                    </p>
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Full Name *</Label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name" />
                </div>
                <div className="space-y-2">
                  <Label>Phone Number *</Label>
                  <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 XXXXX XXXXX" />
                </div>
                <div className="space-y-2">
                  <Label>Business / Shop Name</Label>
                  <Input value={business} onChange={(e) => setBusiness(e.target.value)} placeholder="Your shop or business name" />
                </div>
                <div className="space-y-2">
                  <Label>Tell us about your products</Label>
                  <Textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="What products do you sell? e.g., fresh vegetables, dairy, bakery items..."
                    className="min-h-[100px]"
                  />
                </div>
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting || !name.trim() || !phone.trim()}
                  className="w-full bg-gradient-hero hover:opacity-90 gap-2"
                  size="lg"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Application'}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
