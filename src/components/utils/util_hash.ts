import { MD5 } from 'crypto-js';

export const stringToMd5 = (str: string): string => {
  return MD5(str).toString();
};