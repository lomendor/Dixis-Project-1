'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  ShieldCheckIcon, 
  SparklesIcon,
  GlobeAltIcon,
  SunIcon,
  BeakerIcon,
  TrophyIcon
} from '@heroicons/react/24/solid';

interface CertificationBadgesProps {
  // PDO/PGI/TSG Certifications
  pdoCertification?: string;
  pgiCertification?: string;
  tsgCertification?: string;
  
  // Organic certification
  isOrganic?: boolean;
  organicCertificationBody?: string;
  
  // Quality grade
  qualityGrade?: string;
  
  // Sustainability metrics
  carbonFootprint?: number;
  waterUsage?: number;
  pesticideFreeDays?: number;
  renewableEnergyPercentage?: number;
  
  // Display options
  size?: 'sm' | 'md' | 'lg';
  layout?: 'horizontal' | 'vertical' | 'grid';
  showTooltips?: boolean;
  maxBadges?: number;
}

interface BadgeProps {
  type: string;
  label: string;
  value?: string | number;
  icon: React.ReactNode;
  color: string;
  size: 'sm' | 'md' | 'lg';
  showTooltip?: boolean;
  tooltip?: string;
}

const Badge: React.FC<BadgeProps> = ({ 
  type, 
  label, 
  value, 
  icon, 
  color, 
  size, 
  showTooltip, 
  tooltip 
}) => {
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4', 
    lg: 'w-5 h-5'
  };

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.2 }}
      className={`
        inline-flex items-center space-x-1 rounded-full font-medium
        border-2 border-opacity-20 
        ${sizeClasses[size]} ${color}
        hover:scale-105 transition-transform duration-200
        ${showTooltip ? 'cursor-help' : ''}
      `}
      title={showTooltip ? tooltip : undefined}
    >
      <span className={iconSizes[size]}>{icon}</span>
      <span>{label}</span>
      {value && <span className="font-bold">: {value}</span>}
    </motion.div>
  );
};

export default function CertificationBadges({
  pdoCertification,
  pgiCertification,
  tsgCertification,
  isOrganic,
  organicCertificationBody,
  qualityGrade,
  carbonFootprint,
  waterUsage,
  pesticideFreeDays,
  renewableEnergyPercentage,
  size = 'md',
  layout = 'horizontal',
  showTooltips = true,
  maxBadges
}: CertificationBadgesProps) {
  const badges = [];

  // PDO Certification
  if (pdoCertification) {
    badges.push(
      <Badge
        key="pdo"
        type="pdo"
        label="ΠΟΠ"
        value={pdoCertification}
        icon={<ShieldCheckIcon />}
        color="bg-blue-100 text-blue-800 border-blue-200"
        size={size}
        showTooltip={showTooltips}
        tooltip={`Προστατευόμενη Ονομασία Προέλευσης: ${pdoCertification}`}
      />
    );
  }

  // PGI Certification
  if (pgiCertification) {
    badges.push(
      <Badge
        key="pgi"
        type="pgi"
        label="ΠΓΕ"
        value={pgiCertification}
        icon={<GlobeAltIcon />}
        color="bg-indigo-100 text-indigo-800 border-indigo-200"
        size={size}
        showTooltip={showTooltips}
        tooltip={`Προστατευόμενη Γεωγραφική Ένδειξη: ${pgiCertification}`}
      />
    );
  }

  // TSG Certification
  if (tsgCertification) {
    badges.push(
      <Badge
        key="tsg"
        type="tsg"
        label="ΕΠΙΠ"
        value={tsgCertification}
        icon={<TrophyIcon />}
        color="bg-purple-100 text-purple-800 border-purple-200"
        size={size}
        showTooltip={showTooltips}
        tooltip={`Εγγυημένο Παραδοσιακό Ιδιότυπο Προϊόν: ${tsgCertification}`}
      />
    );
  }

  // Organic Certification
  if (isOrganic) {
    badges.push(
      <Badge
        key="organic"
        type="organic"
        label="Βιολογικό"
        value={organicCertificationBody}
        icon={<SparklesIcon />}
        color="bg-green-100 text-green-800 border-green-200"
        size={size}
        showTooltip={showTooltips}
        tooltip={`Βιολογικό προϊόν πιστοποιημένο από ${organicCertificationBody || 'εγκεκριμένο φορέα'}`}
      />
    );
  }

  // Quality Grade
  if (qualityGrade) {
    const gradeColors = {
      'Extra': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Α\'': 'bg-orange-100 text-orange-800 border-orange-200',
      'Β\'': 'bg-gray-100 text-gray-800 border-gray-200',
      'Premium': 'bg-red-100 text-red-800 border-red-200',
      'Artisanal': 'bg-pink-100 text-pink-800 border-pink-200'
    };

    badges.push(
      <Badge
        key="quality"
        type="quality"
        label={qualityGrade}
        icon={<TrophyIcon />}
        color={gradeColors[qualityGrade as keyof typeof gradeColors] || 'bg-gray-100 text-gray-800 border-gray-200'}
        size={size}
        showTooltip={showTooltips}
        tooltip={`Βαθμός ποιότητας: ${qualityGrade}`}
      />
    );
  }

  // Environmental badges
  if (carbonFootprint && carbonFootprint > 0) {
    const isLowCarbon = carbonFootprint < 1.0;
    badges.push(
      <Badge
        key="carbon"
        type="carbon"
        label={isLowCarbon ? "Χαμηλό CO₂" : "CO₂"}
        value={`${carbonFootprint}kg`}
        icon={<SunIcon />}
        color={isLowCarbon ? "bg-green-100 text-green-800 border-green-200" : "bg-yellow-100 text-yellow-800 border-yellow-200"}
        size={size}
        showTooltip={showTooltips}
        tooltip={`Ανθρακικό αποτύπωμα: ${carbonFootprint} kg CO₂ ανά μονάδα`}
      />
    );
  }

  if (pesticideFreeDays && pesticideFreeDays > 0) {
    const isPesticideFree = pesticideFreeDays >= 365;
    badges.push(
      <Badge
        key="pesticide"
        type="pesticide"
        label={isPesticideFree ? "100% Φυσικό" : "Φυσικό"}
        value={isPesticideFree ? "" : `${pesticideFreeDays}ημ`}
        icon={<BeakerIcon />}
        color={isPesticideFree ? "bg-emerald-100 text-emerald-800 border-emerald-200" : "bg-lime-100 text-lime-800 border-lime-200"}
        size={size}
        showTooltip={showTooltips}
        tooltip={`${pesticideFreeDays} ημέρες χωρίς φυτοφάρμακα`}
      />
    );
  }

  if (renewableEnergyPercentage && renewableEnergyPercentage > 0) {
    const isFullyRenewable = renewableEnergyPercentage >= 100;
    badges.push(
      <Badge
        key="renewable"
        type="renewable"
        label={isFullyRenewable ? "100% Πράσινο" : "Πράσινη Ενέργεια"}
        value={isFullyRenewable ? "" : `${renewableEnergyPercentage}%`}
        icon={<SunIcon />}
        color="bg-teal-100 text-teal-800 border-teal-200"
        size={size}
        showTooltip={showTooltips}
        tooltip={`${renewableEnergyPercentage}% ανανεώσιμη ενέργεια στην παραγωγή`}
      />
    );
  }

  // Apply maxBadges limit
  const displayBadges = maxBadges ? badges.slice(0, maxBadges) : badges;
  const hiddenCount = badges.length - displayBadges.length;

  if (displayBadges.length === 0) {
    return null;
  }

  const layoutClasses = {
    horizontal: 'flex flex-wrap items-center gap-2',
    vertical: 'flex flex-col items-start gap-2',
    grid: 'grid grid-cols-2 gap-2'
  };

  return (
    <div className={`certification-badges ${layoutClasses[layout]}`}>
      {displayBadges}
      {hiddenCount > 0 && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.2, delay: 0.1 }}
          className={`
            inline-flex items-center justify-center rounded-full font-medium
            bg-gray-100 text-gray-600 border-2 border-gray-200
            ${sizeClasses[size]}
          `}
          title={`Και ${hiddenCount} ακόμη πιστοποιήσεις`}
        >
          +{hiddenCount}
        </motion.div>
      )}
    </div>
  );
}

// Specialized components for different use cases
export function ProductCardBadges(props: Omit<CertificationBadgesProps, 'size' | 'layout' | 'maxBadges'>) {
  return (
    <CertificationBadges
      {...props}
      size="sm"
      layout="horizontal"
      maxBadges={3}
    />
  );
}

export function ProductDetailBadges(props: Omit<CertificationBadgesProps, 'size' | 'layout'>) {
  return (
    <CertificationBadges
      {...props}
      size="md"
      layout="grid"
    />
  );
}

export function ProducerDashboardBadges(props: Omit<CertificationBadgesProps, 'size' | 'layout'>) {
  return (
    <CertificationBadges
      {...props}
      size="lg"
      layout="vertical"
    />
  );
}

// Type exports
export type { CertificationBadgesProps };