function parseBoolean(value, fallback = false) {
  if (value === true || value === false) return value;
  if (value === 1 || value === '1') return true;
  if (value === 0 || value === '0') return false;

  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (['true', 'yes', 'on'].includes(normalized)) return true;
    if (['false', 'no', 'off'].includes(normalized)) return false;
  }

  return fallback;
}

function toNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function isWithinDateRange(startsAt, endsAt, now = new Date()) {
  if (startsAt && new Date(startsAt) > now) return false;
  if (endsAt && new Date(endsAt) < now) return false;

  return true;
}

export function normalizeBuy2Offer(settings = {}) {
  return {
    enabled: parseBoolean(settings.buy2_offer_enabled ?? settings.buy2OfferEnabled, false),
    startsAt: settings.buy2_offer_starts_at || settings.buy2OfferStartsAt || '',
    endsAt: settings.buy2_offer_ends_at || settings.buy2OfferEndsAt || '',
    discountType: settings.buy2_discount_type || settings.buy2DiscountType || 'percentage',
    discountValue: toNumber(settings.buy2_discount_value ?? settings.buy2DiscountValue, 10),
  };
}

export function normalizeLoyaltySettings(settings = {}) {
  return {
    enabled: parseBoolean(settings.loyalty_points_enabled ?? settings.loyaltyPointsEnabled, true),
    amountPerPoint: Math.max(1, toNumber(settings.loyalty_amount_per_point ?? settings.loyaltyAmountPerPoint, 10)),
    rewardPoints: Math.max(1, toNumber(settings.loyalty_reward_points ?? settings.loyaltyRewardPoints, 100)),
    rewardValue: Math.max(0, toNumber(settings.loyalty_reward_value ?? settings.loyaltyRewardValue, 20)),
  };
}

export function isBuy2OfferActive(offer = {}) {
  return Boolean(offer.enabled && offer.discountValue > 0 && isWithinDateRange(offer.startsAt, offer.endsAt));
}

export function calculateBuy2Discount(items = [], offer = {}) {
  if (!isBuy2OfferActive(offer)) {
    return 0;
  }

  const discount = items.reduce((totalDiscount, item) => {
    const quantity = Number(item.quantity || 0);

    if (quantity < 2) {
      return totalDiscount;
    }

    const lineTotal = Number(item.price || 0) * quantity;

    if (offer.discountType === 'fixed') {
      return totalDiscount + Math.min(lineTotal, offer.discountValue);
    }

    return totalDiscount + (lineTotal * Math.min(offer.discountValue, 100)) / 100;
  }, 0);

  const subtotal = items.reduce((total, item) => total + Number(item.price || 0) * Number(item.quantity || 0), 0);

  return Math.round(Math.min(discount, subtotal) * 100) / 100;
}

export function calculateLoyaltyPoints(amount, loyalty = {}) {
  if (!loyalty.enabled) {
    return 0;
  }

  return Math.max(0, Math.floor(Number(amount || 0) / loyalty.amountPerPoint));
}
