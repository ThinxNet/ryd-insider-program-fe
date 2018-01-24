import AbstractApi from './AbstractApi';

export default class TankTalerApi extends AbstractApi {
  constructor(client, url) {
    super(client, url);
  }

  authLogin(email, password, clientId = 'ip_tt') {
    return this._request('auth/login/local', {email, password, clientId}, 'POST');
  }

  authLogout() {
    return this._request('auth/logout', null, 'POST');
  }

  authStatus() {
    return this._request('auth/status');
  }

  things() {
    return this._request('things');
  }
};
