import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { 
  Search, 
  Filter, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Shield,
  Users,
  Building2,
  Star,
  Clock,
  ChevronDown,
  ChevronUp,
  History,
  RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter 
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  getAdminSuppliers, 
  getPendingReviewSuppliers, 
  overrideClassification,
  approveSupplier,
  rejectSupplier,
  getClassificationStats,
  getClassificationAuditLog 
} from "@/lib/classification-api";
import type { 
  AdminSupplierView, 
  PendingReviewSupplier,
  ClassificationAuditLog,
  ProviderType,
  ProviderVerificationLevel 
} from "@/lib/supabase-types";

// Provider badge component
const ProviderBadge = ({ 
  type, 
  level 
}: { 
  type: ProviderType; 
  level: ProviderVerificationLevel 
}) => {
  const typeColors = {
    internal: "bg-emerald-100 text-emerald-800 border-emerald-200",
    external: "bg-blue-100 text-blue-800 border-blue-200"
  };
  
  const levelColors = {
    basic: "bg-gray-100 text-gray-600",
    verified: "bg-cyan-100 text-cyan-700",
    premium: "bg-amber-100 text-amber-700"
  };

  return (
    <div className="flex gap-1">
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${typeColors[type]}`}>
        {type === 'internal' ? 'Internal' : 'External'}
      </span>
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${levelColors[level]}`}>
        {level === 'premium' ? '⭐' : level === 'verified' ? '✓' : '⚪'} {level}
      </span>
    </div>
  );
};

// Stats card component
const StatsCard = ({ 
  title, 
  value, 
  icon: Icon, 
  color 
}: { 
  title: string; 
  value: number; 
  icon: React.ElementType; 
  color: string;
}) => (
  <Card>
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold">{value}</p>
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </CardContent>
  </Card>
);

const SupplierManagement = () => {
  // State
  const [activeTab, setActiveTab] = useState("all");
  const [suppliers, setSuppliers] = useState<AdminSupplierView[]>([]);
  const [pendingSuppliers, setPendingSuppliers] = useState<PendingReviewSupplier[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    internal: 0,
    external: 0,
    premium: 0,
    verified: 0,
    basic: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    providerType: "all",
    verificationLevel: "all",
    reviewStatus: "all"
  });
  
  // Dialog state
  const [selectedSupplier, setSelectedSupplier] = useState<AdminSupplierView | null>(null);
  const [overrideDialogOpen, setOverrideDialogOpen] = useState(false);
  const [overrideForm, setOverrideForm] = useState({
    providerType: "external" as ProviderType,
    verificationLevel: "basic" as ProviderVerificationLevel,
    adminNotes: ""
  });
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [auditLogs, setAuditLogs] = useState<ClassificationAuditLog[]>([]);
  const [auditDialogOpen, setAuditDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load data
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [suppliersData, pendingData, statsData] = await Promise.all([
        getAdminSuppliers(
          filters.providerType !== "all" || filters.verificationLevel !== "all" || filters.reviewStatus !== "all" || searchQuery
            ? {
                providerType: filters.providerType !== "all" ? filters.providerType as ProviderType : undefined,
                verificationLevel: filters.verificationLevel !== "all" ? filters.verificationLevel as ProviderVerificationLevel : undefined,
                reviewStatus: filters.reviewStatus !== "all" ? filters.reviewStatus : undefined,
                search: searchQuery || undefined
              }
            : undefined
        ),
        getPendingReviewSuppliers(),
        getClassificationStats()
      ]);
      
      setSuppliers(suppliersData);
      setPendingSuppliers(pendingData);
      setStats(statsData);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  }, [filters, searchQuery]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle override classification
  const handleOverride = async () => {
    if (!selectedSupplier) return;
    
    setSaving(true);
    try {
      const result = await overrideClassification(
        {
          supplier_id: selectedSupplier.id,
          provider_type: overrideForm.providerType,
          provider_verification_level: overrideForm.verificationLevel,
          admin_notes: overrideForm.adminNotes
        },
        "current-admin-id" // Would come from auth in real implementation
      );
      
      if (result.success) {
        setOverrideDialogOpen(false);
        loadData();
      } else {
        alert("Error: " + result.error);
      }
    } catch (error) {
      console.error("Error overriding:", error);
    } finally {
      setSaving(false);
    }
  };

  // Handle approve
  const handleApprove = async (supplierId: string) => {
    setSaving(true);
    try {
      const result = await approveSupplier(supplierId);
      if (result.success) {
        loadData();
      } else {
        alert("Error: " + result.error);
      }
    } finally {
      setSaving(false);
    }
  };

  // Handle reject
  const handleReject = async () => {
    if (!selectedSupplier) return;
    
    setSaving(true);
    try {
      const result = await rejectSupplier(selectedSupplier.id, rejectReason);
      if (result.success) {
        setRejectDialogOpen(false);
        setRejectReason("");
        loadData();
      } else {
        alert("Error: " + result.error);
      }
    } finally {
      setSaving(false);
    }
  };

  // View audit log
  const handleViewAudit = async (supplier: AdminSupplierView) => {
    setSelectedSupplier(supplier);
    try {
      const logs = await getClassificationAuditLog(supplier.id);
      setAuditLogs(logs);
      setAuditDialogOpen(true);
    } catch (error) {
      console.error("Error loading audit log:", error);
    }
  };

  // Open override dialog
  const openOverrideDialog = (supplier: AdminSupplierView) => {
    setSelectedSupplier(supplier);
    setOverrideForm({
      providerType: supplier.provider_type,
      verificationLevel: supplier.provider_verification_level,
      adminNotes: ""
    });
    setOverrideDialogOpen(true);
  };

  // Open reject dialog
  const openRejectDialog = (supplier: AdminSupplierView) => {
    setSelectedSupplier(supplier);
    setRejectDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/">
                <Button variant="ghost">← Back</Button>
              </Link>
              <h1 className="text-2xl font-bold">Supplier Management</h1>
            </div>
            <Button onClick={loadData} variant="outline">
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
      </header>

      <div className="container py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatsCard title="Total Suppliers" value={stats.total} icon={Users} color="bg-blue-100 text-blue-600" />
          <StatsCard title="Pending Review" value={stats.pending} icon={Clock} color="bg-amber-100 text-amber-600" />
          <StatsCard title="Internal Partners" value={stats.internal} icon={Building2} color="bg-emerald-100 text-emerald-600" />
          <StatsCard title="Premium Partners" value={stats.premium} icon={Star} color="bg-amber-100 text-amber-600" />
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="all" className="gap-2">
              All Suppliers
              <Badge variant="secondary">{suppliers.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="pending" className="gap-2">
              Pending Review
              {stats.pending > 0 && (
                <Badge className="bg-amber-500">{stats.pending}</Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* All Suppliers Tab */}
          <TabsContent value="all">
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <CardTitle>All Suppliers</CardTitle>
                  
                  {/* Filters */}
                  <div className="flex flex-wrap gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input 
                        placeholder="Search suppliers..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 w-64"
                      />
                    </div>
                    
                    <Select 
                      value={filters.providerType} 
                      onValueChange={(v) => setFilters(f => ({ ...f, providerType: v }))}
                    >
                      <SelectTrigger className="w-36">
                        <SelectValue placeholder="Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="internal">Internal</SelectItem>
                        <SelectItem value="external">External</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select 
                      value={filters.verificationLevel} 
                      onValueChange={(v) => setFilters(f => ({ ...f, verificationLevel: v }))}
                    >
                      <SelectTrigger className="w-36">
                        <SelectValue placeholder="Level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Levels</SelectItem>
                        <SelectItem value="basic">Basic</SelectItem>
                        <SelectItem value="verified">Verified</SelectItem>
                        <SelectItem value="premium">Premium</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select 
                      value={filters.reviewStatus} 
                      onValueChange={(v) => setFilters(f => ({ ...f, reviewStatus: v }))}
                    >
                      <SelectTrigger className="w-36">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-medium">Business</th>
                        <th className="text-left py-3 px-4 font-medium">Type</th>
                        <th className="text-left py-3 px-4 font-medium">Classification</th>
                        <th className="text-left py-3 px-4 font-medium">Status</th>
                        <th className="text-left py-3 px-4 font-medium">Metrics</th>
                        <th className="text-left py-3 px-4 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr>
                          <td colSpan={6} className="text-center py-8">
                            <RefreshCw className="w-6 h-6 animate-spin mx-auto" />
                          </td>
                        </tr>
                      ) : suppliers.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="text-center py-8 text-muted-foreground">
                            No suppliers found
                          </td>
                        </tr>
                      ) : (
                        suppliers.map((supplier) => (
                          <tr key={supplier.id} className="border-b hover:bg-muted/50">
                            <td className="py-3 px-4">
                              <div>
                                <p className="font-medium">{supplier.business_name}</p>
                                <p className="text-sm text-muted-foreground">{supplier.location || 'No location'}</p>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <Badge variant="outline">{supplier.business_type}</Badge>
                            </td>
                            <td className="py-3 px-4">
                              <ProviderBadge 
                                type={supplier.provider_type} 
                                level={supplier.provider_verification_level} 
                              />
                            </td>
                            <td className="py-3 px-4">
                              <Badge 
                                className={
                                  supplier.review_status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                                  supplier.review_status === 'pending' ? 'bg-amber-100 text-amber-800' :
                                  supplier.review_status === 'rejected' ? 'bg-red-100 text-red-800' :
                                  'bg-blue-100 text-blue-800'
                                }
                              >
                                {supplier.review_status === 'auto_approved' ? 'Auto-approved' : supplier.review_status}
                              </Badge>
                            </td>
                            <td className="py-3 px-4">
                              <div className="text-sm">
                                <span>{supplier.total_orders} orders</span>
                                <span className="mx-2">•</span>
                                <span>⭐ {supplier.avg_rating.toFixed(1)}</span>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex gap-2">
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handleViewAudit(supplier)}
                                >
                                  <History className="w-4 h-4" />
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => openOverrideDialog(supplier)}
                                >
                                  Override
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pending Review Tab */}
          <TabsContent value="pending">
            <Card>
              <CardHeader>
                <CardTitle>Suppliers Pending Review</CardTitle>
              </CardHeader>
              <CardContent>
                {pendingSuppliers.length === 0 ? (
                  <div className="text-center py-12">
                    <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">All caught up!</h3>
                    <p className="text-muted-foreground">No suppliers pending review</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingSuppliers.map((supplier) => (
                      <div 
                        key={supplier.id} 
                        className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold">{supplier.business_name}</h3>
                              <Badge variant="outline">{supplier.business_type}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {supplier.description || 'No description'}
                            </p>
                            <div className="flex items-center gap-4 text-sm">
                              <span className="text-muted-foreground">
                                {supplier.location || 'No location'}
                              </span>
                              <span className="text-muted-foreground">
                                Applied: {new Date(supplier.created_at).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="mt-2">
                              <ProviderBadge 
                                type={supplier.provider_type} 
                                level={supplier.provider_verification_level} 
                              />
                            </div>
                            {supplier.classification_reason && (
                              <p className="text-xs text-muted-foreground mt-2">
                                Reason: {supplier.classification_reason}
                              </p>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              variant="outline"
                              onClick={() => {
                                const fullSupplier = suppliers.find(s => s.id === supplier.id);
                                if (fullSupplier) openOverrideDialog(fullSupplier);
                              }}
                            >
                              Override
                            </Button>
                            <Button 
                              variant="destructive"
                              onClick={() => {
                                const fullSupplier = suppliers.find(s => s.id === supplier.id);
                                if (fullSupplier) openRejectDialog(fullSupplier);
                              }}
                            >
                              Reject
                            </Button>
                            <Button 
                              onClick={() => handleApprove(supplier.id)}
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Approve
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Override Classification Dialog */}
      <Dialog open={overrideDialogOpen} onOpenChange={setOverrideDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Override Classification</DialogTitle>
            <DialogDescription>
              Manually override the classification for {selectedSupplier?.business_name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Provider Type</label>
              <Select 
                value={overrideForm.providerType} 
                onValueChange={(v) => setOverrideForm(f => ({ ...f, providerType: v as ProviderType }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="internal">Internal (InstaGoods Partner)</SelectItem>
                  <SelectItem value="external">External (Third-party)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Verification Level</label>
              <Select 
                value={overrideForm.verificationLevel} 
                onValueChange={(v) => setOverrideForm(f => ({ ...f, verificationLevel: v as ProviderVerificationLevel }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="basic">Basic - New or unverified</SelectItem>
                  <SelectItem value="verified">Verified - Identity verified</SelectItem>
                  <SelectItem value="premium">Premium - Highly trusted</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Admin Notes</label>
              <Textarea 
                placeholder="Reason for override..."
                value={overrideForm.adminNotes}
                onChange={(e) => setOverrideForm(f => ({ ...f, adminNotes: e.target.value }))}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOverrideDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleOverride} disabled={saving}>
              {saving ? 'Saving...' : 'Save Override'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Supplier Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Supplier</DialogTitle>
            <DialogDescription>
              Reject {selectedSupplier?.business_name} from the platform
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <label className="text-sm font-medium mb-2 block">Rejection Reason</label>
            <Textarea 
              placeholder="Reason for rejection..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleReject} disabled={saving}>
              {saving ? 'Rejecting...' : 'Reject Supplier'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Audit Log Dialog */}
      <Dialog open={auditDialogOpen} onOpenChange={setAuditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Classification History</DialogTitle>
            <DialogDescription>
              Audit log for {selectedSupplier?.business_name}
            </DialogDescription>
          </DialogHeader>
          
          {auditLogs.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">No audit history</p>
          ) : (
            <div className="space-y-4">
              {auditLogs.map((log) => (
                <div key={log.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{log.action}</Badge>
                      <span className="text-sm text-muted-foreground">
                        {new Date(log.performed_at).toLocaleString()}
                      </span>
                    </div>
                    <span className="text-sm">by {log.performed_by}</span>
                  </div>
                  
                  {(log.previous_provider_type || log.new_provider_type) && (
                    <div className="text-sm mb-1">
                      <span className="text-muted-foreground">Type: </span>
                      {log.previous_provider_type && (
                        <span className="line-through mr-2">{log.previous_provider_type}</span>
                      )}
                      → <span className="font-medium ml-2">{log.new_provider_type}</span>
                    </div>
                  )}
                  
                  {(log.previous_verification_level || log.new_verification_level) && (
                    <div className="text-sm mb-2">
                      <span className="text-muted-foreground">Level: </span>
                      {log.previous_verification_level && (
                        <span className="line-through mr-2">{log.previous_verification_level}</span>
                      )}
                      → <span className="font-medium ml-2">{log.new_verification_level}</span>
                    </div>
                  )}
                  
                  {log.reason && (
                    <p className="text-sm text-muted-foreground">{log.reason}</p>
                  )}
                </div>
              ))}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setAuditDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SupplierManagement;
