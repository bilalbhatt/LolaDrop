import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Package, ShoppingBag, Users, LayoutDashboard, ClipboardList, Truck, MessageSquare, MessageCircle } from 'lucide-react';
import { ProductsTab } from '@/components/admin/ProductsTab';
import { KitsTab } from '@/components/admin/KitsTab';
import { UsersTab } from '@/components/admin/UsersTab';
import { DashboardTab } from '@/components/admin/DashboardTab';
import { OrdersTab } from '@/components/admin/OrdersTab';
import { DeliveryPartnersTab } from '@/components/admin/DeliveryPartnersTab';
import { FeedbackTab } from '@/components/admin/FeedbackTab';
import { MessagesTab } from '@/components/admin/MessagesTab';
import { useEffect } from 'react';

export default function Admin() {
  const { user, isAdmin, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      navigate('/');
    }
  }, [authLoading, user, isAdmin, navigate]);

  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!user || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 bg-muted/30">
        <div className="container py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
                Admin Panel
              </h1>
              <p className="text-muted-foreground mt-1">Manage your LolaDrop business</p>
            </div>
            <Badge className="bg-primary">Admin</Badge>
          </div>

          <Tabs defaultValue="dashboard" className="space-y-6">
            <TabsList className="flex flex-wrap h-auto gap-1 p-1">
              <TabsTrigger value="dashboard" className="gap-2">
                <LayoutDashboard className="h-4 w-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </TabsTrigger>
              <TabsTrigger value="orders" className="gap-2">
                <ClipboardList className="h-4 w-4" />
                <span className="hidden sm:inline">Orders</span>
              </TabsTrigger>
              <TabsTrigger value="products" className="gap-2">
                <ShoppingBag className="h-4 w-4" />
                <span className="hidden sm:inline">Products</span>
              </TabsTrigger>
              <TabsTrigger value="kits" className="gap-2">
                <Package className="h-4 w-4" />
                <span className="hidden sm:inline">Kits</span>
              </TabsTrigger>
              <TabsTrigger value="partners" className="gap-2">
                <Truck className="h-4 w-4" />
                <span className="hidden sm:inline">Partners</span>
              </TabsTrigger>
              <TabsTrigger value="users" className="gap-2">
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">Users</span>
              </TabsTrigger>
              <TabsTrigger value="feedback" className="gap-2">
                <MessageSquare className="h-4 w-4" />
                <span className="hidden sm:inline">Feedback</span>
              </TabsTrigger>
              <TabsTrigger value="messages" className="gap-2">
                <MessageCircle className="h-4 w-4" />
                <span className="hidden sm:inline">Messages</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard">
              <DashboardTab />
            </TabsContent>

            <TabsContent value="orders">
              <OrdersTab />
            </TabsContent>

            <TabsContent value="products">
              <ProductsTab />
            </TabsContent>

            <TabsContent value="kits">
              <KitsTab />
            </TabsContent>

            <TabsContent value="partners">
              <DeliveryPartnersTab />
            </TabsContent>

            <TabsContent value="users">
              <UsersTab />
            </TabsContent>

            <TabsContent value="feedback">
              <FeedbackTab />
            </TabsContent>

            <TabsContent value="messages">
              <MessagesTab />
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
}
