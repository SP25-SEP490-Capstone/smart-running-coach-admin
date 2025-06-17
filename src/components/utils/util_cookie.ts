export const setCookie = (name: string, value: string | null | undefined, days: number | null | undefined): void => {
  let expires = "";
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie = `${name}=${value || ""}${expires}; path=/`;
};

export const getCookie = (name: string): string | null => {
  const nameEQ = `${name}=`;
  const cookiesArray = document.cookie.split(';');
  for (let i = 0; i < cookiesArray.length; i++) {
    let cookie = cookiesArray[i].trim();
    if (cookie.indexOf(nameEQ) === 0) {
      return cookie.substring(nameEQ.length, cookie.length);
    }
  }
  return null;
};

export const deleteCookie = (name: string): void => {
  document.cookie = `${name}=; Max-Age=-99999999; path=/`;
};
