import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { usePromotions, useCreatePromotion, useUpdatePromotion, useDeletePromotion } from '@/hooks/usePromotions';
import { Promotion } from '@/lib/types';
import { format } from 'date-fns';
import { Plus, Trash2, Edit, Percent, Tag } from 'lucide-react';

export function PromotionsTab() {
  const { data: promotions, isLoading } = usePromotions();
  const createPromotion = useCreatePromotion();
  const updatePromotion = useUpdatePromotion();
  const deletePromotion = useDeletePromotion();

  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [discountPercentage, setDiscountPercentage] = useState('');
  const [bannerImageUrl, setBannerImageUrl] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
    );
  }

  const handleCreate = async () => {
    if (!title.trim()) return;
    await createPromotion.mutateAsync({
      title,
      description: description || undefined,
      discount_percentage: discountPercentage ? Number(discountPercentage) : undefined,
      banner_image_url: bannerImageUrl || undefined,
      start_date: startDate || undefined,
      end_date: endDate || undefined,
    });
    setTitle('');
    setDescription('');
    setDiscountPercentage('');
    setBannerImageUrl('');
    setStartDate('');
    setEndDate('');
    setShowForm(false);
  };

  const toggleActive = (promo: Promotion) => {
    updatePromotion.mutate({ id: promo.id, is_active: !promo.is_active });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">Promotions & Offers</h3>
        <Button onClick={() => setShowForm(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          New Promotion
        </Button>
      </div>

      {/* Create Form */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create Promotion</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Title *</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Ramadan Special 20% Off" />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the offer..." />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Discount %</Label>
                <Input type="number" value={discountPercentage} onChange={(e) => setDiscountPercentage(e.target.value)} placeholder="e.g., 20" />
              </div>
              <div className="space-y-2">
                <Label>Banner Image URL</Label>
                <Input value={bannerImageUrl} onChange={(e) => setBannerImageUrl(e.target.value)} placeholder="https://..." />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>End Date</Label>
                <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </div>
            </div>
            <Button onClick={handleCreate} disabled={!title.trim() || createPromotion.isPending} className="w-full">
              {createPromotion.isPending ? 'Creating...' : 'Create Promotion'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Promotions List */}
      {!promotions?.length ? (
        <Card className="p-8 text-center">
          <Tag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No promotions yet. Create one to show on the homepage!</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {promotions.map((promo) => (
            <Card key={promo.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">{promo.title}</h4>
                      <Badge className={promo.is_active ? 'bg-green-100 text-green-800' : 'bg-muted text-muted-foreground'}>
                        {promo.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                      {promo.discount_percentage > 0 && (
                        <Badge variant="secondary" className="gap-1">
                          <Percent className="h-3 w-3" />
                          {promo.discount_percentage}% OFF
                        </Badge>
                      )}
                    </div>
                    {promo.description && (
                      <p className="text-sm text-muted-foreground">{promo.description}</p>
                    )}
                    <div className="text-xs text-muted-foreground">
                      {promo.start_date && `From ${format(new Date(promo.start_date), 'PP')}`}
                      {promo.end_date && ` to ${format(new Date(promo.end_date), 'PP')}`}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={promo.is_active}
                      onCheckedChange={() => toggleActive(promo)}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive"
                      onClick={() => deletePromotion.mutate(promo.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
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
