import { FetchOptions } from '../../types/interfaces';
import CustomResponse from './CustomResponse';

function fetchLike(url: string, options: FetchOptions = {}): Promise<Response> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const { method = 'GET', headers = {}, body = null } = options;

    xhr.open(method, url, true);

    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4) {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(new CustomResponse(xhr.responseText, { status: xhr.status }) as any);
        } else {
          reject(new Error(`Request failed with status ${xhr.status}`));
        }
      }
    };

    xhr.onerror = () => {
      reject(new Error('Network error'));
    };

    Object.keys(headers).forEach(key => {
      xhr.setRequestHeader(key, headers[key]);
    });

    xhr.send(body);
  });
}

export default fetchLike;
