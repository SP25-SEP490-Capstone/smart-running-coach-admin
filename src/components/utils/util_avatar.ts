import { stringToMd5 } from './util_hash';

export const getGravatarUrl = (email: string) => {
  const emailHash = stringToMd5(email);
  return `https://www.gravatar.com/avatar/${emailHash}?s=40&d=identicon&r=pg`;
};

