import React, { useState } from 'react';
import { KrishiRakshakLogo } from './KrishiRakshakLogo';
import {
  X,
  Download,
  Copy,
  Check,
  Sparkles,
  Shield,
  Layers,
  Palette,
  ExternalLink,
  Code,
  Smartphone,
  Layout,
  Monitor
} from 'lucide-react';

interface BrandAssetsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BrandAssetsModal: React.FC<BrandAssetsModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'preview' | 'download' | 'specs'>('preview');
  const [previewBg, setPreviewBg] = useState<'white' | 'dark' | 'emerald' | 'checker'>('white');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const downloadFile = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Canvas PNG renderer for 1024x1024 high-resolution transparent PNG export
  const handleDownloadRasterPng = (type: 'logo' | 'emblem' | 'appicon') => {
    const svgUrl = type === 'emblem'
      ? '/krishirakshak_emblem.svg'
      : type === 'appicon'
      ? '/krishirakshak_app_icon.svg'
      : '/krishirakshak_logo.svg';

    const filename = type === 'emblem'
      ? 'Digital_KrishiVaani_Emblem_Clean_1024.png'
      : type === 'appicon'
      ? 'Digital_KrishiVaani_AppIcon_512.png'
      : 'Digital_KrishiVaani_Logo_Clean_1024.png';

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const size = type === 'appicon' ? 512 : 1024;
      canvas.width = size;
      canvas.height = type === 'logo' ? Math.round(size * 1.26) : size;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    };
    img.src = svgUrl;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100/70 border border-emerald-200 flex items-center justify-center text-emerald-800">
              <KrishiRakshakLogo size="xs" variant="icon-only" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">Official Brand Identity & Logo Assets</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Vector Cleaned
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Preserved original symbol, shield, crop furrows, typography & tagline
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl hover:bg-slate-200/80 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Controls */}
        <div className="px-6 py-2 border-b border-slate-100 flex gap-2 text-xs font-bold bg-white">
          <button
            onClick={() => setActiveTab('preview')}
            className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
              activeTab === 'preview'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Live Logo Previews
          </button>
          <button
            onClick={() => setActiveTab('download')}
            className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
              activeTab === 'download'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Download High-Res Assets
          </button>
          <button
            onClick={() => setActiveTab('specs')}
            className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
              activeTab === 'specs'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Brand Specifications & Colors
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {activeTab === 'preview' && (
            <div className="space-y-6">
              {/* Background Selector */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">Test Background Canvas:</span>
                <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
                  <button
                    onClick={() => setPreviewBg('white')}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      previewBg === 'white' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
                    }`}
                  >
                    White
                  </button>
                  <button
                    onClick={() => setPreviewBg('dark')}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      previewBg === 'dark' ? 'bg-slate-900 text-white shadow-2xs' : 'text-slate-600'
                    }`}
                  >
                    Dark Slate
                  </button>
                  <button
                    onClick={() => setPreviewBg('emerald')}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      previewBg === 'emerald' ? 'bg-emerald-800 text-white shadow-2xs' : 'text-slate-600'
                    }`}
                  >
                    Forest Green
                  </button>
                  <button
                    onClick={() => setPreviewBg('checker')}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      previewBg === 'checker' ? 'bg-white text-slate-900 shadow-2xs border border-slate-300' : 'text-slate-600'
                    }`}
                  >
                    Transparent Grid
                  </button>
                </div>
              </div>

              {/* Showcase Container */}
              <div
                className={`p-8 rounded-2xl border transition-colors flex flex-col items-center justify-center gap-8 ${
                  previewBg === 'white'
                    ? 'bg-white border-slate-200'
                    : previewBg === 'dark'
                    ? 'bg-slate-950 border-slate-800'
                    : previewBg === 'emerald'
                    ? 'bg-emerald-900 border-emerald-800'
                    : 'bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:16px_16px] bg-slate-50 border-slate-200'
                }`}
              >
                {/* 1. Primary Vertical Lockup with Tagline */}
                <div className="flex flex-col items-center">
                  <KrishiRakshakLogo
                    size="2xl"
                    variant="vertical"
                    showTagline={true}
                    taglineText="Aapka AI Krishi Saathi"
                    theme={previewBg === 'dark' || previewBg === 'emerald' ? 'dark' : 'light'}
                  />
                </div>

                <div className={`w-full h-px ${previewBg === 'dark' || previewBg === 'emerald' ? 'bg-white/10' : 'bg-slate-200'}`} />

                {/* 2. Horizontal Header Lockup */}
                <div className="w-full flex flex-wrap items-center justify-around gap-6">
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 text-center">
                      Header / Navbar Lockup
                    </div>
                    <KrishiRakshakLogo
                      size="md"
                      variant="horizontal"
                      showTagline={true}
                      taglineText="Aapka AI Krishi Saathi"
                      theme={previewBg === 'dark' || previewBg === 'emerald' ? 'dark' : 'light'}
                    />
                  </div>

                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 text-center">
                      App Icon / Avatar
                    </div>
                    <div className="flex items-center justify-center">
                      <div className="w-14 h-14 rounded-2xl bg-white shadow-md border border-emerald-100 flex items-center justify-center p-2">
                        <KrishiRakshakLogo size="md" variant="icon-only" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quality Checklist */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-emerald-50/70 border border-emerald-100 rounded-xl flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-emerald-950">Original Concept Preserved:</span>
                    <p className="text-emerald-800 text-[11px] mt-0.5">
                      Protective crescent shield arch, terraced crop furrow rows, and two-leaf central sprout.
                    </p>
                  </div>
                </div>
                <div className="p-3 bg-emerald-50/70 border border-emerald-100 rounded-xl flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-emerald-950">Clean Modern Typography & Color:</span>
                    <p className="text-emerald-800 text-[11px] mt-0.5">
                      <strong>Digital KrishiVaani</strong> in bold geometric sans with vibrant green <strong>KrishiVaani</strong> accent.
                    </p>
                  </div>
                </div>
                <div className="p-3 bg-emerald-50/70 border border-emerald-100 rounded-xl flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-emerald-950">Exact Tagline Retained:</span>
                    <p className="text-emerald-800 text-[11px] mt-0.5">
                      <strong>Aapka AI Krishi Saathi</strong> in clean, letter-spaced modern typography.
                    </p>
                  </div>
                </div>
                <div className="p-3 bg-emerald-50/70 border border-emerald-100 rounded-xl flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-emerald-950">Vector Quality & Infinite Scale:</span>
                    <p className="text-emerald-800 text-[11px] mt-0.5">
                      Mathematical Bezier curves, zero blur, zero pixelation, 100% crisp across all displays.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'download' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-600">
                Download official production-ready brand files in vector (SVG) and high-resolution raster (PNG) formats:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* 1. Full Vertical Logo (SVG) */}
                <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs hover:border-emerald-300 transition-colors flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Vector Logo (Full Lockup)</h4>
                    <p className="text-[11px] text-slate-500">SVG • Icon + Name + Tagline • Transparent</p>
                  </div>
                  <button
                    onClick={() => downloadFile('/krishirakshak_logo.svg', 'Digital_KrishiVaani_Logo_Vector.svg')}
                    className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>SVG</span>
                  </button>
                </div>

                {/* 2. High-Res PNG (1024x1024) */}
                <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs hover:border-emerald-300 transition-colors flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">High-Res PNG (1024px)</h4>
                    <p className="text-[11px] text-slate-500">PNG • Transparent background • Presentation ready</p>
                  </div>
                  <button
                    onClick={() => handleDownloadRasterPng('logo')}
                    className="px-3 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>PNG</span>
                  </button>
                </div>

                {/* 3. Horizontal Navbar Logo (SVG) */}
                <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs hover:border-emerald-300 transition-colors flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Horizontal Lockup (SVG)</h4>
                    <p className="text-[11px] text-slate-500">SVG • Ideal for Web Navbars & Headers</p>
                  </div>
                  <button
                    onClick={() => downloadFile('/krishirakshak_logo_horizontal.svg', 'Digital_KrishiVaani_Logo_Horizontal.svg')}
                    className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>SVG</span>
                  </button>
                </div>

                {/* 4. App Icon Squircle (512x512) */}
                <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs hover:border-emerald-300 transition-colors flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">App Icon (512px)</h4>
                    <p className="text-[11px] text-slate-500">Squircle container for PWA, iOS & Android</p>
                  </div>
                  <button
                    onClick={() => handleDownloadRasterPng('appicon')}
                    className="px-3 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>PNG</span>
                  </button>
                </div>

                {/* 5. Emblem Symbol Only (SVG) */}
                <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs hover:border-emerald-300 transition-colors flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Emblem Symbol Only (SVG)</h4>
                    <p className="text-[11px] text-slate-500">Pure vector shield & sprout without text</p>
                  </div>
                  <button
                    onClick={() => downloadFile('/krishirakshak_emblem.svg', 'Digital_KrishiVaani_Emblem_Vector.svg')}
                    className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>SVG</span>
                  </button>
                </div>

                {/* 6. Emblem Symbol Only (PNG) */}
                <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs hover:border-emerald-300 transition-colors flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Emblem Only PNG (1024px)</h4>
                    <p className="text-[11px] text-slate-500">Transparent PNG for stickers & badges</p>
                  </div>
                  <button
                    onClick={() => handleDownloadRasterPng('emblem')}
                    className="px-3 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>PNG</span>
                  </button>
                </div>
              </div>

              {/* GitHub README Snippet */}
              <div className="mt-4 p-4 bg-slate-900 rounded-2xl text-slate-200 text-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-[11px] text-emerald-400 font-bold">
                    GitHub README.md Integration Snippet:
                  </span>
                  <button
                    onClick={() =>
                      handleCopy(
                        '<p align="center">\n  <img src="/krishirakshak_logo.svg" alt="Digital KrishiVaani — Aapka AI Krishi Saathi" width="220" />\n</p>',
                        'readme'
                      )
                    }
                    className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white transition-colors cursor-pointer"
                  >
                    {copiedKey === 'readme' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'readme' ? 'Copied!' : 'Copy Code'}</span>
                  </button>
                </div>
                <pre className="font-mono text-[11px] bg-slate-950 p-2.5 rounded-xl overflow-x-auto text-emerald-200">
                  {`<p align="center">\n  <img src="/krishirakshak_logo.svg" alt="Digital KrishiVaani" width="220" />\n</p>`}
                </pre>
              </div>
            </div>
          )}

          {activeTab === 'specs' && (
            <div className="space-y-6">
              {/* Brand Guidelines Card */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 text-xs">
                <h4 className="font-bold text-slate-900">Brand Identity Rules & Wordmark Standards</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
                  <div>
                    <span className="text-slate-400 block font-semibold">Official Brand Name</span>
                    <span className="font-bold text-slate-800 text-xs">Digital KrishiVaani</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-semibold">Official Tagline</span>
                    <span className="font-bold text-slate-800 text-xs">Aapka AI Krishi Saathi</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-semibold">Icon Symbolism</span>
                    <span className="text-slate-700">Protective crescent cradle enclosing tiered crop fields with young healthy sprout</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-semibold">Primary Font Pairing</span>
                    <span className="text-slate-700">Plus Jakarta Sans (Weight 800 / Extrabold)</span>
                  </div>
                </div>
              </div>

              {/* Color Palette Tokens */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 mb-3">Official Color Palette Tokens</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 rounded-xl border border-slate-200 bg-white space-y-2">
                    <div className="h-12 rounded-lg bg-[#064e3b]" />
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-bold text-slate-800 block text-[11px]">Forest Shield</span>
                        <span className="font-mono text-[10px] text-slate-500">#064e3b</span>
                      </div>
                      <button
                        onClick={() => handleCopy('#064e3b', 'c1')}
                        className="text-slate-400 hover:text-slate-800"
                      >
                        {copiedKey === 'c1' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl border border-slate-200 bg-white space-y-2">
                    <div className="h-12 rounded-lg bg-[#10b981]" />
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-bold text-slate-800 block text-[11px]">Tech Emerald</span>
                        <span className="font-mono text-[10px] text-slate-500">#10b981</span>
                      </div>
                      <button
                        onClick={() => handleCopy('#10b981', 'c2')}
                        className="text-slate-400 hover:text-slate-800"
                      >
                        {copiedKey === 'c2' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl border border-slate-200 bg-white space-y-2">
                    <div className="h-12 rounded-lg bg-[#84cc16]" />
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-bold text-slate-800 block text-[11px]">Sunlit Sprout</span>
                        <span className="font-mono text-[10px] text-slate-500">#84cc16</span>
                      </div>
                      <button
                        onClick={() => handleCopy('#84cc16', 'c3')}
                        className="text-slate-400 hover:text-slate-800"
                      >
                        {copiedKey === 'c3' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl border border-slate-200 bg-white space-y-2">
                    <div className="h-12 rounded-lg bg-[#2d6a4f]" />
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-bold text-slate-800 block text-[11px]">Tagline Foliage</span>
                        <span className="font-mono text-[10px] text-slate-500">#2d6a4f</span>
                      </div>
                      <button
                        onClick={() => handleCopy('#2d6a4f', 'c4')}
                        className="text-slate-400 hover:text-slate-800"
                      >
                        {copiedKey === 'c4' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between text-xs">
          <span className="text-slate-500 font-medium">
            Production vector asset: <code className="text-emerald-800 font-mono text-[11px]">/public/krishirakshak_logo.svg</code>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
