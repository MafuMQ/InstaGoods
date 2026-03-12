import { useSupplierAuth } from "@/hooks/useSupplierAuth";
import SupplierNav from "@/components/supplier/SupplierNav";
import { Loading } from "@/components/ui/loading-spinner";
import SupplierChat from "@/components/supplier/SupplierChat";
import { useSupplierNav } from "@/contexts/SupplierNavContext";

const SupplierMessages = () => {
  const { loading, supplierId, signOut, user: authUser } = useSupplierAuth();
  const { collapsed } = useSupplierNav();

  // Format user data for SupplierNav
  const user = authUser ? {
    name: authUser.user_metadata?.full_name || authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'User',
    email: authUser.email || '',
    avatar: authUser.user_metadata?.avatar_url || authUser.user_metadata?.picture
  } : undefined;

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <SupplierNav onSignOut={signOut} supplierId={supplierId} user={user} />
        <div className="min-h-screen flex items-center justify-center">
          <Loading />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <SupplierNav onSignOut={signOut} supplierId={supplierId} user={user} />
      
      <div className={`mx-auto max-w-7xl py-4 md:py-8 px-4 transition-all duration-300 ${collapsed ? "lg:ml-16 lg:max-w-[calc(100vw-4rem)]" : "lg:ml-64 lg:max-w-[calc(100vw-16rem)]"}`}>
        <h1 className="text-2xl md:text-4xl font-bold mb-6">Customer Messages</h1>
        <SupplierChat supplierId={supplierId} className="h-[calc(100vh-200px)]" />
      </div>
    </div>
  );
};

export default SupplierMessages;
