import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { SEO } from '../components/SEO.jsx';
import { localizePath } from '../utils/i18nRouting.js';
import { WorldCanvas } from '../components/explore-world/WorldCanvas.jsx';
import { WorldHud } from '../components/explore-world/WorldHud.jsx';
import { WorldOverlay } from '../components/explore-world/WorldOverlay.jsx';
import { MobileGate } from '../components/explore-world/MobileGate.jsx';

function useIsDesktopExplore() {
  const [ok, setOk] = useState(() => {
    if (typeof window === 'undefined') return true;
    // Phase 1: keyboard/mouse experience — gate narrow viewports only.
    // Avoid hover/pointer media queries; they fail in VMs and some desktops.
    return window.matchMedia('(min-width: 768px)').matches;
  });

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    const onChange = () => setOk(mq.matches);
    onChange();
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  return ok;
}

/**
 * Explore World Phase 1 page shell: HUD + overlay + lazy 3D canvas.
 */
export function ExploreWorldPage({ theme }) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isDesktop = useIsDesktopExplore();
  const playerPoseRef = useRef({ x: 0, y: 1.2, z: 4, yaw: 0 });
  const interactRequestedRef = useRef(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [overlayOpen, setOverlayOpen] = useState(false);

  const locale = i18n.language?.startsWith('fr') ? 'fr' : 'en';

  const handleExit = useCallback(() => {
    navigate(localizePath('/explore', locale));
  }, [navigate, locale]);

  const handleInteract = useCallback(() => {
    setOverlayOpen(true);
  }, []);

  useEffect(() => {
    if (!isDesktop) return undefined;

    const onKeyDown = (e) => {
      if (overlayOpen) {
        if (e.code === 'Escape') setOverlayOpen(false);
        return;
      }
      if (e.code === 'KeyE' && !e.repeat) {
        interactRequestedRef.current = true;
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isDesktop, overlayOpen]);

  if (!isDesktop) {
    return (
      <>
        <SEO titleKey="exploreWorld.seoTitle" descriptionKey="exploreWorld.seoDesc" />
        <MobileGate theme={theme} />
      </>
    );
  }

  return (
    <div className="relative h-[100dvh] w-full overflow-hidden bg-slate-950">
      <SEO titleKey="exploreWorld.seoTitle" descriptionKey="exploreWorld.seoDesc" />
      <WorldCanvas
        loadingLabel={t('exploreWorld.loading')}
        playerPoseRef={playerPoseRef}
        onPromptChange={setShowPrompt}
        interactRequestedRef={interactRequestedRef}
        onInteract={handleInteract}
        inputLocked={overlayOpen}
      />
      <WorldHud showPrompt={showPrompt && !overlayOpen} onExit={handleExit} />
      {overlayOpen ? (
        <WorldOverlay theme={theme} onClose={() => setOverlayOpen(false)} />
      ) : null}
    </div>
  );
}

export default ExploreWorldPage;
