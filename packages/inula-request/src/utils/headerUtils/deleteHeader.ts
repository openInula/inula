import utils from '../commonUtils/utils';

function deleteHeader(this: any, header: string) {
  const normalizedHeader = String(header).trim().toLowerCase();

  if (normalizedHeader) {
    const key = utils.getObjectKey(this, normalizedHeader);

    if (key) {
      delete this[key];
      return true;
    }
  }

  return false;
}

export default deleteHeader;
