const dateFormatter = new Intl.DateTimeFormat('de-CH', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});

export const formatDateCH = (value: string) => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return dateFormatter.format(parsed);
};

export const isValidDateString = (value: string) => {
  const parsed = new Date(value);
  return !Number.isNaN(parsed.getTime());
};

export const daysUntil = (isoDate: string) => {
  const target = new Date(isoDate).getTime();
  if (Number.isNaN(target)) {
    return null;
  }

  const diff = target - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
};
