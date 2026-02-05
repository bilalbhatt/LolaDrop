 import { useState, useRef } from 'react';
 import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
 import { Button } from '@/components/ui/button';
 import { supabase } from '@/integrations/supabase/client';
 import { toast } from 'sonner';
 
 interface ImageUploadProps {
   currentUrl?: string | null;
   onUpload: (url: string) => void;
   folder?: string;
 }
 
 export function ImageUpload({ currentUrl, onUpload, folder = 'products' }: ImageUploadProps) {
   const [isUploading, setIsUploading] = useState(false);
   const [previewUrl, setPreviewUrl] = useState<string | null>(currentUrl || null);
   const fileInputRef = useRef<HTMLInputElement>(null);
 
   const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
     const file = e.target.files?.[0];
     if (!file) return;
 
     // Validate file type
     if (!file.type.startsWith('image/')) {
       toast.error('Please select an image file');
       return;
     }
 
     // Validate file size (max 5MB)
     if (file.size > 5 * 1024 * 1024) {
       toast.error('Image size must be less than 5MB');
       return;
     }
 
     setIsUploading(true);
 
     try {
       const fileExt = file.name.split('.').pop();
       const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
 
       const { error: uploadError, data } = await supabase.storage
         .from('product-images')
         .upload(fileName, file);
 
       if (uploadError) throw uploadError;
 
       const { data: urlData } = supabase.storage
         .from('product-images')
         .getPublicUrl(fileName);
 
       const publicUrl = urlData.publicUrl;
       setPreviewUrl(publicUrl);
       onUpload(publicUrl);
       toast.success('Image uploaded successfully!');
     } catch (error: any) {
       toast.error('Failed to upload image: ' + error.message);
     } finally {
       setIsUploading(false);
     }
   };
 
   const clearImage = () => {
     setPreviewUrl(null);
     onUpload('');
     if (fileInputRef.current) {
       fileInputRef.current.value = '';
     }
   };
 
   return (
     <div className="space-y-3">
       <input
         type="file"
         ref={fileInputRef}
         onChange={handleFileSelect}
         accept="image/*"
         className="hidden"
       />
 
       {previewUrl ? (
         <div className="relative">
           <img
             src={previewUrl}
             alt="Preview"
             className="w-full h-32 object-cover rounded-lg border"
           />
           <Button
             type="button"
             variant="destructive"
             size="icon"
             className="absolute top-2 right-2 h-6 w-6"
             onClick={clearImage}
           >
             <X className="h-4 w-4" />
           </Button>
         </div>
       ) : (
         <div
           onClick={() => fileInputRef.current?.click()}
           className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
         >
           {isUploading ? (
             <div className="flex flex-col items-center gap-2">
               <Loader2 className="h-8 w-8 animate-spin text-primary" />
               <span className="text-sm text-muted-foreground">Uploading...</span>
             </div>
           ) : (
             <div className="flex flex-col items-center gap-2">
               <ImageIcon className="h-8 w-8 text-muted-foreground" />
               <span className="text-sm text-muted-foreground">Click to upload image</span>
               <span className="text-xs text-muted-foreground/70">Max 5MB</span>
             </div>
           )}
         </div>
       )}
 
       <Button
         type="button"
         variant="outline"
         size="sm"
         onClick={() => fileInputRef.current?.click()}
         disabled={isUploading}
         className="w-full"
       >
         <Upload className="h-4 w-4 mr-2" />
         {previewUrl ? 'Change Image' : 'Upload Image'}
       </Button>
     </div>
   );
 }