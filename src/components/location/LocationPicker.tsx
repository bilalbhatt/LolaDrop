 import { useState, useEffect } from 'react';
 import { MapPin, Loader2, Navigation } from 'lucide-react';
 import { Button } from '@/components/ui/button';
 import { Input } from '@/components/ui/input';
 import { Label } from '@/components/ui/label';
 import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
 import { toast } from 'sonner';
 import { supabase } from '@/integrations/supabase/client';
 import { useAuth } from '@/contexts/AuthContext';
 
 interface LocationPickerProps {
   onLocationSelect?: (lat: number, lng: number, address: string) => void;
 }
 
 export function LocationPicker({ onLocationSelect }: LocationPickerProps) {
   const { user } = useAuth();
   const [isLoading, setIsLoading] = useState(false);
   const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
   const [address, setAddress] = useState('');
 
   useEffect(() => {
     // Load saved location from profile
     const loadSavedLocation = async () => {
       if (!user) return;
       
       const { data, error } = await supabase
         .from('profiles')
         .select('latitude, longitude, delivery_address')
         .eq('user_id', user.id)
         .maybeSingle();
       
       if (data && !error) {
         if (data.latitude && data.longitude) {
           setLocation({ lat: data.latitude, lng: data.longitude });
         }
         if (data.delivery_address) {
           setAddress(data.delivery_address);
         }
       }
     };
     
     loadSavedLocation();
   }, [user]);
 
   const getCurrentLocation = () => {
     if (!navigator.geolocation) {
       toast.error('Geolocation is not supported by your browser');
       return;
     }
 
     setIsLoading(true);
     navigator.geolocation.getCurrentPosition(
       async (position) => {
         const { latitude, longitude } = position.coords;
         setLocation({ lat: latitude, lng: longitude });
         setIsLoading(false);
         toast.success('Location detected successfully!');
         
         // Save to profile if user is logged in
         if (user) {
           await supabase
             .from('profiles')
             .update({ 
               latitude: latitude, 
               longitude: longitude,
               delivery_address: address || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
             })
             .eq('user_id', user.id);
         }
         
         onLocationSelect?.(latitude, longitude, address);
       },
       (error) => {
         setIsLoading(false);
         switch (error.code) {
           case error.PERMISSION_DENIED:
             toast.error('Location permission denied. Please enable it in your browser settings.');
             break;
           case error.POSITION_UNAVAILABLE:
             toast.error('Location information is unavailable.');
             break;
           case error.TIMEOUT:
             toast.error('Location request timed out.');
             break;
           default:
             toast.error('An unknown error occurred.');
         }
       },
       { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
     );
   };
 
   const saveAddress = async () => {
     if (!user) {
       toast.error('Please sign in to save your address');
       return;
     }
     
     const { error } = await supabase
       .from('profiles')
       .update({ 
         delivery_address: address,
         latitude: location?.lat,
         longitude: location?.lng
       })
       .eq('user_id', user.id);
     
     if (error) {
       toast.error('Failed to save address');
     } else {
       toast.success('Delivery address saved!');
       onLocationSelect?.(location?.lat || 0, location?.lng || 0, address);
     }
   };
 
   return (
     <Card>
       <CardHeader>
         <CardTitle className="flex items-center gap-2 text-lg">
           <MapPin className="h-5 w-5 text-primary" />
           Delivery Location
         </CardTitle>
       </CardHeader>
       <CardContent className="space-y-4">
         <Button
           onClick={getCurrentLocation}
           disabled={isLoading}
           variant="outline"
           className="w-full"
         >
           {isLoading ? (
             <Loader2 className="h-4 w-4 mr-2 animate-spin" />
           ) : (
             <Navigation className="h-4 w-4 mr-2" />
           )}
           {isLoading ? 'Detecting...' : 'Use My Current Location'}
         </Button>
 
         {location && (
           <div className="p-3 bg-accent/50 rounded-lg text-sm">
             <p className="text-muted-foreground">
               📍 Coordinates: {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
             </p>
           </div>
         )}
 
         <div className="space-y-2">
           <Label htmlFor="address">Delivery Address</Label>
           <Input
             id="address"
             value={address}
             onChange={(e) => setAddress(e.target.value)}
             placeholder="Enter your full delivery address..."
           />
         </div>
 
         <Button onClick={saveAddress} className="w-full bg-gradient-hero hover:opacity-90">
           Save Delivery Address
         </Button>
       </CardContent>
     </Card>
   );
 }