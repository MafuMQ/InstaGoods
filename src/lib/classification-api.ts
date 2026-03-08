// ============================================================================
// Provider Type Assignment System - API Helper Functions
// ============================================================================

import { supabase } from '@/integrations/supabase/client';
import type {
  DatabaseSupplier,
  AdminSupplierView,
  PendingReviewSupplier,
  ClassificationAuditLog,
  ClassificationOverrideRequest,
  ClassificationResult,
  ProviderType,
  ProviderVerificationLevel,
} from './supabase-types';

/**
 * Get classification for a supplier without modifying data
 * Uses the database function for consistency
 */
export async function previewClassification(
  businessName: string,
  businessType: string,
  taxId?: string
): Promise<ClassificationResult> {
  const { data, error } = await supabase.rpc('classify_supplier', {
    p_business_name: businessName,
    p_business_type: businessType,
    p_tax_id: taxId || null,
  });

  if (error) {
    console.error('Classification preview error:', error);
    throw new Error('Failed to preview classification');
  }

  return data[0] as ClassificationResult;
}

/**
 * Get current supplier's classification
 */
export async function getMyClassification(): Promise<DatabaseSupplier | null> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return null;
  }

  const { data, error } = await supabase
    .from('suppliers')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (error) {
    console.error('Error fetching classification:', error);
    return null;
  }

  return data as DatabaseSupplier;
}

/**
 * Update own business info (triggers re-classification if business_type changes)
 */
export async function updateMyBusinessInfo(updates: {
  business_name?: string;
  business_type?: string;
  description?: string;
  location?: string;
  tax_id?: string;
}): Promise<{ success: boolean; error?: string }> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { success: false, error: 'Not authenticated' };
  }

  // Get current supplier
  const { data: currentSupplier } = await supabase
    .from('suppliers')
    .select('business_type, business_name')
    .eq('user_id', user.id)
    .single();

  if (!currentSupplier) {
    return { success: false, error: 'Supplier not found' };
  }

  // Check if business_type is being changed
  const isTypeChanging = updates.business_type && updates.business_type !== currentSupplier.business_type;

  // Perform update
  const { error } = await supabase
    .from('suppliers')
    .update(updates)
    .eq('user_id', user.id);

  if (error) {
    console.error('Error updating business info:', error);
    return { success: false, error: error.message };
  }

  // If business_type changed, get new classification
  if (isTypeChanging) {
    const newClassification = await previewClassification(
      updates.business_name || currentSupplier.business_name,
      updates.business_type,
      updates.tax_id
    );

    // Update classification fields
    await supabase
      .from('suppliers')
      .update({
        provider_type: newClassification.provider_type,
        provider_verification_level: newClassification.provider_verification_level,
        classification_reason: newClassification.classification_reason,
        review_status: newClassification.provider_type === 'internal' && newClassification.provider_verification_level === 'premium' 
          ? 'auto_approved' 
          : 'pending',
        classified_by: 'system',
        classified_at: new Date().toISOString(),
      })
      .eq('user_id', user.id);
  }

  return { success: true };
}

// ============================================================================
// Admin Functions
// ============================================================================

/**
 * Get all suppliers for admin view
 */
export async function getAdminSuppliers(filters?: {
  providerType?: ProviderType;
  verificationLevel?: ProviderVerificationLevel;
  reviewStatus?: string;
  search?: string;
}): Promise<AdminSupplierView[]> {
  let query = supabase
    .from('supplier_admin_view')
    .select('*')
    .order('created_at', { ascending: false });

  if (filters?.providerType) {
    query = query.eq('provider_type', filters.providerType);
  }

  if (filters?.verificationLevel) {
    query = query.eq('provider_verification_level', filters.verificationLevel);
  }

  if (filters?.reviewStatus) {
    query = query.eq('review_status', filters.reviewStatus);
  }

  if (filters?.search) {
    query = query.ilike('business_name', `%${filters.search}%`);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching admin suppliers:', error);
    throw error;
  }

  return data as AdminSupplierView[];
}

/**
 * Get suppliers pending review
 */
export async function getPendingReviewSuppliers(): Promise<PendingReviewSupplier[]> {
  const { data, error } = await supabase
    .from('supplier_pending_review_view')
    .select('*');

  if (error) {
    console.error('Error fetching pending reviews:', error);
    throw error;
  }

  return data as PendingReviewSupplier[];
}

/**
 * Override classification (admin only)
 */
export async function overrideClassification(
  request: ClassificationOverrideRequest,
  adminId: string
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase.rpc('override_supplier_classification', {
    p_supplier_id: request.supplier_id,
    p_provider_type: request.provider_type,
    p_provider_verification_level: request.provider_verification_level,
    p_admin_notes: request.admin_notes,
    p_admin_id: adminId,
  });

  if (error) {
    console.error('Error overriding classification:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Approve supplier (sets review_status to approved)
 */
export async function approveSupplier(supplierId: string): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from('suppliers')
    .update({ 
      review_status: 'approved',
      classified_at: new Date().toISOString(),
    })
    .eq('id', supplierId);

  if (error) {
    console.error('Error approving supplier:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Reject supplier
 */
export async function rejectSupplier(
  supplierId: string, 
  reason: string
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from('suppliers')
    .update({ 
      review_status: 'rejected',
      admin_notes: reason,
    })
    .eq('id', supplierId);

  if (error) {
    console.error('Error rejecting supplier:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Get classification audit log for a supplier
 */
export async function getClassificationAuditLog(
  supplierId: string
): Promise<ClassificationAuditLog[]> {
  const { data, error } = await supabase
    .from('classification_audit_log')
    .select('*')
    .eq('supplier_id', supplierId)
    .order('performed_at', { ascending: false });

  if (error) {
    console.error('Error fetching audit log:', error);
    throw error;
  }

  return data as ClassificationAuditLog[];
}

/**
 * Get supplier details by ID (admin)
 */
export async function getSupplierById(supplierId: string): Promise<AdminSupplierView | null> {
  const { data, error } = await supabase
    .from('supplier_admin_view')
    .select('*')
    .eq('id', supplierId)
    .single();

  if (error) {
    console.error('Error fetching supplier:', error);
    return null;
  }

  return data as AdminSupplierView;
}

/**
 * Get classification counts for dashboard
 */
export async function getClassificationStats(): Promise<{
  total: number;
  pending: number;
  internal: number;
  external: number;
  premium: number;
  verified: number;
  basic: number;
}> {
  const { data, error } = await supabase
    .from('suppliers')
    .select('review_status, provider_type, provider_verification_level');

  if (error) {
    console.error('Error fetching stats:', error);
    return {
      total: 0,
      pending: 0,
      internal: 0,
      external: 0,
      premium: 0,
      verified: 0,
      basic: 0,
    };
  }

  const stats = {
    total: data.length,
    pending: 0,
    internal: 0,
    external: 0,
    premium: 0,
    verified: 0,
    basic: 0,
  };

  data.forEach((supplier: any) => {
    if (supplier.review_status === 'pending') stats.pending++;
    if (supplier.provider_type === 'internal') stats.internal++;
    if (supplier.provider_type === 'external') stats.external++;
    if (supplier.provider_verification_level === 'premium') stats.premium++;
    if (supplier.provider_verification_level === 'verified') stats.verified++;
    if (supplier.provider_verification_level === 'basic') stats.basic++;
  });

  return stats;
}
