import { BadgeCheck, Link2, Sparkles, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type ProviderType = 'internal' | 'external';
export type VerificationLevel = 'basic' | 'verified' | 'premium';

interface ProviderBadgeProps {
  providerType?: ProviderType;
  verificationLevel?: VerificationLevel;
  showLabel?: boolean;
  className?: string;
}

interface BadgeConfig {
  icon: LucideIcon;
  label: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
  iconColor: string;
}

export function ProviderBadge({
  providerType = 'external',
  verificationLevel = 'basic',
  showLabel = true,
  className
}: ProviderBadgeProps) {
  // Internal = InstaGoods Curated
  // External = Partner/Third-party
  
  const isInternal = providerType === 'internal';
  
  const config: Record<ProviderType, BadgeConfig> = {
    internal: {
      icon: Sparkles,
      label: 'InstaGoods Curated',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700',
      borderColor: 'border-blue-200',
      iconColor: 'text-blue-600'
    },
    external: {
      icon: Link2,
      label: 'Verified Partner',
      bgColor: 'bg-gray-50',
      textColor: 'text-gray-700',
      borderColor: 'border-gray-200',
      iconColor: 'text-gray-600'
    }
  };
  
  const levelConfig: Record<VerificationLevel, BadgeConfig> = {
    basic: {
      icon: Sparkles,
      label: 'New Partner',
      bgColor: 'bg-green-50',
      textColor: 'text-green-700',
      borderColor: 'border-green-200',
      iconColor: 'text-green-600'
    },
    verified: {
      icon: BadgeCheck,
      label: 'Verified',
      bgColor: 'bg-slate-50',
      textColor: 'text-slate-700',
      borderColor: 'border-slate-200',
      iconColor: 'text-slate-600'
    },
    premium: {
      icon: BadgeCheck,
      label: 'Premium',
      bgColor: 'bg-amber-50',
      textColor: 'text-amber-700',
      borderColor: 'border-amber-200',
      iconColor: 'text-amber-600'
    }
  };
  
  const baseConfig = config[providerType];
  const level = levelConfig[verificationLevel];
  const IconComponent = level.icon;
  
  return (
    <div 
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium border",
        baseConfig.bgColor,
        baseConfig.textColor,
        baseConfig.borderColor,
        className
      )}
    >
      <IconComponent className={cn("w-3.5 h-3.5", baseConfig.iconColor)} />
      {showLabel && (
        <span>
          {isInternal ? baseConfig.label : level.label}
        </span>
      )}
    </div>
  );
}

/**
 * Compact badge for displaying in card footers
 */
export function ProviderBadgeCompact({
  providerType = 'external',
  className
}: Omit<ProviderBadgeProps, 'showLabel'>) {
  const isInternal = providerType === 'internal';
  
  return (
    <div 
      className={cn(
        "inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium",
        isInternal 
          ? "bg-blue-100 text-blue-700" 
          : "bg-gray-100 text-gray-600",
        className
      )}
      title={isInternal ? 'InstaGoods Curated Service' : 'External Partner'}
    >
      {isInternal ? (
        <Sparkles className="w-5 h-5" />
      ) : (
        <Link2 className="w-5 h-5" />
      )}
    </div>
  );
}

/**
 * Filter badge for displaying filter options
 */
interface ProviderFilterBadgeProps {
  type: ProviderType | 'all';
  count?: number;
  active?: boolean;
  onClick?: () => void;
}

export function ProviderFilterBadge({
  type,
  count,
  active = false,
  onClick
}: ProviderFilterBadgeProps) {
  const config = {
    all: {
      label: 'All Providers',
      bgColor: 'bg-gray-100 hover:bg-gray-200',
      textColor: 'text-gray-700'
    },
    internal: {
      label: 'InstaGoods Curated',
      bgColor: 'bg-blue-100 hover:bg-blue-200',
      textColor: 'text-blue-700'
    },
    external: {
      label: 'Verified Partners',
      bgColor: 'bg-emerald-100 hover:bg-emerald-200',
      textColor: 'text-emerald-700'
    }
  };
  
  const c = config[type];
  
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors",
        c.bgColor,
        c.textColor,
        active && "ring-2 ring-offset-1 ring-current"
      )}
    >
      {c.label}
      {count !== undefined && (
        <span className="bg-white/50 px-1.5 py-0.5 rounded-full text-xs">
          {count}
        </span>
      )}
    </button>
  );
}
