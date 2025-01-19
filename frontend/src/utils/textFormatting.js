export const cleanCyrillicText = (text) => {
  if (!text) return 'N/A';
  // Remplacer les caractères non-ASCII par des espaces
  return text.replace(/[^\u0020-\u007F]/g, ' ').replace(/\s+/g, ' ').trim();
};