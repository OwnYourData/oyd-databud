// @ts-ignore
import { encode } from 'hashlink';

const codecs = ['mh-sha2-256', 'mb-base58-btc'];

export const generateHashlink = async (data: any, urls: any = undefined, meta: any = undefined) => {
  if (typeof data === 'object')
    data = JSON.stringify(data, null, 2);

  const hl = await encode({
    data: (new TextEncoder()).encode(data),
    urls,
    codecs,
    meta
  });

  return hl.split(':')[1];
}