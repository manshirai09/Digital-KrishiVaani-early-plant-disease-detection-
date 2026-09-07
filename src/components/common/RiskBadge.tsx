import React from 'react';
import { RiskLevel } from '../../types';
import { AlertTriangle, CheckCircle2, AlertOctagon, Info } from 'lucide-react';

interface RiskBadgeProps {
  level: RiskLevel;
  score?: number;
  showScore?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({
  level,
  score,
  showScore = false,
  size = 'md',
  className = ''
}) => {
  const getBadgeStyle = () => {
    switch (level) {
      case 'critical':
        return {
          bg: 'bg-rose-50 border-rose-200 text-rose-800',
          dot: 'bg-rose-600',
          label: 'CRITICAL RISK',
          icon: AlertOctagon
        };
      case 'high':
        return {
          bg: 'bg-amber-50 border-amber-300 text-amber-900',
          dot: 'bg-amber-500',
          label: 'HIGH RISK',
          icon: AlertTriangle
        };
      case 'moderate':
        return {
          bg: 'bg-yellow-50 border-yellow-200 text-yellow-800',
          dot: 'bg-yellow-500',
          label: 'MODERATE RISK',
          icon: Info
        };
      case 'low':
      default:
        return {
          bg: 'bg-emerald-50 border-emerald-200 text-emerald-800',
          dot: 'bg-emerald-500',
          label: 'LOW RISK',
          icon: CheckCircle2
        };
    }
  };

  const style = getBadgeStyle();
  const Icon = style.icon;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-semibold',
    lg: 'text-sm px-3.5 py-1.5 gap-2 font-bold'
  }[size];

  return (
    <span
      id={`risk-badge-${level}`}
      className={`inline-flex items-center rounded-full border ${style.bg} ${sizeClasses} ${className} transition-colors`}
    >
      <span className={`w-2 h-2 rounded-full ${style.dot} animate-pulse`} />
      <Icon className={size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5'} />
      <span>{style.label}</span>
      {showScore && score !== undefined && (
        <span className="ml-1 px-1.5 py-0.2 bg-white/70 rounded-md font-mono text-[11px] shadow-2xs">
          {score}/100
        </span>
      )}
    </span>
  );
};
