import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAdminStats } from '@/hooks/useAdminStats';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Package, 
  ShoppingCart, 
  Clock, 
  IndianRupee, 
  Users, 
  UserPlus, 
  Truck, 
  MessageSquare,
  TrendingUp
} from 'lucide-react';

export function DashboardTab() {
  const { data: stats, isLoading } = useAdminStats();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-xl" />
        ))}
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Products",
      value: stats?.totalProducts || 0,
      icon: Package,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Total Orders",
      value: stats?.totalOrders || 0,
      icon: ShoppingCart,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Pending Orders",
      value: stats?.pendingOrders || 0,
      icon: Clock,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
    {
      title: "Today's Orders",
      value: stats?.todayOrders || 0,
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      title: "Today's Collection",
      value: `₹${stats?.todayRevenue?.toLocaleString() || 0}`,
      icon: IndianRupee,
      color: "text-emerald-600",
      bgColor: "bg-emerald-100",
    },
    {
      title: "Total Revenue",
      value: `₹${stats?.totalRevenue?.toLocaleString() || 0}`,
      icon: IndianRupee,
      color: "text-teal-600",
      bgColor: "bg-teal-100",
    },
    {
      title: "Total Users",
      value: stats?.totalUsers || 0,
      icon: Users,
      color: "text-indigo-600",
      bgColor: "bg-indigo-100",
    },
    {
      title: "New Users Today",
      value: stats?.newUsersToday || 0,
      icon: UserPlus,
      color: "text-pink-600",
      bgColor: "bg-pink-100",
    },
    {
      title: "Active Partners",
      value: stats?.activeDeliveryPartners || 0,
      icon: Truck,
      color: "text-cyan-600",
      bgColor: "bg-cyan-100",
    },
    {
      title: "Pending Feedback",
      value: stats?.pendingFeedback || 0,
      icon: MessageSquare,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
    },
    {
      title: "Pending Messages",
      value: stats?.pendingMessages || 0,
      icon: MessageSquare,
      color: "text-rose-600",
      bgColor: "bg-rose-100",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
