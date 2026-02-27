// ============================================================================
// Provider Type Assignment System - TypeScript Types
// ============================================================================

// Database types that mirror the Supabase tables

export type ProviderType = 'internal' | 'external';
export type ProviderVerificationLevel = 'basic' | 'verified' | 'premium';
export type BusinessType = 'retail_chain' | 'franchise' | 'smb' | 'sole_trader' | 'freelancer';
export type ReviewStatus = 'pending' | 'approved' | 'rejected' | 'auto_approved';

export interface SupplierClassification {
  provider_type: ProviderType;
  provider_verification_level: ProviderVerificationLevel;
  classification_reason: string;
}

// Supplier from database with all classification fields
export interface DatabaseSupplier {
  id: string;
  user_id: string;
  business_name: string;
  description: string | null;
  location: string | null;
  phone: string | null;
  provider_type: ProviderType;
  provider_verification_level: ProviderVerificationLevel;
  business_type: BusinessType;
  tax_id: string | null;
  review_status: ReviewStatus;
  admin_notes: string | null;
  classification_reason: string | null;
  classified_by: string | null;
  classified_at: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Admin view of supplier with metrics
export interface AdminSupplierView {
  id: string;
  user_id: string;
  business_name: string;
  description: string | null;
  location: string | null;
  phone: string | null;
  provider_type: ProviderType;
  provider_verification_level: ProviderVerificationLevel;
  business_type: BusinessType;
  tax_id: string | null;
  review_status: ReviewStatus;
  admin_notes: string | null;
  classification_reason: string | null;
  classified_by: string | null;
  classified_at: string | null;
  is_active: boolean;
  created_at: string;
  total_orders: number;
  avg_rating: number;
  total_reviews: number;
}

// Pending review supplier
export interface PendingReviewSupplier {
  id: string;
  business_name: string;
  description: string | null;
  location: string | null;
  phone: string | null;
  provider_type: ProviderType;
  provider_verification_level: ProviderVerificationLevel;
  business_type: BusinessType;
  classification_reason: string | null;
  created_at: string;
  classified_at: string | null;
}

// Classification audit log entry
export interface ClassificationAuditLog {
  id: string;
  supplier_id: string;
  action: 'auto_classified' | 'admin_override' | 'system_update';
  previous_provider_type: ProviderType | null;
  new_provider_type: ProviderType;
  previous_verification_level: ProviderVerificationLevel | null;
  new_verification_level: ProviderVerificationLevel;
  reason: string | null;
  performed_by: string;
  performed_at: string;
  metadata: Record<string, unknown>;
}

// Registration data for new suppliers
export interface SupplierRegistrationData {
  email: string;
  password: string;
  full_name: string;
  business_name: string;
  business_type: BusinessType;
  tax_id?: string;
  location?: string;
  description?: string;
}

// Classification override request (for admin)
export interface ClassificationOverrideRequest {
  supplier_id: string;
  provider_type: ProviderType;
  provider_verification_level: ProviderVerificationLevel;
  admin_notes: string;
}

// Classification result from classify_supplier function
export interface ClassificationResult {
  provider_type: ProviderType;
  provider_verification_level: ProviderVerificationLevel;
  classification_reason: string;
}

// Business type options with labels
export const BUSINESS_TYPE_OPTIONS: { value: BusinessType; label: string; description: string }[] = [
  { value: 'retail_chain', label: 'Retail Chain', description: 'Major retail store chains (e.g., Pick n Pay, Spar)' },
  { value: 'franchise', label: 'Franchise', description: 'Franchise business operations' },
  { value: 'smb', label: 'Small/Medium Business', description: 'Registered small to medium business' },
  { value: 'sole_trader', label: 'Sole Trader', description: 'Individual business owner' },
  { value: 'freelancer', label: 'Freelancer', description: 'Independent freelancer or contractor' },
];

// Provider type options with labels
export const PROVIDER_TYPE_OPTIONS: { value: ProviderType; label: string; description: string; color: string }[] = [
  { value: 'internal', label: 'Internal', description: 'InstaGoods curated partner', color: 'bg-emerald-100 text-emerald-800' },
  { value: 'external', label: 'External', description: 'Third-party provider', color: 'bg-blue-100 text-blue-800' },
];

// Verification level options with labels
export const VERIFICATION_LEVEL_OPTIONS: { value: ProviderVerificationLevel; label: string; description: string; icon: string }[] = [
  { value: 'basic', label: 'Basic', description: 'New or unverified', icon: '⚪' },
  { value: 'verified', label: 'Verified', description: 'Identity verified', icon: '✓' },
  { value: 'premium', label: 'Premium', description: 'Highly trusted partner', icon: '⭐' },
];

// Classification reason descriptions
export const CLASSIFICATION_REASONS: Record<string, string> = {
  'Major retail chain or registered business with tax ID': 'Automatically classified as internal premium partner',
  'Franchise business': 'Automatically classified as internal verified partner',
  'Registered SMB with tax ID': 'Automatically classified as internal verified partner',
  'Retail chain business type': 'Automatically classified as internal verified partner',
  'Freelancer - default external classification': 'Default classification for freelance service providers',
  'Sole proprietor - default external classification': 'Default classification for individual business owners',
  'SMB without verified tax ID - flagged for review': 'External business pending admin review',
  'Default classification - no specific type matched': 'Manual classification may be required',
};
