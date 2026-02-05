 import { useState } from 'react';
 import { useQueryClient, useQuery, useMutation } from '@tanstack/react-query';
 import { supabase } from '@/integrations/supabase/client';
 import { toast } from 'sonner';
 import { Shield, User as UserIcon } from 'lucide-react';
 import { Button } from '@/components/ui/button';
 import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
 import { Badge } from '@/components/ui/badge';
 import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
 import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
 import { Label } from '@/components/ui/label';
 
 interface UserProfile {
   id: string;
   user_id: string;
   full_name: string | null;
   phone: string | null;
   address: string | null;
   delivery_address: string | null;
   created_at: string;
 }
 
 interface UserRole {
   id: string;
   user_id: string;
   role: 'admin' | 'user';
 }
 
 export function UsersTab() {
   const queryClient = useQueryClient();
   const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
   const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
 
   const { data: profiles, isLoading } = useQuery({
     queryKey: ['admin-profiles'],
     queryFn: async () => {
       const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
       if (error) throw error;
       return data as UserProfile[];
     },
   });
 
   const { data: userRoles } = useQuery({
     queryKey: ['admin-user-roles'],
     queryFn: async () => {
       const { data, error } = await supabase.from('user_roles').select('*');
       if (error) throw error;
       return data as UserRole[];
     },
   });
 
   const updateRoleMutation = useMutation({
     mutationFn: async ({ userId, role }: { userId: string; role: 'admin' | 'user' }) => {
       const { error } = await supabase
         .from('user_roles')
         .update({ role })
         .eq('user_id', userId);
       if (error) throw error;
     },
     onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ['admin-user-roles'] });
       setIsRoleDialogOpen(false);
       setSelectedUserId(null);
       toast.success('User role updated!');
     },
     onError: (error) => {
       toast.error('Failed to update role: ' + error.message);
     },
   });
 
   const getUserRole = (userId: string) => {
     return userRoles?.find(r => r.user_id === userId)?.role || 'user';
   };
 
   const handleRoleChange = (role: 'admin' | 'user') => {
     if (!selectedUserId) return;
     updateRoleMutation.mutate({ userId: selectedUserId, role });
   };
 
   const openRoleDialog = (userId: string) => {
     setSelectedUserId(userId);
     setIsRoleDialogOpen(true);
   };
 
   return (
     <Card>
       <CardHeader>
         <CardTitle className="flex items-center gap-2">
           <UserIcon className="h-5 w-5" />
           User Management
         </CardTitle>
       </CardHeader>
       <CardContent>
         {isLoading ? (
           <div className="text-center py-8">Loading users...</div>
         ) : profiles && profiles.length > 0 ? (
           <Table>
             <TableHeader>
               <TableRow>
                 <TableHead>Name</TableHead>
                 <TableHead>Phone</TableHead>
                 <TableHead>Address</TableHead>
                 <TableHead>Role</TableHead>
                 <TableHead>Joined</TableHead>
                 <TableHead className="text-right">Actions</TableHead>
               </TableRow>
             </TableHeader>
             <TableBody>
               {profiles.map((profile) => {
                 const role = getUserRole(profile.user_id);
                 return (
                   <TableRow key={profile.id}>
                     <TableCell className="font-medium">{profile.full_name || 'N/A'}</TableCell>
                     <TableCell>{profile.phone || 'N/A'}</TableCell>
                     <TableCell className="max-w-[200px] truncate">
                       {profile.delivery_address || profile.address || 'N/A'}
                     </TableCell>
                     <TableCell>
                       <Badge variant={role === 'admin' ? 'default' : 'secondary'} className={role === 'admin' ? 'bg-primary' : ''}>
                         {role === 'admin' ? <Shield className="h-3 w-3 mr-1" /> : null}
                         {role}
                       </Badge>
                     </TableCell>
                     <TableCell>{new Date(profile.created_at).toLocaleDateString()}</TableCell>
                     <TableCell className="text-right">
                       <Button variant="outline" size="sm" onClick={() => openRoleDialog(profile.user_id)}>
                         Change Role
                       </Button>
                     </TableCell>
                   </TableRow>
                 );
               })}
             </TableBody>
           </Table>
         ) : (
           <div className="text-center py-8 text-muted-foreground">
             No users yet.
           </div>
         )}
       </CardContent>
 
       <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
         <DialogContent>
           <DialogHeader>
             <DialogTitle>Change User Role</DialogTitle>
           </DialogHeader>
           <div className="space-y-4 py-4">
             <Label>Select new role for this user:</Label>
             <div className="grid grid-cols-2 gap-4">
               <Button
                 variant={getUserRole(selectedUserId || '') === 'user' ? 'default' : 'outline'}
                 onClick={() => handleRoleChange('user')}
                 disabled={updateRoleMutation.isPending}
                 className="h-20 flex-col gap-2"
               >
                 <UserIcon className="h-6 w-6" />
                 <span>User</span>
               </Button>
               <Button
                 variant={getUserRole(selectedUserId || '') === 'admin' ? 'default' : 'outline'}
                 onClick={() => handleRoleChange('admin')}
                 disabled={updateRoleMutation.isPending}
                 className="h-20 flex-col gap-2 bg-primary"
               >
                 <Shield className="h-6 w-6" />
                 <span>Admin</span>
               </Button>
             </div>
           </div>
           <DialogFooter>
             <Button variant="outline" onClick={() => setIsRoleDialogOpen(false)}>
               Cancel
             </Button>
           </DialogFooter>
         </DialogContent>
       </Dialog>
     </Card>
   );
 }