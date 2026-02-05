 import { Header } from '@/components/layout/Header';
 import { Footer } from '@/components/layout/Footer';
 import { Construction, ArrowLeft } from 'lucide-react';
 import { Button } from '@/components/ui/button';
 import { Link } from 'react-router-dom';
 
 export default function ComingSoon() {
   return (
     <div className="min-h-screen flex flex-col">
       <Header />
       
       <main className="flex-1 flex items-center justify-center bg-muted/30">
         <div className="container max-w-lg text-center py-16">
           <div className="flex justify-center mb-6">
             <div className="h-24 w-24 rounded-full bg-gradient-hero flex items-center justify-center">
               <Construction className="h-12 w-12 text-primary-foreground" />
             </div>
           </div>
           
           <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
             Coming Soon!
           </h1>
           
           <p className="text-muted-foreground mb-8 text-lg">
             We're working hard to bring you this feature. Stay tuned for updates!
           </p>
           
           <Link to="/">
             <Button className="bg-gradient-hero hover:opacity-90">
               <ArrowLeft className="h-4 w-4 mr-2" />
               Back to Home
             </Button>
           </Link>
         </div>
       </main>
       
       <Footer />
     </div>
   );
 }