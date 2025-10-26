import { useState } from "react";
import { useForm } from "react-hook-form";
import { Calendar, Clock, MapPin, DollarSign, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useServiceRequest } from "@/context/ServiceRequestContext";
import { useToast } from "@/hooks/use-toast";

interface ServiceRequestFormData {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  description: string;
  location: string;
  preferredDate: string;
  preferredTime: string;
  budget: number;
}

interface ServiceRequestFormProps {
  isOpen: boolean;
  onClose: () => void;
  serviceId: string;
  serviceName: string;
  supplierId: string;
  supplierName: string;
}

const ServiceRequestForm = ({
  isOpen,
  onClose,
  serviceId,
  serviceName,
  supplierId,
  supplierName,
}: ServiceRequestFormProps) => {
  const { createServiceRequest } = useServiceRequest();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<ServiceRequestFormData>();

  const onSubmit = async (data: ServiceRequestFormData) => {
    setIsSubmitting(true);

    try {
      createServiceRequest({
        serviceId,
        serviceName,
        supplierId,
        supplierName,
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        customerPhone: data.customerPhone,
        description: data.description,
        location: data.location,
        preferredDate: data.preferredDate,
        preferredTime: data.preferredTime,
        budget: data.budget,
      });

      toast({
        title: "Service Request Submitted!",
        description: "Your service request has been sent to the supplier. They'll contact you soon.",
      });

      reset();
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit service request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Request Service
          </DialogTitle>
          <DialogDescription>
            Request <strong>{serviceName}</strong> from <strong>{supplierName}</strong>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contact Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customerName">Full Name *</Label>
                <Input
                  id="customerName"
                  {...register("customerName", { required: "Full name is required" })}
                  placeholder="Enter your full name"
                />
                {errors.customerName && (
                  <p className="text-sm text-red-500">{errors.customerName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="customerPhone">Phone Number *</Label>
                <Input
                  id="customerPhone"
                  type="tel"
                  {...register("customerPhone", {
                    required: "Phone number is required",
                    pattern: {
                      value: /^[+]?[0-9\s\-()]+$/,
                      message: "Please enter a valid phone number",
                    },
                  })}
                  placeholder="+27 XX XXX XXXX"
                />
                {errors.customerPhone && (
                  <p className="text-sm text-red-500">{errors.customerPhone.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="customerEmail">Email Address *</Label>
              <Input
                id="customerEmail"
                type="email"
                {...register("customerEmail", {
                  required: "Email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Please enter a valid email address",
                  },
                })}
                placeholder="your.email@example.com"
              />
              {errors.customerEmail && (
                <p className="text-sm text-red-500">{errors.customerEmail.message}</p>
              )}
            </div>
          </div>

          {/* Service Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Service Details</h3>

            <div className="space-y-2">
              <Label htmlFor="description">Describe what you need *</Label>
              <Textarea
                id="description"
                {...register("description", {
                  required: "Please describe what service you need",
                  minLength: {
                    value: 20,
                    message: "Please provide more details (at least 20 characters)",
                  },
                })}
                placeholder="Please describe the service you need, including any specific requirements, scope of work, or special instructions..."
                rows={4}
              />
              {errors.description && (
                <p className="text-sm text-red-500">{errors.description.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="location" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Service Location *
              </Label>
              <Input
                id="location"
                {...register("location", { required: "Service location is required" })}
                placeholder="Enter the address where the service should be performed"
              />
              {errors.location && (
                <p className="text-sm text-red-500">{errors.location.message}</p>
              )}
            </div>
          </div>

          {/* Scheduling */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Scheduling</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="preferredDate" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Preferred Date *
                </Label>
                <Input
                  id="preferredDate"
                  type="date"
                  {...register("preferredDate", { required: "Preferred date is required" })}
                  min={new Date().toISOString().split("T")[0]}
                />
                {errors.preferredDate && (
                  <p className="text-sm text-red-500">{errors.preferredDate.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="preferredTime" className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Preferred Time *
                </Label>
                <Select onValueChange={(value) => setValue("preferredTime", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select preferred time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="morning">Morning (8:00 AM - 12:00 PM)</SelectItem>
                    <SelectItem value="afternoon">Afternoon (12:00 PM - 5:00 PM)</SelectItem>
                    <SelectItem value="evening">Evening (5:00 PM - 8:00 PM)</SelectItem>
                    <SelectItem value="flexible">Flexible</SelectItem>
                  </SelectContent>
                </Select>
                {errors.preferredTime && (
                  <p className="text-sm text-red-500">{errors.preferredTime.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Budget */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Budget</h3>

            <div className="space-y-2">
              <Label htmlFor="budget" className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Your Budget (R) *
              </Label>
              <Input
                id="budget"
                type="number"
                {...register("budget", {
                  required: "Budget is required",
                  min: {
                    value: 1,
                    message: "Budget must be greater than 0",
                  },
                })}
                placeholder="Enter your budget for this service"
                min="1"
              />
              {errors.budget && (
                <p className="text-sm text-red-500">{errors.budget.message}</p>
              )}
              <p className="text-sm text-muted-foreground">
                This is your proposed budget. The supplier may accept or counter-offer.
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Request"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ServiceRequestForm;