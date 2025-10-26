import { createContext, useContext, useState, ReactNode } from "react";
import { Freelance, suppliers } from "@/lib/data";

export interface ServiceRequest {
  id: string;
  serviceId: string;
  serviceName: string;
  supplierId: string;
  supplierName: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  description: string;
  location: string;
  preferredDate: string;
  preferredTime: string;
  budget: number;
  status: "pending" | "accepted" | "in_progress" | "completed" | "cancelled";
  createdAt: string;
  updatedAt: string;
}

interface ServiceRequestContextType {
  serviceRequests: ServiceRequest[];
  createServiceRequest: (request: Omit<ServiceRequest, "id" | "status" | "createdAt" | "updatedAt">) => void;
  updateServiceRequest: (id: string, updates: Partial<ServiceRequest>) => void;
  getRequestsBySupplier: (supplierId: string) => ServiceRequest[];
  getRequestsByCustomer: (customerEmail: string) => ServiceRequest[];
  getWishlistCount: () => number;
}

const ServiceRequestContext = createContext<ServiceRequestContextType | undefined>(undefined);

export const ServiceRequestProvider = ({ children }: { children: ReactNode }) => {
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>(() => {
    const savedRequests = localStorage.getItem("serviceRequests");
    return savedRequests ? JSON.parse(savedRequests) : [];
  });

  const createServiceRequest = (requestData: Omit<ServiceRequest, "id" | "status" | "createdAt" | "updatedAt">) => {
    const newRequest: ServiceRequest = {
      ...requestData,
      id: Date.now().toString(),
      status: "pending",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setServiceRequests((prev) => {
      const updated = [...prev, newRequest];
      localStorage.setItem("serviceRequests", JSON.stringify(updated));
      return updated;
    });
  };

  const updateServiceRequest = (id: string, updates: Partial<ServiceRequest>) => {
    setServiceRequests((prev) => {
      const updated = prev.map((request) =>
        request.id === id
          ? { ...request, ...updates, updatedAt: new Date().toISOString() }
          : request
      );
      localStorage.setItem("serviceRequests", JSON.stringify(updated));
      return updated;
    });
  };

  const getRequestsBySupplier = (supplierId: string) => {
    return serviceRequests.filter((request) => request.supplierId === supplierId);
  };

  const getRequestsByCustomer = (customerEmail: string) => {
    return serviceRequests.filter((request) => request.customerEmail === customerEmail);
  };

  const getWishlistCount = () => {
    return serviceRequests.length;
  };

  return (
    <ServiceRequestContext.Provider
      value={{
        serviceRequests,
        createServiceRequest,
        updateServiceRequest,
        getRequestsBySupplier,
        getRequestsByCustomer,
        getWishlistCount,
      }}
    >
      {children}
    </ServiceRequestContext.Provider>
  );
};

export const useServiceRequest = () => {
  const context = useContext(ServiceRequestContext);
  if (!context) {
    throw new Error("useServiceRequest must be used within a ServiceRequestProvider");
  }
  return context;
};