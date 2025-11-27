import { useState } from "react";
import { Calendar, Clock, MapPin, DollarSign, User, Check, X, Eye } from "lucide-react";
import Header from "@/components/supplier/SupplierNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useServiceRequest } from "@/context/ServiceRequestContext";
import { useToast } from "@/hooks/use-toast";

const SupplierServiceRequests = () => {
  const handleSignOut = () => {
    // Mock sign out functionality
    console.log("Sign out clicked");
  };
  const { getRequestsBySupplier, updateServiceRequest } = useServiceRequest();
  const { toast } = useToast();
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);

  // Mock current supplier ID - in a real app, this would come from auth context
  const currentSupplierId = "14"; // Canva supplier ID

  const requests = getRequestsBySupplier(currentSupplierId);

  const handleAcceptRequest = (requestId: string) => {
    updateServiceRequest(requestId, { status: "accepted" });
    toast({
      title: "Request Accepted",
      description: "The service request has been accepted. Contact the customer to proceed.",
    });
  };

  const handleRejectRequest = (requestId: string) => {
    updateServiceRequest(requestId, { status: "cancelled" });
    toast({
      title: "Request Declined",
      description: "The service request has been declined.",
    });
  };

  const handleMarkInProgress = (requestId: string) => {
    updateServiceRequest(requestId, { status: "in_progress" });
    toast({
      title: "Request In Progress",
      description: "The service request status has been updated to in progress.",
    });
  };

  const handleMarkCompleted = (requestId: string) => {
    updateServiceRequest(requestId, { status: "completed" });
    toast({
      title: "Request Completed",
      description: "The service request has been marked as completed.",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "accepted":
        return "bg-blue-100 text-blue-800";
      case "in_progress":
        return "bg-purple-100 text-purple-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "Pending";
      case "accepted":
        return "Accepted";
      case "in_progress":
        return "In Progress";
      case "completed":
        return "Completed";
      case "cancelled":
        return "Cancelled";
      default:
        return status;
    }
  };

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Header onSignOut={handleSignOut} />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-4 sm:py-8 lg:ml-64 lg:max-w-[calc(100vw-16rem)]">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Service Requests</h1>
          <p className="text-muted-foreground">
            Manage incoming service requests from customers
          </p>
        </div>

        {requests.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <div className="text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No service requests yet</h3>
                <p>When customers request your services, they'll appear here.</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {requests.map((request) => (
              <Card key={request.id} className="overflow-hidden">
                <CardHeader className="pb-4">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex-1">
                      <CardTitle className="text-lg sm:text-xl mb-2">
                        {request.serviceName}
                      </CardTitle>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          {request.customerName}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(request.preferredDate).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {request.preferredTime}
                        </div>
                      </div>
                    </div>
                    <Badge className={getStatusColor(request.status)}>
                      {getStatusText(request.status)}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold mb-2">Service Details</h4>
                        <p className="text-sm text-muted-foreground mb-3">
                          {request.description}
                        </p>

                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span>{request.location}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">R{request.budget}</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-2">Contact Information</h4>
                        <div className="space-y-1 text-sm">
                          <p><strong>Email:</strong> {request.customerEmail}</p>
                          <p><strong>Phone:</strong> {request.customerPhone}</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold mb-2">Request Timeline</h4>
                        <div className="text-sm text-muted-foreground">
                          <p>Created: {new Date(request.createdAt).toLocaleDateString()}</p>
                          {request.updatedAt !== request.createdAt && (
                            <p>Updated: {new Date(request.updatedAt).toLocaleDateString()}</p>
                          )}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-2">Actions</h4>
                        <div className="flex flex-wrap gap-2">
                          {request.status === "pending" && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => handleAcceptRequest(request.id)}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <Check className="h-4 w-4 mr-1" />
                                Accept
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleRejectRequest(request.id)}
                                className="border-red-300 text-red-600 hover:bg-red-50"
                              >
                                <X className="h-4 w-4 mr-1" />
                                Decline
                              </Button>
                            </>
                          )}

                          {request.status === "accepted" && (
                            <Button
                              size="sm"
                              onClick={() => handleMarkInProgress(request.id)}
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              Start Work
                            </Button>
                          )}

                          {request.status === "in_progress" && (
                            <Button
                              size="sm"
                              onClick={() => handleMarkCompleted(request.id)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <Check className="h-4 w-4 mr-1" />
                              Complete
                            </Button>
                          )}

                          {request.status === "completed" && (
                            <Badge className="bg-green-100 text-green-800">
                              Completed
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SupplierServiceRequests;