import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { STORE_CONFIG } from '../config/store.js';
import { getSettings, getSocialLinks } from '../services/api.js';

const StoreDataContext = createContext(null);

function sanitizeWhatsAppNumber(phoneNumber = '') {
  return phoneNumber.replace(/[^\d]/g, '');
}

function buildWhatsAppLink(phoneNumber) {
  const sanitizedNumber = sanitizeWhatsAppNumber(phoneNumber || STORE_CONFIG.whatsappNumber);
  return sanitizedNumber ? `https://wa.me/${sanitizedNumber}` : '#';
}

function normalizeSettings(settings = {}) {
  const whatsappNumber = settings.whatsapp_number || settings.whatsappNumber || STORE_CONFIG.whatsappNumber;

  return {
    name: settings.store_name || settings.name || STORE_CONFIG.name,
    whatsappNumber,
    currency: settings.currency || STORE_CONFIG.currency,
    deliveryFee: Number(settings.delivery_fee ?? settings.deliveryFee ?? STORE_CONFIG.deliveryFee),
    defaultLanguage: settings.default_language || settings.defaultLanguage || STORE_CONFIG.defaultLanguage,
    paymentMethod: settings.payment_method || 'cash_on_delivery',
    country: settings.country || 'Morocco',
    facebookLink: settings.facebook || STORE_CONFIG.facebookLink,
    instagramLink: settings.instagram || STORE_CONFIG.instagramLink,
    tiktokLink: settings.tiktok || STORE_CONFIG.tiktokLink,
    youtubeLink: settings.youtube || STORE_CONFIG.youtubeLink,
    whatsappLink: buildWhatsAppLink(whatsappNumber),
  };
}

function normalizeSocialLinks(links = [], settings) {
  const fromApi = links.reduce((currentLinks, link) => {
    if (!link?.platform || !link?.url) return currentLinks;

    return {
      ...currentLinks,
      [link.platform]: link.url,
    };
  }, {});

  return {
    whatsapp: fromApi.whatsapp || settings.whatsappLink,
    facebook: fromApi.facebook || settings.facebookLink,
    instagram: fromApi.instagram || settings.instagramLink,
    tiktok: fromApi.tiktok || settings.tiktokLink,
    youtube: fromApi.youtube || settings.youtubeLink,
  };
}

const fallbackSettings = normalizeSettings();
const fallbackSocialLinks = normalizeSocialLinks([], fallbackSettings);

export function StoreDataProvider({ children }) {
  const isMountedRef = useRef(false);
  const [settings, setSettings] = useState(fallbackSettings);
  const [socialLinks, setSocialLinks] = useState(fallbackSocialLinks);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const refreshStoreData = useCallback(async () => {
    setIsLoading(true);

    const [settingsResult, socialLinksResult] = await Promise.allSettled([
      getSettings(),
      getSocialLinks(),
    ]);

    if (!isMountedRef.current) return;

    const nextSettings =
      settingsResult.status === 'fulfilled'
        ? normalizeSettings(settingsResult.value)
        : fallbackSettings;
    const nextSocialLinks =
      socialLinksResult.status === 'fulfilled'
        ? normalizeSocialLinks(socialLinksResult.value, nextSettings)
        : normalizeSocialLinks([], nextSettings);

    setSettings(nextSettings);
    setSocialLinks(nextSocialLinks);
    setError(
      settingsResult.status === 'rejected' || socialLinksResult.status === 'rejected'
        ? 'Store settings are using local fallback values.'
        : ''
    );
    setIsLoading(false);
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    refreshStoreData();
    return () => {
      isMountedRef.current = false;
    };
  }, [refreshStoreData]);

  const value = useMemo(
    () => ({
      settings,
      socialLinks,
      isLoading,
      error,
      refreshStoreData,
      getWhatsAppUrl: (message = '') => {
        const baseUrl = buildWhatsAppLink(settings.whatsappNumber);
        return message ? `${baseUrl}?text=${encodeURIComponent(message)}` : baseUrl;
      },
    }),
    [error, isLoading, refreshStoreData, settings, socialLinks]
  );

  return <StoreDataContext.Provider value={value}>{children}</StoreDataContext.Provider>;
}

export function useStoreData() {
  const context = useContext(StoreDataContext);

  if (!context) {
    throw new Error('useStoreData must be used inside StoreDataProvider');
  }

  return context;
}
