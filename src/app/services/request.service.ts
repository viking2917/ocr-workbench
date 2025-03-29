import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class RequestService {

  constructor() { }

  // https://www.newline.co/@bespoyasov/how-to-use-fetch-with-typescript--a81ac257

  // for a cached fetch look at: https://github.com/abhishekasana/jsDevelopCell/blob/master/cached_fetch.js
  async request<TResponse>(url: string, config?: RequestInit): Promise<TResponse> {
    const debug = 0;
    debug && console.log('requesting', url);

    if(!this.isValidUrl(url)) {
      console.error("this is not a valid url: ", url);
    }

    const response = await fetch(url, config).catch((err: any) => {
      console.log(err);
      return { status: 'error', json: () => { } };
    });
    debug && console.log('response', response.status);

    const json = await response.json();
    debug && console.log(json);
    return json;
  }

  get = <TResponse>(url: string) =>
    this.request<TResponse>(url);

  post = <TResponse>(url: string, body: any, headers: HeadersInit | false = false) => {
    let requestInit: RequestInit = { method: 'POST', body: JSON.stringify(body) };
    if (headers && requestInit) {
      requestInit.headers = headers;
    }
    return this.request<TResponse>(url, requestInit);
  }

  postRaw = <TResponse>(url: string, body: any, headers: HeadersInit | false = false) => {
    let requestInit: RequestInit = { method: 'POST', body: body };
    if (headers && requestInit) {
      requestInit.headers = headers;
    }
    return this.request<TResponse>(url, requestInit);
  }

  isValidUrl(urlString: string) {
    try {
      return Boolean(new URL(urlString));
    }
    catch (e) {
      return false;
    }
  }

}

