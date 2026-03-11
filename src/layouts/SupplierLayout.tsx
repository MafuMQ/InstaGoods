import { ReactNode } from "react";
import { SupplierNavProvider } from "@/contexts/SupplierNavContext";
import { Outlet } from "react-router-dom";

interface SupplierLayoutProps {
  children?: ReactNode;
}

export function SupplierLayout() {
  return (
    <SupplierNavProvider>
      <Outlet />
    </SupplierNavProvider>
  );
}
