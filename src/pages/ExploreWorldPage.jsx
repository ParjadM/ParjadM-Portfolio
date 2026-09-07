import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { SEO } from '../components/SEO.jsx';
import { localizePath } from '../utils/i18nRouting.js';
import { WorldCanvas } from '../components/explore-world/WorldCanvas.jsx';
import { WorldHud } from '../components/explore-world/WorldHud.jsx';
import { MobileGate } from '../components/explore-world/MobileGate.jsx';
import { FadeOverlay } from '../components/explore-world/FadeOverlay.jsx';
import { ProjectDetailOverlay } from '../components/explore-world/overlays/ProjectDetailOverlay.jsx';
import {
  AREA_PROJECTS,
  AREA_TOWN,
  getProjectsExteriorSpawn,
  PROJECTS_API,
  PROJECTS_INTERIOR_SPAWN,
} from '../components/explore-world/exploreWorldScene.js';

function useIsDesktopExplore() {
  const [ok, setOk] = useState(() => {
    if (typeof window === 'undefined') return true;
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

function sleep(ms) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

/**
 * Explore World page shell: town ↔ Projects Lab, HUD, overlays, fade transitions.
 */
export function ExploreWorldPage({ theme }) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isDesktop = useIsDesktopExplore();
  const playerPoseRef = useRef({ x: 0, y: 1.2, z: 4, yaw: 0 });
  const teleportRequestRef = useRef(null);
  const interactRequestedRef = useRef(false);
  const transitionLockRef = useRef(false);

  const [area, setArea] = useState(AREA_TOWN);
  const [projects, setProjects] = useState([]);
  const [promptText, setPromptText] = useState('');
  const [selectedProject, setSelectedProject] = useState(null);
  const [fading, setFading] = useState(false);

  const locale = i18n.language?.startsWith('fr') ? 'fr' : 'en';
  const overlayOpen = Boolean(selectedProject);
  const inputLocked = overlayOpen || fading;

  const handleExitWorld = useCallback(() => {
    navigate(localizePath('/explore', locale));
  }, [navigate, locale]);

  useEffect(() => {
    let cancelled = false;
    fetch(PROJECTS_API)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled) return;
        const list = Array.isArray(data?.projects) ? data.projects.slice(0, 4) : [];
        setProjects(list);
      })
      .catch(() => {
        if (!cancelled) setProjects([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handlePromptChange = useCallback((visible, payload) => {
    if (!visible || !payload) {
      setPromptText('');
      return;
    }
    if (payload.type === 'enter-projects') {
      setPromptText(t('exploreWorld.promptProjects'));
    } else if (payload.type === 'exit-projects') {
      setPromptText(t('exploreWorld.promptExitLab'));
    } else if (payload.type === 'project' && payload.project?.title) {
      setPromptText(t('exploreWorld.promptViewProject', { name: payload.project.title }));
    } else {
      setPromptText('');
    }
  }, [t]);

  const runTransition = useCallback(async (nextArea, spawn) => {
    if (transitionLockRef.current) return;
    transitionLockRef.current = true;
    setFading(true);
    setPromptText('');
    setSelectedProject(null);
    await sleep(320);
    setArea(nextArea);
    teleportRequestRef.current = spawn;
    playerPoseRef.current = { ...spawn };
    await sleep(80);
    setFading(false);
    await sleep(320);
    transitionLockRef.current = false;
  }, []);

  const handleInteract = useCallback((payload) => {
    if (!payload || transitionLockRef.current || overlayOpen) return;

    if (payload.type === 'enter-projects') {
      runTransition(AREA_PROJECTS, PROJECTS_INTERIOR_SPAWN);
      return;
    }
    if (payload.type === 'exit-projects') {
      runTransition(AREA_TOWN, getProjectsExteriorSpawn());
      return;
    }
    if (payload.type === 'project' && payload.project) {
      setSelectedProject(payload.project);
    }
  }, [overlayOpen, runTransition]);

  useEffect(() => {
    if (!isDesktop) return undefined;

    const onKeyDown = (e) => {
      if (overlayOpen) {
        if (e.code === 'Escape') setSelectedProject(null);
        return;
      }
      if (fading || transitionLockRef.current) return;
      if (e.code === 'KeyE' && !e.repeat) {
        interactRequestedRef.current = true;
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isDesktop, overlayOpen, fading]);

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
        area={area}
        projects={projects}
        playerPoseRef={playerPoseRef}
        teleportRequestRef={teleportRequestRef}
        onPromptChange={handlePromptChange}
        interactRequestedRef={interactRequestedRef}
        onInteract={handleInteract}
        inputLocked={inputLocked}
        cameraPreset={area === AREA_PROJECTS ? 'interior' : 'outdoor'}
      />
      <WorldHud promptText={!overlayOpen && !fading ? promptText : ''} onExit={handleExitWorld} />
      {selectedProject ? (
        <ProjectDetailOverlay
          theme={theme}
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
        />
      ) : null}
      <FadeOverlay visible={fading} />
    </div>
  );
}

export default ExploreWorldPage;
