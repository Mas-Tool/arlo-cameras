'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; }; /**
                                                                                                                                                                                                                                                   * Import libraries
                                                                                                                                                                                                                                                   */

// eslint-disable-next-line import/no-unresolved


var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

var _imap = require('imap');

var _imap2 = _interopRequireDefault(_imap);

var _mailparser = require('mailparser');

var _mailparser2 = _interopRequireDefault(_mailparser);

var _promises = require('timers/promises');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var simpleParser = _mailparser2.default.simpleParser;

var debug = new _debug2.default('Arlo:mfa');
var URL_MFA_BASE_MFA = 'https://ocapi-app.arlo.com/api';
var URL_MFA_BASE_MOBILE = URL_MFA_BASE_MFA + '/v2';

var AUTH_URLS_MOBILE = {
  VALID_TOKEN: URL_MFA_BASE_MOBILE + '/ocAccessTokenValidate_PHP_MFA',
  GET_AUTH_TOKEN: URL_MFA_BASE_MOBILE + '/ocAuth_PHP_MFA',
  GET_FACTORS: URL_MFA_BASE_MOBILE + '/ocGetFactors_PHP_MFA',
  REQUEST_MFA_CODE: URL_MFA_BASE_MOBILE + '/ocStart2FAauth_PHP_MFA'
};

var AUTH_URLS_MFA = {
  GET_AUTH_TOKEN: URL_MFA_BASE_MFA + '/auth',
  GET_FACTORS: URL_MFA_BASE_MFA + '/getFactors?data=',
  REQUEST_MFA_CODE: URL_MFA_BASE_MFA + '/startAuth',
  SUBMIT_MFACODE: URL_MFA_BASE_MFA + '/finishAuth',
  VERIFY_AUTH: URL_MFA_BASE_MFA + '/validateAccessToken?data=',
  START_NEW_SESSION: 'https://myapi.arlo.com/hmsweb/users/session/v2'
};

var auth = {};

// Validate authorization token
async function _validateToken() {
  try {
    var url = this.config.mfaViaEmail ? AUTH_URLS_MFA.VALID_TOKEN : AUTH_URLS_MOBILE.VALID_TOKEN;
    var response = await this._get(url);

    if (response instanceof Error || typeof response === 'undefined') {
      return false;
    }

    if (response.meta.code !== 200) {
      debug(response.meta.message);
      return false;
    }

    if (!response.data.tokenValidated) {
      debug('Token not validated');
      return false;
    }

    return true;
  } catch (err) {
    debug(err.message);
    return err;
  }
}

// Get authorization token
async function _getAuthToken() {
  try {
    debug('Get auth token');
    var url = this.config.mfaViaEmail ? AUTH_URLS_MFA.GET_AUTH_TOKEN : AUTH_URLS_MOBILE.GET_AUTH_TOKEN;
    var postBody = {
      email: this.config.arloUser,
      password: this.config.arloPassword,
      language: 'en',
      EnvSource: 'prod'
    };

    var response = await this._post(url, postBody);

    if (response instanceof Error || typeof response === 'undefined') {
      return false;
    }

    if (response.meta.code !== 200) {
      debug(response.meta.message);
      return false;
    }

    if (!response.data.mfa) {
      debug('Account is not MFA enabled');
      return false;
    }
    var token = response.data.token;

    var buff = Buffer.from(token);
    var tokenBase64 = buff.toString('base64');
    this.headers.authorization = tokenBase64;
    auth.authenticated = response.data.authenticated;
    auth.userID = response.data.userId;

    this.headers.accessToken = response.data.token;

    return true;
  } catch (err) {
    debug(err.message);
    return false;
  }
}

// Get mfa factors
async function _getFactors() {
  var _this = this;

  try {
    var _ret = await async function () {
      debug('Get factors');

      var url = _this.config.mfaViaEmail ? AUTH_URLS_MFA.GET_FACTORS + auth.authenticated : AUTH_URLS_MOBILE.GET_FACTORS;
      var response = await _this._get(url);
      if (response instanceof Error || typeof response === 'undefined') {
        debug(response);
        return {
          v: false
        };
      }

      if (response.meta.code !== 200) {
        debug(response.meta.message);
        return {
          v: false
        };
      }

      var mfaType = _this.config.mfaViaEmail ? 'EMAIL' : 'PUSH';
      debug('Filter factors to get ' + mfaType);

      var factor = response.data.items.filter(function (item) {
        return item.factorType === mfaType;
      });

      if (factor.length < 1) {
        debug('No mfa found');
        return {
          v: false
        };
      }

      debug('Found ' + factor[0].factorType + ' factor');
      auth.factorID = factor[0].factorId;
      auth.applicationID = factor[0].applicationId;

      return {
        v: true
      };
    }();

    if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
  } catch (err) {
    debug(err.message);
    return err;
  }
}

// Request MFA code
async function _requestMFACode() {
  try {
    debug('Request MFA code');

    var url = this.config.mfaViaEmail ? AUTH_URLS_MFA.REQUEST_MFA_CODE : AUTH_URLS_MOBILE.REQUEST_MFA_CODE + '?applicationId=' + auth.applicationID;
    var postBody = {
      factorId: auth.factorID,
      factorType: '',
      userId: auth.userID
    };
    if (!this.config.mfaViaEmail) postBody.mobilePayload = this.mobileAuthToken;

    var response = await this._post(url, postBody);

    if (response instanceof Error || typeof response === 'undefined') {
      debug(response);
      return false;
    }

    if (!Object.keys(response).length) {
      debug('Reqiest MFA Code returned empty');
      return false;
    }

    if (response.meta.code !== 200) {
      debug(response.meta.message);
      return false;
    }

    // console.log(this.headers)
    // console.log(response.data)

    if (this.config.mfaViaEmail) {
      auth.factorAuthCode = response.data.factorAuthCode;
    } else {
      this.token = response.data.accessToken.token;
      this.tokenExpires = response.data.accessToken.expiredIn;
      this.headers.accessToken = this.token;
    }

    return true;
  } catch (err) {
    debug(err.message);
    return err;
  }
}

// Delete Arlo MFA email
function _deleteEmail(mailServer, uids) {
  return new Promise(function (resolve, reject) {
    debug('Delete arlo MFA email');

    uids.forEach(function (uid) {
      mailServer.addFlags(uid, 'Deleted', function (err) {
        if (err) reject(err);
      });
    });

    mailServer.expunge(function (err) {
      if (err) {
        reject(err);
        return;
      }
      resolve(true);
    });
  });
}

function _getMFACode(message) {
  return new Promise(function (resolve, reject) {
    try {
      debug('Find MFA code in html');
      var searchArray = message.match(/\t\d{6}/);

      if (searchArray.length === 0) throw Error('No MFA code found in email');

      auth.MFACode = parseInt(searchArray).toString();
      debug('Found MFA code: ' + auth.MFACode);
      resolve(true);
    } catch (err) {
      debug(err);
      reject(err);
    }
  });
}

function _fetchEmail(mailServer, uid) {
  return new Promise(function (resolve, reject) {
    var fetchOptions = {
      bodies: '',
      markSeen: true,
      struct: true
    };
    var fetch = mailServer.fetch(uid, fetchOptions);

    function fetchOnMessage(message) {
      message.on('body', async function (stream) {
        debug('Convert email to html');
        try {
          var email = await simpleParser(stream, { skipHtmlToText: false });
          resolve(email.html || "");
        } catch (err) {
          reject(err);
        }
      });
    }

    function fetchOnError(err) {
      debug(err.message);
      reject(err);
    }

    function removeListeners() {
      fetch.removeListener('message', fetchOnMessage);
      fetch.removeListener('error', fetchOnError);
    }

    fetch.on('message', fetchOnMessage);
    fetch.once('error', fetchOnError);
    fetch.once('end', removeListeners);
  });
}

function _searchInbox(mailServer) {
  // eslint-disable-next-line no-async-promise-executor
  return new Promise(async function (resolve, reject) {
    var searchCriteria = [['SUBJECT', 'Your one-time authentication code from Arlo']];

    debug('Search inbox for MFA email');
    // eslint-disable-next-line no-await-in-loop
    mailServer.search(searchCriteria, function (err, uids) {
      if (err) {
        reject(err);
        return;
      }

      // Reject if no email found
      if (!uids || !uids.length) {
        debug('No email with Arlo MFA found');
        resolve([]);
        return;
      }

      // Found email, mark as read
      mailServer.setFlags(uids, ['\\Seen'], function (setErr) {
        if (setErr) debug(setErr);else debug('Marked message as read');
      });

      resolve(uids);
    });
  });
}

function _searchForEmail(mailServer) {
  var retry = arguments.length <= 1 || arguments[1] === undefined ? 1 : arguments[1];

  // eslint-disable-next-line no-async-promise-executor
  return new Promise(async function (resolve, reject) {
    var uids = void 0;
    for (var i = 1; i <= retry; i += 1) {
      try {
        // eslint-disable-next-line no-await-in-loop
        uids = await _searchInbox(mailServer);
        if (uids.length === 0) {
          debug('Waiting before retry search');
          // eslint-disable-next-line no-await-in-loop
          await (0, _promises.setTimeout)(5000);
        } else {
          break;
        }
      } catch (err) {
        debug(err);
        reject(err);
      }
    }

    if (uids.length === 0) {
      reject(new Error('Timed out searching for Arlo MFA email'));
      return;
    }
    resolve(uids);
  });
}

async function _openInbox(mailServer) {
  return new Promise(function (resolve) {
    mailServer.openBox('INBOX', false, function (err) {
      if (err) {
        debug(err.message);
        resolve(false);
      }
      resolve(true);
    });
  });
}

async function _getMFACodeFromEmail() {
  var _this2 = this;

  var emailServerConfig = {
    // IMAP connection config
    user: this.config.emailUser,
    password: this.config.emailPassword,
    host: this.config.emailServer,
    port: 993,
    tls: true,
    tlsOptions: {
      rejectUnauthorized: false
    }
  };
  debug('Connect to imap server');

  return new Promise(function (resolve) {
    try {
      (function () {
        var mailServer = new _imap2.default(emailServerConfig);

        mailServer.once('error', function (err) {
          debug(err);
          resolve(false);
        });

        mailServer.once('end', function () {
          debug('Connection to imap server ended');
          resolve(false);
        });

        mailServer.once('ready', async function () {
          debug('Connected to imap server');

          debug('Open inbox');
          var proceed = await _openInbox(mailServer);
          if (!proceed) {
            debug('Unable to open inbox');
            resolve(false);
            return;
          }

          try {
            await _requestMFACode.call(_this2);
          } catch (err) {
            debug(err);
            resolve(false);
            return;
          }

          var uids = void 0;
          var email = void 0;
          var sucess = false;
          try {
            // Find MFA email
            uids = await _searchForEmail(mailServer, 10);

            // Get MFA email as html
            email = await _fetchEmail(mailServer, uids);

            // Extract code from MFA email
            await _getMFACode(email);

            // Delete MFA email
            await _deleteEmail(mailServer, uids);

            sucess = true;
          } catch (err) {
            debug(err.message);
            sucess = false;
          } finally {
            // mailServer.end();
            resolve(sucess);
          }
        });

        mailServer.connect();
      })();
    } catch (err) {
      debug(err.message);
      resolve(false);
    }
  });
}

// Submit MFA token
async function _submitMFACode() {
  debug('Submit MFA code');
  try {
    var url = AUTH_URLS_MFA.SUBMIT_MFACODE;
    var postBody = {
      factorAuthCode: auth.factorAuthCode,
      isBrowserTrusted: true,
      otp: auth.MFACode
    };

    var response = await this._post(url, postBody);
    if (response instanceof Error || typeof response === 'undefined') {
      debug(response);
      return false;
    }

    if (response.meta.code !== 200) {
      debug(response.meta.message);
      return false;
    }

    auth.token = response.data.token;
    var buff = Buffer.from(auth.token);
    var tokenBase64 = buff.toString('base64');
    this.headers.authorization = tokenBase64;
    auth.tokenExpires = response.data.expiresIn;

    return true;
  } catch (err) {
    debug('Error in response object');
    debug(err);
    return false;
  }
}

// Verifiy authorization token
async function _verifyAuthToken() {
  debug('Verifiy authorization token');
  try {
    var url = AUTH_URLS_MFA.VERIFY_AUTH + auth.authenticated;
    var response = await this._get(url);
    if (response instanceof Error || typeof response === 'undefined') {
      debug(response);
      return false;
    }

    this.userProfile = response.data;

    return true;
  } catch (err) {
    debug(err.message);
    return false;
  }
}

// New session
async function _newSession() {
  debug('Start new session');
  try {
    // Set headers
    this.headers.accept = 'application/json';
    this.headers.authorization = auth.token;
    // this.headers.Host = API_DOMAIN;

    var url = AUTH_URLS_MFA.START_NEW_SESSION;
    var response = await this._get(url);

    if (response instanceof Error || typeof response === 'undefined') {
      debug(response);
      return false;
    }

    this.token = response.data.token;
    this.userId = response.data.userId;
    this.serialNumber = response.data.serialNumber;
    this.sessionExpires = auth.tokenExpires;
    return true;
  } catch (err) {
    debug(err.message);
    return false;
  }
}

exports.default = {
  _validateToken: _validateToken,
  _getAuthToken: _getAuthToken,
  _getFactors: _getFactors,
  _getMFACodeFromEmail: _getMFACodeFromEmail,
  _submitMFACode: _submitMFACode,
  _requestMFACode: _requestMFACode,
  _verifyAuthToken: _verifyAuthToken,
  _newSession: _newSession
};
