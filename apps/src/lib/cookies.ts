export const clearAuthCookies = () => {
  if (typeof window === 'undefined') return;
  document.cookie = 'auth_token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax';
  document.cookie = 'auth_role=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax';
};
