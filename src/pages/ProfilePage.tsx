import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { useProfile, useUpdateProfile } from '@/hooks/useProfile';
import { User, Phone, MapPin, Mail, Save } from 'lucide-react';
import { Navigate } from 'react-router-dom';

export default function ProfilePage() {
  const { user, isLoading: authLoading } = useAuth();
  const { data: profile, isLoading } = useProfile(user?.id);
  const updateProfile = useUpdateProfile();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setPhone(profile.phone || '');
      setAddress(profile.address || '');
      setDeliveryAddress(profile.delivery_address || '');
    }
  }, [profile]);

  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/auth" />;
  }

  const handleSave = () => {
    updateProfile.mutate({
      userId: user.id,
      updates: {
        full_name: fullName || null,
        phone: phone || null,
        address: address || null,
        delivery_address: deliveryAddress || null,
      },
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 bg-muted/30">
        <div className="container py-8 max-w-2xl">
          <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-6">
            My Profile
          </h1>

          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-64 rounded-xl" />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Account Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    Account
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input value={user.email || ''} disabled className="bg-muted" />
                    <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                  </div>
                </CardContent>
              </Card>

              {/* Personal Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      placeholder="Enter your full name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        placeholder="+91 XXXXX XXXXX"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Address */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Addresses
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="address">Home Address</Label>
                    <Textarea
                      id="address"
                      placeholder="Enter your home address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="min-h-[80px]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="deliveryAddress">Default Delivery Address</Label>
                    <Textarea
                      id="deliveryAddress"
                      placeholder="Enter your default delivery address"
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      className="min-h-[80px]"
                    />
                  </div>
                </CardContent>
              </Card>

              <Button
                onClick={handleSave}
                disabled={updateProfile.isPending}
                className="w-full bg-gradient-hero hover:opacity-90"
                size="lg"
              >
                <Save className="h-4 w-4 mr-2" />
                {updateProfile.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
