export const MOBILE_MENU_OPEN = 'portfolio:open-mobile-menu';

export function openMobileMenu() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(MOBILE_MENU_OPEN));
  }
}
