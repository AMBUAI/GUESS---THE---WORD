import { Download, Share, X } from 'lucide-react';
import { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall.ts';

export function PWAInstallButton() {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) {
    return null;
  }

  if (isInstallable) {
    return (
      <button
        type="button"
        onClick={() => void install()}
        className="inline-flex items-center gap-2 px-3.5 py-2 min-h-[44px] rounded-xl border border-[#D8D1C5] bg-white hover:bg-[#FAF9F5] text-sm font-semibold text-[#151B26] transition-colors whitespace-nowrap shrink-0"
      >
        <Download className="w-4 h-4 text-[#E84A27]" />
        <span>Install App</span>
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          type="button"
          onClick={() => setShowIOSGuide(true)}
          className="inline-flex items-center gap-2 px-3.5 py-2 min-h-[44px] rounded-xl border border-[#D8D1C5] bg-white hover:bg-[#FAF9F5] text-sm font-semibold text-[#151B26] transition-colors whitespace-nowrap shrink-0"
        >
          <Share className="w-4 h-4 text-[#E84A27]" />
          <span>Install</span>
        </button>

        {showIOSGuide && (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="ios-install-title"
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          >
            <div className="w-full max-w-sm rounded-3xl bg-white border border-[#E2DDD3] p-6 shadow-xl">
              <div className="flex items-center justify-between gap-3 mb-3">
                <h2 id="ios-install-title" className="font-display font-bold text-lg text-[#151B26]">
                  Install on iPhone / iPad
                </h2>
                <button
                  type="button"
                  onClick={() => setShowIOSGuide(false)}
                  aria-label="Close install instructions"
                  className="min-h-[40px] min-w-[40px] inline-flex items-center justify-center rounded-xl text-[#6B7280] hover:text-[#151B26]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <ol className="space-y-2 text-sm text-[#4B5563] mb-5">
                <li>1. Tap the <strong>Share</strong> button in the Safari toolbar.</li>
                <li>2. Scroll down and tap <strong>Add to Home Screen</strong>.</li>
              </ol>
              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="w-full min-h-[44px] rounded-xl bg-[#E84A27] hover:bg-[#D03B1A] text-white font-display font-bold text-sm"
              >
                Got it
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
}
