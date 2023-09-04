import utils from '../commonUtils/utils';

export function parsePath(name: string): string[] {
  const matches = Array.from(name.matchAll(/\w+|\[(\w*)]/g));
  const arr = [];

  for (const match of matches) {
    const matchValue = match[0] === '[]' ? '' : match[1] || match[0];
    arr.push(matchValue);
  }

  return arr;
}

function getJSONByFormData(formData: FormData): Record<string, any> | null {
  if (utils.checkFormData(formData) && utils.checkFunction((formData as any).entries)) {
    const obj: Record<string, any> = {};

    for (const [key, value] of (formData as any).entries()) {
      obj[key] = value;
    }
    return obj;
  }

  return null;
}

export default getJSONByFormData;
