import React, { useId } from 'react';

export interface KrishiRakshakLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  theme?: 'light' | 'dark' | 'emerald' | 'white';
  variant?: 'horizontal' | 'vertical' | 'icon-only' | 'full';
  showTagline?: boolean;
  taglineText?: string;
  className?: string;
  iconClassName?: string;
  onClick?: () => void;
}

export const KrishiRakshakLogo: React.FC<KrishiRakshakLogoProps> = ({
  size = 'md',
  theme = 'light',
  variant = 'horizontal',
  showTagline = false,
  taglineText = 'Aapka AI Krishi Saathi',
  className = '',
  iconClassName = '',
  onClick
}) => {
  const uid = useId().replace(/:/g, '_');

  // Unique IDs for SVG linear gradients to prevent DOM collisions
  const gShield = `kr_shield_${uid}`;
  const gLeafRDark = `kr_leaf_rd_${uid}`;
  const gLeafRLight = `kr_leaf_rl_${uid}`;
  const gLeafLTop = `kr_leaf_lt_${uid}`;
  const gLeafLBottom = `kr_leaf_lb_${uid}`;
  const gFurrowTop = `kr_furrow_top_${uid}`;
  const gFurrowMid1 = `kr_furrow_mid1_${uid}`;
  const gFurrowMid2 = `kr_furrow_mid2_${uid}`;
  const gFurrowBase = `kr_furrow_base_${uid}`;
  const gPlotTop = `kr_plot_top_${uid}`;
  const gPlotMid = `kr_plot_mid_${uid}`;
  const gPlotLow = `kr_plot_low_${uid}`;

  // Dimension mapping
  const dimensions = {
    xs: { iconPx: 22, text: 'text-sm', tagline: 'text-[9px]', gap: 'gap-2', vertGap: 'gap-1.5' },
    sm: { iconPx: 30, text: 'text-base', tagline: 'text-[10px]', gap: 'gap-2.5', vertGap: 'gap-2' },
    md: { iconPx: 38, text: 'text-lg sm:text-xl', tagline: 'text-[11px]', gap: 'gap-3', vertGap: 'gap-2.5' },
    lg: { iconPx: 52, text: 'text-2xl sm:text-3xl', tagline: 'text-xs sm:text-sm', gap: 'gap-3.5', vertGap: 'gap-3' },
    xl: { iconPx: 76, text: 'text-3xl sm:text-4xl', tagline: 'text-sm sm:text-base', gap: 'gap-4', vertGap: 'gap-3.5' },
    '2xl': { iconPx: 110, text: 'text-4xl sm:text-5xl', tagline: 'text-base sm:text-lg', gap: 'gap-5', vertGap: 'gap-4' },
  }[size];

  const isDark = theme === 'dark';
  const isEmerald = theme === 'emerald';
  const isWhite = theme === 'white';

  const brandTextColor = isWhite
    ? 'text-white'
    : isDark
    ? 'text-white'
    : isEmerald
    ? 'text-white'
    : 'text-emerald-950';

  const aiAccentColor = isWhite
    ? 'text-emerald-300'
    : isDark
    ? 'text-emerald-400'
    : isEmerald
    ? 'text-emerald-300'
    : 'text-emerald-600';

  const taglineTextColor = isWhite
    ? 'text-emerald-100/90'
    : isDark
    ? 'text-emerald-200/90'
    : isEmerald
    ? 'text-emerald-100/90'
    : 'text-emerald-800/80';

  // SVG Emblem matching the uploaded reference logo
  const EmblemSvg = (
    <svg
      viewBox="0 0 1000 1000"
      className={`shrink-0 select-none ${iconClassName}`}
      style={{ width: dimensions.iconPx, height: dimensions.iconPx }}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Digital KrishiVaani Emblem"
    >
      <defs>
        {/* Outer Protective Crescent Shield Gradient */}
        <linearGradient id={gShield} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#064e3b" />
          <stop offset="55%" stopColor="#065f46" />
          <stop offset="100%" stopColor="#047857" />
        </linearGradient>

        {/* Right Dominant Leaf - Left half (Foliage green) */}
        <linearGradient id={gLeafRDark} x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#065f46" />
          <stop offset="45%" stopColor="#059669" />
          <stop offset="100%" stopColor="#10b981" />
        </linearGradient>

        {/* Right Dominant Leaf - Right half (Sunlit Lime/Spring green) */}
        <linearGradient id={gLeafRLight} x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="40%" stopColor="#34d399" />
          <stop offset="85%" stopColor="#84cc16" />
          <stop offset="100%" stopColor="#a3e635" />
        </linearGradient>

        {/* Left Branching Leaf - Top half (Vibrant Spring) */}
        <linearGradient id={gLeafLTop} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#84cc16" />
          <stop offset="35%" stopColor="#4ade80" />
          <stop offset="100%" stopColor="#16a34a" />
        </linearGradient>

        {/* Left Branching Leaf - Bottom half (Deep Green) */}
        <linearGradient id={gLeafLBottom} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#16a34a" />
          <stop offset="70%" stopColor="#15803d" />
          <stop offset="100%" stopColor="#14532d" />
        </linearGradient>

        {/* Agricultural Field Terraces Gradients */}
        <linearGradient id={gFurrowTop} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#15803d" />
          <stop offset="100%" stopColor="#16a34a" />
        </linearGradient>
        <linearGradient id={gFurrowMid1} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#166534" />
          <stop offset="100%" stopColor="#15803d" />
        </linearGradient>
        <linearGradient id={gFurrowMid2} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#14532d" />
          <stop offset="100%" stopColor="#166534" />
        </linearGradient>
        <linearGradient id={gFurrowBase} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#064e3b" />
          <stop offset="100%" stopColor="#0f5338" />
        </linearGradient>

        {/* Right Perspective Contour Plots */}
        <linearGradient id={gPlotTop} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#a3e635" />
          <stop offset="100%" stopColor="#65a30d" />
        </linearGradient>
        <linearGradient id={gPlotMid} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4ade80" />
          <stop offset="100%" stopColor="#16a34a" />
        </linearGradient>
        <linearGradient id={gPlotLow} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#22c55e" />
          <stop offset="100%" stopColor="#15803d" />
        </linearGradient>
      </defs>

      {/* 1. Outer Protective Crescent Shield */}
      <path
        d="M 178 335 C 125 418 80 515 80 625 C 80 775 195 860 480 860 C 648 860 788 812 940 648 C 895 728 765 810 515 810 C 265 810 148 720 148 588 C 148 495 170 415 220 350 Z"
        fill={`url(#${gShield})`}
      />

      {/* 2. Central Sprout Stem rooted in field */}
      <path
        d="M 552 575 C 555 540 550 515 545 480 C 538 515 536 540 538 575 Z"
        fill="#065f46"
      />

      {/* 3. Right Dominant Leaf (Dual Tone with Crisp Midrib) */}
      <path
        d="M 545 480 C 585 360 675 235 930 125 C 810 240 680 360 545 480 Z"
        fill={`url(#${gLeafRDark})`}
      />
      <path
        d="M 545 480 C 680 360 810 240 930 125 C 950 240 860 380 720 480 C 660 520 590 500 545 480 Z"
        fill={`url(#${gLeafRLight})`}
      />
      {/* Precision leaf midrib spine */}
      <path
        d="M 545 480 C 680 360 810 240 930 125"
        stroke="#ffffff"
        strokeWidth="4"
        strokeLinecap="round"
        strokeOpacity="0.75"
      />

      {/* 4. Left Branching Leaf (Dual Tone with Crisp Midrib) */}
      <path
        d="M 535 490 C 470 380 390 340 272 332 C 340 400 440 460 535 490 Z"
        fill={`url(#${gLeafLTop})`}
      />
      <path
        d="M 535 490 C 440 460 340 400 272 332 C 330 460 420 500 515 505 Z"
        fill={`url(#${gLeafLBottom})`}
      />
      {/* Precision leaf midrib spine */}
      <path
        d="M 535 490 C 440 460 340 400 272 332"
        stroke="#ffffff"
        strokeWidth="3"
        strokeLinecap="round"
        strokeOpacity="0.75"
      />

      {/* 5. Agricultural Field Furrow Rows (Tiered Contour Terraces) */}
      {/* Row 1: Primary top terrace */}
      <path
        d="M 168 582 C 300 575 480 575 628 582 C 600 605 450 600 182 605 Z"
        fill={`url(#${gFurrowTop})`}
      />

      {/* Row 2: Second terrace furrow */}
      <path
        d="M 188 616 C 350 612 520 612 660 622 C 625 648 440 640 215 648 Z"
        fill={`url(#${gFurrowMid1})`}
      />

      {/* Row 3: Third terrace furrow */}
      <path
        d="M 224 660 C 390 655 580 660 765 735 C 720 765 520 705 260 705 Z"
        fill={`url(#${gFurrowMid2})`}
      />

      {/* Row 4: Base deep furrow */}
      <path
        d="M 275 720 C 420 720 580 760 700 805 C 620 825 450 780 330 770 Z"
        fill={`url(#${gFurrowBase})`}
      />

      {/* Right Perspective Plot 1 (Top right contour) */}
      <path
        d="M 645 585 C 740 580 840 575 938 585 C 910 608 810 605 690 608 Z"
        fill={`url(#${gPlotTop})`}
      />

      {/* Right Perspective Plot 2 (Mid right contour) */}
      <path
        d="M 708 618 C 790 618 870 618 930 610 C 910 632 820 645 745 645 Z"
        fill={`url(#${gPlotMid})`}
      />

      {/* Right Perspective Plot 3 (Lower right contour) */}
      <path
        d="M 760 655 C 830 655 890 650 918 640 C 890 670 820 685 798 700 Z"
        fill={`url(#${gPlotLow})`}
      />
    </svg>
  );

  // If icon-only variant requested
  if (variant === 'icon-only') {
    return (
      <div
        className={`inline-flex items-center justify-center shrink-0 ${className} ${onClick ? 'cursor-pointer hover:opacity-90 transition-opacity' : ''}`}
        onClick={onClick}
        title="Digital KrishiVaani"
      >
        {EmblemSvg}
      </div>
    );
  }

  // Vertical stacked variant (Icon centered above typography)
  if (variant === 'vertical') {
    return (
      <div
        className={`inline-flex flex-col items-center text-center ${dimensions.vertGap} select-none ${className} ${onClick ? 'cursor-pointer hover:opacity-95 transition-opacity' : ''}`}
        onClick={onClick}
      >
        {EmblemSvg}

        <div className="flex flex-col items-center leading-none">
          <div className={`font-black tracking-tight ${dimensions.text} ${brandTextColor} flex items-baseline justify-center`}>
            <span>Digital</span>
            <span className={`ml-1.5 ${aiAccentColor}`}>KrishiVaani</span>
          </div>

          {showTagline && (
            <span className={`font-semibold tracking-wider mt-1.5 uppercase ${dimensions.tagline} ${taglineTextColor}`}>
              {taglineText}
            </span>
          )}
        </div>
      </div>
    );
  }

  // Horizontal / Full default layout (Icon + Typography side-by-side)
  return (
    <div
      className={`inline-flex items-center ${dimensions.gap} select-none ${className} ${onClick ? 'cursor-pointer hover:opacity-95 transition-opacity' : ''}`}
      onClick={onClick}
    >
      {EmblemSvg}

      <div className="flex flex-col justify-center leading-none">
        <div className={`font-black tracking-tight ${dimensions.text} ${brandTextColor} flex items-baseline`}>
          <span>Digital</span>
          <span className={`ml-1.5 ${aiAccentColor}`}>KrishiVaani</span>
        </div>

        {showTagline && (
          <span className={`font-medium tracking-normal mt-1 ${dimensions.tagline} ${taglineTextColor}`}>
            {taglineText}
          </span>
        )}
      </div>
    </div>
  );
};

// Aliases for Digital KrishiVaani
export const KrishiVaaniLogo = KrishiRakshakLogo;
export const DigitalKrishiVaaniLogo = KrishiRakshakLogo;
export type KrishiVaaniLogoProps = KrishiRakshakLogoProps;
export default KrishiRakshakLogo;
