import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { useDeliveryPartners, useCreateDeliveryPartner, useTogglePartnerStatus } from '@/hooks/useDeliveryPartners';
import { Truck, Plus, Phone, User } from 'lucide-react';

export function DeliveryPartnersTab() {
  const { data: partners, isLoading } = useDeliveryPartners();
  const createPartner = useCreateDeliveryPartner();
  const toggleStatus = useTogglePartnerStatus();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    phone: '',
    vehicleType: 'bike',
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createPartner.mutateAsync(formData);
    setIsDialogOpen(false);
    setFormData({
      email: '',
      password: '',
      fullName: '',
      phone: '',
      vehicleType: 'bike',
    });
  };

  const handleToggleStatus = (partnerId: string, isActive: boolean) => {
    toggleStatus.mutate({ partnerId, isActive });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Delivery Partners</h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Partner
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Delivery Partner</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  minLength={6}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vehicleType">Vehicle Type</Label>
                <select
                  id="vehicleType"
                  value={formData.vehicleType}
                  onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
                  className="w-full border rounded-md p-2"
                >
                  <option value="bike">Bike</option>
                  <option value="scooter">Scooter</option>
                  <option value="car">Car</option>
                  <option value="van">Van</option>
                </select>
              </div>
              <Button type="submit" className="w-full" disabled={createPartner.isPending}>
                {createPartner.isPending ? 'Creating...' : 'Create Partner'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {partners?.length === 0 ? (
        <Card className="p-8 text-center">
          <Truck className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No delivery partners yet</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {partners?.map((partner) => (
            <Card key={partner.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <User className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold">{partner.profile?.full_name || 'Partner'}</h4>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Phone className="h-3 w-3" />
                        {partner.phone || 'No phone'}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline">{partner.vehicle_type}</Badge>
                        <Badge className={partner.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                          {partner.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor={`active-${partner.id}`} className="text-sm">Active</Label>
                    <Switch
                      id={`active-${partner.id}`}
                      checked={partner.is_active}
                      onCheckedChange={(checked) => handleToggleStatus(partner.id, checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
