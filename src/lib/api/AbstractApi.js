export default class AbstractApi {
  constructor(client, url) {
    this.client = client;
    this.url = url;
  }

  /** @access protected */
  _request(path, payload, method = 'GET') {
    return this.client[method.toLowerCase()]([this.url, path].join('/'), payload).then(r => r.body);
  }
}
