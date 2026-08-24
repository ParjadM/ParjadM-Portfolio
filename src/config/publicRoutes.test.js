import { describe, it, expect } from 'vitest';
import { PUBLIC_STATIC_ROUTES, prerenderRoutes, sitemapPaths, getRouteMeta } from './publicRoutes.js';

describe('publicRoutes manifest', () => {
  it('includes bilingual SEO keys for every static route', () => {
    for (const route of PUBLIC_STATIC_ROUTES) {
      expect(route.path).toMatch(/^\//);
      expect(route.titleKey).toBeTruthy();
      expect(route.descriptionKey).toBeTruthy();
      expect(typeof route.sitemap).toBe('boolean');
      expect(typeof route.prerender).toBe('boolean');
    }
  });

  it('prerenders LQFT, Camera FX, and QA Lab and does not include the removed Garden route', () => {
    const paths = prerenderRoutes().map((r) => r.path);
    expect(paths).toContain('/projects/lqftBenchmark');
    expect(paths).toContain('/projects/cameraFx');
    expect(paths).toContain('/projects/qaLab');
    expect(paths).not.toContain('/garden');
  });

  it('keeps sitemap and prerender path sets aligned for indexable pages', () => {
    expect(sitemapPaths()).toEqual(
      PUBLIC_STATIC_ROUTES.filter((r) => r.sitemap).map((r) => r.path),
    );
    expect(getRouteMeta('/blog')?.titleKey).toBe('blog.seoTitle');
  });
});
