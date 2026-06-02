export type PortalRole = 'shop' | 'admin';

const portalBaseUrl = 'https://onvaou.vercel.app';

export const portalUrls = {
  base: portalBaseUrl,
  shop: `${portalBaseUrl}/shop`,
  admin: `${portalBaseUrl}/admin`,
};

export const isPortalConfigured = Boolean(portalBaseUrl);

export const getPortalUrl = (role: PortalRole) => (role === 'admin' ? portalUrls.admin : portalUrls.shop);

export const getPortalTitle = (role: PortalRole) => (role === 'admin' ? 'Admin Webportal' : 'Shop Webportal');
