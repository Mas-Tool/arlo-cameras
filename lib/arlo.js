'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

var _axios = require('axios');

var _axios2 = _interopRequireDefault(_axios);

var _util = require('util');

var _util2 = _interopRequireDefault(_util);

var _events = require('events');

var _uuid = require('uuid');

var _crypto = require('crypto');

var _crypto2 = _interopRequireDefault(_crypto);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _axiosCookiejarSupport = require('axios-cookiejar-support');

var _toughCookie = require('tough-cookie');

var _https = require('https');

var _https2 = _interopRequireDefault(_https);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _nodeForge = require('node-forge');

var _nodeForge2 = _interopRequireDefault(_nodeForge);

var _promises = require('timers/promises');

var _mfa = require('./mfa.js');

var _mfa2 = _interopRequireDefault(_mfa);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * Import libraries
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */

// eslint-disable-next-line import/no-unresolved


/**
 * Import internal libraries
 */


var debug = new _debug2.default('Arlo:main');
var debugComm = new _debug2.default('Arlo:axios');
var debugEvent = new _debug2.default('Arlo:event');

// URL's
var API_DOMAIN = 'myapi.arlo.com';
var ARLO_URLS = {};
ARLO_URLS.API_ROOT = 'https://' + API_DOMAIN;
ARLO_URLS.BASE_URL = 'my.arlo.com';
ARLO_URLS.WEB = ARLO_URLS.API_ROOT + '/hmsweb';
ARLO_URLS.LOGOUT = ARLO_URLS.WEB + '/logout';
ARLO_URLS.WEB_CLIENT = ARLO_URLS.WEB + '/client';
ARLO_URLS.SUBSCRIBE = ARLO_URLS.WEB_CLIENT + '/subscribe';
ARLO_URLS.UNSUBSCRIBE = ARLO_URLS.WEB_CLIENT + '/unsubscribe';
ARLO_URLS.WEB_USERS = ARLO_URLS.WEB + '/users';
ARLO_URLS.DEVICES_V2 = ARLO_URLS.WEB + '/v2/users/devices';
ARLO_URLS.DEVICES = ARLO_URLS.WEB_USERS + '/devices';
ARLO_URLS.DEVICE = ARLO_URLS.WEB_USERS + '/device';
ARLO_URLS.AUTOMATIONACTIVE = ARLO_URLS.DEVICES + '/automation/active';
ARLO_URLS.SERVICE_LEVEL_SETTINGS = ARLO_URLS.WEB_USERS + '/serviceLevel/settings';
ARLO_URLS.SERVICE_LEVELS = ARLO_URLS.WEB_USERS + '/serviceLevel/v4';
ARLO_URLS.CAPABILITIES = ARLO_URLS.WEB_USERS + '/capabilities';
ARLO_URLS.FEATURES = ARLO_URLS.WEB_USERS + '/subscription/smart/features';
ARLO_URLS.EMERGENCY_LOCATIONS = ARLO_URLS.WEB_USERS + '/emergency/locations';
ARLO_URLS.NOTIFY = ARLO_URLS.DEVICES + '/notify';
ARLO_URLS.START_STREAM = ARLO_URLS.DEVICES + '/startStream';
ARLO_URLS.STOP_STREAM = ARLO_URLS.DEVICES + '/stopStream';
ARLO_URLS.SNAPSHOT = ARLO_URLS.DEVICES + '/fullFrameSnapshot';
ARLO_URLS.LIBRARY_SUMMARY = ARLO_URLS.WEB_USERS + '/library/metadata';
ARLO_URLS.LIBRARY = ARLO_URLS.WEB_USERS + '/library';
ARLO_URLS.START_NEW_SESSION = 'https://' + API_DOMAIN + '/hmsweb/users/session/v2';

// Events
var EVENT_LOGGED_IN = 'logged_in';
var EVENT_MESSAGE = 'message';
var EVENT_CONNECTED = 'connected';
var EVENT_FF_SNAPSHOT_AVAILABLE = 'fullFrameSnapshotAvailable';
var EVENT_MEDIA_UPLOAD = 'mediaUploadNotification';
var EVENT_FOUND = 'device_found';
var EVENT_GOT_DEVICES = 'got_all_devices';
var EVENT_MODE = 'activeAutomations';
var EVENT_SIREN = 'siren';
var EVENT_DEVICES = 'devices';
var EVENT_BATTERY = 'batteryLevel';
var EVENT_DEVICE_UPDATE = 'deviceUpdate';
var EVENT_LOGOUT = 'logout';
var EVENT_RATLS = 'storage/ratls';
var EVENT_PROPERTIES = 'properties_updated';

// Device Types
var TYPE_ARLOQS = 'arloqs';
var TYPE_ARLOQ = 'arloq';
var TYPE_BASESTATION = 'basestation';
var TYPE_CAMERA = 'camera';

/**
 * Arlo class
 *
 * @class Arlo
 */

var Arlo = function (_EventEmitter) {
  _inherits(Arlo, _EventEmitter);

  /**
   * Creates an instance of Arlo.
   *
   * @param {Object} options
   * @memberof Arlo
   * Params:
   *    arloUser              // Arlo account email address
   *    arloPassword          // Arlo account password
   *    updatePropertiesEvery // Update device information every x minutes
   *    emailUser             // Your email address registered to receive MFA
   *    emailPassword         // Your email password
   *    emailServer           // Email server
   *    mfaViaEmail           // True for MFA via email
   *                          // False for mobile app token
   *    mobileAuthToken       // Extracted from Arlo mobile app using
   *                          // a proxy tool like proxyman
   *    localAppID            // Used to connect to local storage.
   *                          // Random chars - needs to conform to
   *                          // '********-****-****-****-************'
   *                          // This needs to be static id per installation.
   *                          // iOS & Andriod use the device identifier UUID
   */
  function Arlo(options) {
    var _ret5, _ret6;

    _classCallCheck(this, Arlo);

    var _this = _possibleConstructorReturn(this, (Arlo.__proto__ || Object.getPrototypeOf(Arlo)).call(this));

    if (!options) {
      debug('No options passed in');
      _this._fatal();
    }
    _this.config = options;
    _this.loggedIn = false;
    _this.connected = false;
    _this.cameras = [];
    _this.timers = [];
    _this.RATLS = {};

    // Check constructor params

    // Default login is via seed token from mobile app
    if (typeof _this.config.mfaViaEmail === 'undefined') _this.config.mfaViaEmail = false;

    if (_this.config.mfaViaEmail) {
      var _ret, _ret2, _ret3;

      // Auth via email
      debug('Checking MFA auth params');
      if (typeof _this.config.emailUser === 'undefined')
        // eslint-disable-next-line no-constructor-return
        return _ret = Error('No email user'), _possibleConstructorReturn(_this, _ret);
      if (typeof _this.config.emailPassword === 'undefined')
        // eslint-disable-next-line no-constructor-return
        return _ret2 = Error('No email password'), _possibleConstructorReturn(_this, _ret2);
      if (typeof _this.config.emailServer === 'undefined')
        // eslint-disable-next-line no-constructor-return
        return _ret3 = Error('No email server'), _possibleConstructorReturn(_this, _ret3);
    } else {
      var _ret4;

      if (typeof _this.config.mobileAuthToken === 'undefined')
        // eslint-disable-next-line no-constructor-return
        return _ret4 = Error('No Arlo mobile auth token param'), _possibleConstructorReturn(_this, _ret4);

      _this.mobileAuthToken = _this.config.mobileAuthToken;
    }

    // Arlo account login params
    if (typeof _this.config.arloUser === 'undefined')
      // eslint-disable-next-line no-constructor-return
      return _ret5 = Error('No Arlo user param'), _possibleConstructorReturn(_this, _ret5);
    if (typeof _this.config.arloPassword === 'undefined')
      // eslint-disable-next-line no-constructor-return
      return _ret6 = Error('No Arlo password param'), _possibleConstructorReturn(_this, _ret6);

    // Convert arlo password to base64 if requesting MFA
    if (_this.config.mfaViaEmail) {
      var buff = Buffer.from(_this.config.arloPassword);
      _this.config.arloPassword = buff.toString('base64');
    }

    // Set defaults if no override
    if (typeof _this.config.updatePropertiesEvery !== 'undefined') _this.updatePropertiesTimer = _this.config.updatePropertiesEvery * 60000;

    _this.localAppID = _this.config.localAppID;
    // if (typeof this.config.token === 'undefined') this.config.token = '';

    var jar = new _toughCookie.CookieJar();
    _this.axiosClient = (0, _axiosCookiejarSupport.wrapper)(_axios2.default.create({ jar: jar }));
    return _this;
  }

  /** *************************
   * Public functions
   ************************* */

  /**
   * Login to Arlo
   */


  _createClass(Arlo, [{
    key: 'login',
    value: async function login() {
      var _this2 = this;

      // Default headers
      this.headers = {
        'Content-Type': 'application/json',
        Connection: 'keep-alive',
        Accept: '*/*',
        'Accept-Language': 'en-gb',
        'Accept-Encoding': 'gzip, deflate, br',
        Pragma: 'no-cache',
        'X-DreamFactory-Api-Key': '8c6b41f20897aa6b3f852a1ca3aded0471888e2e119da2737de2a9c797a8ae8d'
      };

      // Login specific headers
      if (!this.config.mfaViaEmail) {
        this.headers.host = 'ocapi.arlo.com';
        this.headers['User-Agent'] = 'Arlo/2967 CFNetwork/1312 Darwin/21.0.0';
      } else {
        this.headers['User-Agent'] = 'Mozilla/5.0 (iPhone; CPU iPhone OS 11_1_2 like Mac OS X) AppleWebKit/604.3.5 (KHTML, like Gecko) Mobile/15B202 NETGEAR/v1 (iOS Vuezone)';
        this.headers.DNT = '1';
        this.headers.schemaVersion = '1';
        this.headers['Auth-Version'] = '2';
        this.headers.origin = 'https://' + ARLO_URLS.BASE_URL;
        this.headers.referer = 'https://' + ARLO_URLS.BASE_URL + '/';
        this.headers.source = 'arloCamWeb';
      }

      // if (!proceed) {
      debug('Logging in');
      this.headers.authorization = null; // Clear out old token;

      var proceed = await _mfa2.default._getAuthToken.call(this);
      if (!proceed) return false;

      proceed = await _mfa2.default._getFactors.call(this);
      if (!proceed) return false;

      // If MFA then get code from email server
      if (this.config.mfaViaEmail) {
        proceed = await _mfa2.default._getMFACodeFromEmail.call(this);
        if (!proceed) return false;

        proceed = await _mfa2.default._submitMFACode.call(this);
        if (!proceed) return false;

        proceed = await _mfa2.default._verifyAuthToken.call(this);
        if (!proceed) return false;

        proceed = await _mfa2.default._newSession.call(this);
        if (!proceed) return false;
      } else {
        proceed = await _mfa2.default._requestMFACode.call(this);
        if (!proceed) return false;

        proceed = await _mfa2.default._validateToken.call(this);
        if (!proceed) return false;
      }

      debug('Logged in');
      this.loggedIn = true;
      this.emit(EVENT_LOGGED_IN, this.serialNumber);

      // Set timer to log out when token expires
      (0, _promises.setTimeout)(function () {
        return _this2._logOut.call(_this2);
      }, this.tokenExpires);

      // Reset headers
      this.headers = {
        accept: 'application/json',
        'content-type': 'application/json;charset=UTF-8',
        'auth-version': 2,
        'accept-encoding': 'gzip, deflate, br',
        'user-agent': '(iPhone13,3 14_7_1) iOS Arlo 3.5',
        'accept-language': 'en-GB',
        authorization: this.token
      };

      // Setup event stream listner
      await this._subscribe();

      return true;
    }

    /**
     * Arm base station/camera
     */

  }, {
    key: 'arm',
    value: function arm(deviceID) {
      try {
        debug('Arm base station/camera');
        var device = void 0;
        if (deviceID === this.baseStation.deviceId) device = this.baseStation;else {
          var deviceIndex = this.cameras.findIndex(function (d) {
            return d.deviceId === deviceID;
          });
          if (deviceIndex < 0) {
            var err = new Error('No device found');
            debug(err);
            return err;
          }
          device = this.cameras[deviceIndex];
        }

        // Set new mode
        this._notify({
          action: 'set',
          resource: 'modes',
          publishResponse: true,
          properties: { active: 'mode1' }
        }, device);
        return true;
      } catch (err) {
        debug(err.message);
        return err;
      }
    }

    /**
     * Disarm base station/camera
     */

  }, {
    key: 'disarm',
    value: function disarm(deviceID) {
      try {
        debug('Disarm base station/camera');
        var device = void 0;
        if (deviceID === this.baseStation.deviceId) device = this.baseStation;else {
          var deviceIndex = this.cameras.findIndex(function (d) {
            return d.deviceId === deviceID;
          });
          if (deviceIndex < 0) {
            var err = new Error('No device found');
            debug(err);
            return err;
          }
          device = this.cameras[deviceIndex];
        }
        // Set new mode
        this._notify({
          action: 'set',
          resource: 'modes',
          publishResponse: true,
          properties: { active: 'mode0' }
        }, device);
        return true;
      } catch (err) {
        debug(err.message);
        return err;
      }
    }

    /**
     * Turn on/off camera
     */

  }, {
    key: 'setPrivacyActive',
    value: async function setPrivacyActive(deviceID, privacy) {
      debug('[' + deviceID + '] Turn camera ' + (privacy ? 'off' : 'on'));
      var deviceIndex = this.cameras.findIndex(function (d) {
        return d.deviceId === deviceID;
      });
      if (deviceIndex < 0) {
        var err = new Error('No device found');
        debug(err);
        return err;
      }

      var device = void 0;
      switch (this.cameras[deviceIndex].deviceType) {
        case TYPE_ARLOQS:
        case TYPE_ARLOQ:
          device = this.cameras[deviceIndex];
          break;
        case TYPE_CAMERA:
          device = this.baseStation;
          break;
        default:
          return false;
      }

      await this._notify({
        action: 'set',
        resource: 'cameras/' + deviceID,
        publishResponse: true,
        properties: { privacyActive: privacy }
      }, device);

      // Request device properties refresh
      await this._requestDeviceEvents.call(this, device);

      return true;
    }

    /**
     * Turn on the siren
     */

  }, {
    key: 'sirenOn',
    value: async function sirenOn(deviceID) {
      debug('[' + deviceID + '] Turn siren on');
      await this._notify({
        action: 'set',
        resource: 'siren/' + deviceID,
        publishResponse: true,
        properties: {
          sirenState: 'on',
          duration: 300,
          volume: 8,
          pattern: 'alarm'
        }
      }, deviceID);

      // Request device properties refresh
      await this._refreshDeviceProperties(deviceID);

      return true;
    }

    /**
     * Turn off the siren
     */

  }, {
    key: 'sirenOff',
    value: async function sirenOff(deviceID) {
      debug('[' + deviceID + '] Turn siren off');
      await this._notify({
        action: 'set',
        resource: 'siren/' + deviceID,
        publishResponse: true,
        properties: {
          sirenState: 'off',
          duration: 300,
          volume: 8,
          pattern: 'alarm'
        }
      }, deviceID);

      // Request device properties refresh
      await this._refreshDeviceProperties(deviceID);

      return true;
    }

    /**
     * Start camera video stream
     */

  }, {
    key: 'startStream',
    value: async function startStream(deviceID) {
      try {
        var deviceIndex = this.cameras.findIndex(function (d) {
          return d.deviceId === deviceID;
        });
        if (deviceIndex < 0) {
          var err = new Error('No device found');
          debug(err);
          return err;
        }
        var device = this.cameras[deviceIndex];

        // Return existing stream url if stream already active
        if (device.streamActive) return device.streamURL;

        // Do not start stream if camera is in privacy mode
        if (device.properties.privacyActive) {
          // deepcode ignore ExceptionIsNotThrown:
          var _err = new Error('Camera not active, unable to start stream');
          debug('[' + deviceID + '] ' + _err);
          return _err;
        }

        debug('[' + deviceID + '] Camera is on, requesting stream');
        var body = {
          from: '' + this.userId,
          to: this.baseStation.deviceId,
          action: 'set',
          resource: 'cameras/' + deviceID,
          publishResponse: true,
          transId: this._genTransID(),
          properties: {
            smartZoom: {
              topleftx: 0,
              toplefty: 0,
              bottomrightx: 3840,
              bottomrighty: 2160
            },
            activityState: 'startUserStream',
            cameraId: deviceID
          }
        };

        this._notify(body, device);

        var url = ARLO_URLS.START_STREAM;
        var response = await this._post(url, body, {
          xCloudId: this.baseStation.xCloudId
        });

        if (response instanceof Error || typeof response === 'undefined') {
          debug(response.message);
          return response;
        }

        if (!response.success) {
          debug(response.data.message);
          return new Error(response.data.message);
        }

        if (response.data.url === null || typeof response.data.url === 'undefined') {
          var _err2 = new Error('Error getting stream for device: ' + deviceID);
          debug(_err2.message);
          return _err2;
        }

        var rtnURL = response.data.url.replace('rtsp://', 'rtsps://');
        this.cameras[deviceIndex].streamURL = rtnURL;
        this.cameras[deviceIndex].streamActive = true;

        debug('[' + deviceID + '] Stream URL: ' + rtnURL);
        return rtnURL;
      } catch (err) {
        debug(err);
        return err;
      }
    }

    /**
     * Stop camera video stream
     */

  }, {
    key: 'stopStream',
    value: async function stopStream(deviceID) {
      try {
        var deviceIndex = this.cameras.findIndex(function (d) {
          return d.deviceId === deviceID;
        });
        if (deviceIndex < 0) {
          var err = new Error('No device found');
          debug(err);
          return err;
        }

        debug('[' + deviceID + '] Stop stream');
        var body = {
          from: '' + this.userId,
          to: this.baseStation.deviceId,
          action: 'set',
          resource: 'cameras/' + deviceID,
          publishResponse: true,
          transId: this._genTransID(),
          properties: {
            activityState: 'stopUserStream',
            cameraId: deviceID
          }
        };

        var url = ARLO_URLS.STOP_STREAM;
        var response = await this._post(url, body, {
          xCloudId: this.baseStation.xCloudId
        });

        if (response instanceof Error) debug(response.message);

        debug('[' + deviceID + '] Stream stopped');
        this.cameras[deviceIndex].streamURL = '';
        this.cameras[deviceIndex].streamActive = false;
        return true;
      } catch (err) {
        debug(err);
        return err;
      }
    }

    /**
     * Return the latest snapShot image URL
     */

  }, {
    key: 'getSnapshotURL',
    value: function getSnapshotURL(deviceID) {
      try {
        debug('[' + deviceID + '] Return snapshot URL');
        var deviceIndex = this.cameras.findIndex(function (d) {
          return d.deviceId === deviceID;
        });
        if (deviceIndex < 0) {
          var err = new Error('No device found');
          debug(err);
          return err;
        }
        var url = {
          presignedLastImageUrl: this.cameras[deviceIndex].presignedLastImageUrl,
          presignedFullFrameSnapshotUrl: this.cameras[deviceIndex].presignedFullFrameSnapshotUrl
        };
        return url;
      } catch (err) {
        debug(err);
        return err;
      }
    }

    /**
     * Take new snapshot
     */

  }, {
    key: 'getNewSnapshot',
    value: async function getNewSnapshot(deviceID) {
      try {
        var deviceIndex = this.cameras.findIndex(function (d) {
          return d.deviceId === deviceID;
        });
        if (deviceIndex < 0) {
          var err = new Error('Get FF snapshot: No device found');
          debug(err);
          return err;
        }

        var device = this.cameras[deviceIndex];

        // Do not take snapshot if app just launched
        if (typeof device.properties.privacyActive === 'undefined') return false;

        // Do not take snapshot if camera is in privacy mode
        if (device.properties.privacyActive) {
          debug('[' + deviceID + '] Camera not active, unable to take FF snapshot');
          return false;
        }

        debug('[' + deviceID + '] Get new FF snapshot');
        var url = ARLO_URLS.SNAPSHOT;
        var body = {};
        body.from = '' + this.userId;
        body.to = this.baseStation.deviceId;
        body.transId = this._genTransID();
        body.resource = 'cameras/' + deviceID;
        body.action = 'set';
        body.publishResponse = true;
        body.properties = { activityState: 'fullFrameSnapshot' };

        var response = await this._post(url, body, {
          xCloudId: device.xCloudId
        });
        if (response instanceof Error) {
          debug('Error getting FF snapshot');
          debug(response.message);
          return response;
        }

        if (!response.success) {
          debug(response.data.message);
          var _err3 = new Error(response.data.message);
          throw _err3;
        }

        return true;
      } catch (err) {
        debug(err);
        return err;
      }
    }

    /**
     * Get media library summary data
     */

  }, {
    key: 'getMediaLibrarySummary',
    value: async function getMediaLibrarySummary(from) {
      try {
        debug('Get media library summary data');

        var url = ARLO_URLS.LIBRARY_SUMMARY;
        var body = {
          dateFrom: from || (0, _moment2.default)().format('yyyyMMDD'),
          dateTo: (0, _moment2.default)().format('yyyyMMDD')
        };

        var response = await this._post(url, body, {});

        if (response instanceof Error) {
          debug(response.message);
          return response;
        }

        if (!response || !response.success) throw new Error('Error getting media library summary data');

        return response.data;
      } catch (err) {
        debug(err);
        return err;
      }
    }

    /**
     * Get media library data
     */

  }, {
    key: 'getMediaLibrary',
    value: async function getMediaLibrary(from) {
      try {
        debug('Get media library data');

        var url = ARLO_URLS.LIBRARY;
        var body = {
          dateFrom: from || (0, _moment2.default)().format('yyyyMMDD'),
          dateTo: (0, _moment2.default)().format('yyyyMMDD')
        };

        var response = await this._post(url, body, {});

        if (response instanceof Error) {
          var err = new Error('Error getting media library data');
          debug(response.message);
          throw err;
        }

        return response.data;
      } catch (err) {
        debug(err);
        return err;
      }
    }

    /**
     * Download local media file
     */

  }, {
    key: 'downloadLocalMediaFile',
    value: async function downloadLocalMediaFile(filePath, outputLocationPath) {
      var url = 'https://' + this.RATLS.ip + ':' + this.RATLS.port + '/hmsls/download/' + filePath;

      // Bind certs to http agent
      var httpsAgent = new _https2.default.Agent({
        ca: this.RATLS.icaCert,
        cert: this.RATLS.peerCert,
        key: this.RATLS.privateKey,
        rejectUnauthorized: false });

      // Set headers
      var headers = {
        authorization: 'Bearer ' + this.RATLS.token,
        'user-agent': this.headers['user-agent']
      };

      var options = {
        method: 'GET',
        responseType: 'stream',
        // deepcode ignore Ssrf:
        url: url,
        httpsAgent: httpsAgent,
        headers: headers
      };

      try {
        // Call local storage account and download recording
        debug('download file');
        // deepcode ignore Ssrf:, deepcode ignore PromiseNotCaughtGeneral:
        var processFile = await (0, _axios2.default)(options).then(function (response) {
          var writer = _fs2.default.createWriteStream('' + outputLocationPath);
          return new Promise(function (resolve, reject) {
            response.data.pipe(writer);
            var error = null;
            writer.on('error', function (err) {
              error = err;
              writer.close();
              reject(err);
            });
            writer.on('close', function () {
              if (!error) {
                resolve(true);
              }
            });
          });
        });
        return processFile;
      } catch (err) {
        debug(err);
        return err;
      }
    }
  }, {
    key: 'reSetBaseStation',
    value: async function reSetBaseStation() {
      var directory = 'certs';

      debug('Removing certs for: ' + this.baseStation.deviceId);

      _fs2.default.readdir(directory, function (err, files) {
        if (err) throw err;

        // eslint-disable-next-line no-restricted-syntax
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = files[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var file = _step.value;

            _fs2.default.unlink(_path2.default.join(directory, file), function (error) {
              if (error) throw error;
            });
          }
        } catch (err) {
          _didIteratorError = true;
          _iteratorError = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion && _iterator.return) {
              _iterator.return();
            }
          } finally {
            if (_didIteratorError) {
              throw _iteratorError;
            }
          }
        }
      });

      // Re-start basestation
      /*
      const reStartUrl = `${ARLO_URLS.DEVICES}/restart`;
       const body = {
        deviceId: this.baseStation.deviceId,
      };
      debug('Restarting base station');
      await this._post(reStartUrl, body);
      */
    }
  }, {
    key: 'getLocalMediaLibrary',
    value: async function getLocalMediaLibrary(from) {
      // Check if certs exist
      var peerCrtPath = './certs/peer.crt';
      if (!_fs2.default.existsSync(peerCrtPath)) {
        // Generate local cert if not exists
        debug('Peer certs does not exists, Check if public pem exists');
        var publicPemPath = './certs/public.pem';
        if (_fs2.default.existsSync(publicPemPath)) {
          debug('Cert already exists, reading file');
          this.RATLS.publicKey = _fs2.default.readFileSync('./certs/public.pem', {
            encoding: 'utf8'
          });
          this.RATLS.privateKey = _fs2.default.readFileSync('./certs/private.pem', {
            encoding: 'utf8'
          });
        } else {
          try {
            debug('Generating new local certs');

            // Generate key pairs
            var keys = _nodeForge2.default.pki.rsa.generateKeyPair(2048);

            // PEM serialize
            this.RATLS.privateKey = _nodeForge2.default.pki.privateKeyToPem(keys.privateKey);
            this.RATLS.publicKey = _nodeForge2.default.pki.publicKeyToPem(keys.publicKey);

            // Save certs
            _fs2.default.writeFileSync('./certs/private.pem', this.RATLS.privateKey);
            _fs2.default.writeFileSync('./certs/public.pem', this.RATLS.publicKey);
          } catch (err) {
            debug('Unable to save certs');
            throw err;
          }
        }

        debug('Strip return, header and footer from cert');
        var publicKey = this.RATLS.publicKey.replace(/(\r\n|\n|\r)/gm, '');
        publicKey = publicKey.replace('-----BEGIN PUBLIC KEY-----', '');
        publicKey = publicKey.replace('-----END PUBLIC KEY-----', '');

        debug('Get RATLS certs');
        var _url = ARLO_URLS.DEVICES + '/v2/security/cert/create';
        var body = {
          uuid: this.localAppID,
          publicKey: publicKey,
          uniqueIds: [this.userId + '_' + this.baseStation.deviceId]
        };

        var _response = await this._post(_url, body);
        if (_response instanceof Error) {
          debug(_response.message);
          throw new Error('Error getting media library data');
        }

        if (!_response.success) {
          var err = new Error(_response.data.message);
          debug(err.message);
          return err;
        }

        debug('Saving RATLS certs');
        this.RATLS.peerCert = this._formatToPem(_response.data.certsData[0].peerCert);
        _fs2.default.writeFileSync('./certs/peer.crt', this.RATLS.peerCert);

        this.RATLS.deviceCert = this._formatToPem(_response.data.certsData[0].deviceCert);
        _fs2.default.writeFileSync('./certs/device.crt', this.RATLS.deviceCert);

        this.RATLS.icaCert = this._formatToPem(_response.data.icaCert);
        _fs2.default.writeFileSync('./certs/ica.crt', this.RATLS.icaCert);

        this.RATLS.combined = this.RATLS.peerCert + '\n' + this.RATLS.icaCert;
        _fs2.default.writeFileSync('./certs/combined.crt', this.RATLS.combined);
      } else {
        debug('Loading RATLS certs');

        this.RATLS.privateKey = _fs2.default.readFileSync('./certs/private.pem', {
          encoding: 'utf8'
        });
        this.RATLS.icaCert = _fs2.default.readFileSync('./certs/ica.crt', {
          encoding: 'utf8'
        });
        this.RATLS.peerCert = _fs2.default.readFileSync('./certs/peer.crt', {
          encoding: 'utf8'
        });
      }

      // Connect to local storage device
      var dateFrom = from || (0, _moment2.default)().format('yyyyMMDD');
      var dateTo = (0, _moment2.default)().format('yyyyMMDD');
      var url = 'https://' + this.RATLS.ip + ':' + this.RATLS.port + '/hmsls/list/' + dateFrom + '/' + dateTo;

      // Bind certs to http agent
      var httpsAgent = new _https2.default.Agent({
        ca: this.RATLS.icaCert,
        cert: this.RATLS.peerCert,
        key: this.RATLS.privateKey,
        rejectUnauthorized: false });

      // Set headers
      var headers = {
        authorization: 'Bearer ' + this.RATLS.token,
        accept: 'application/json',
        'user-agent': this.headers['user-agent']
      };

      var options = {
        method: 'GET',
        // deepcode ignore Ssrf:
        url: url,
        httpsAgent: httpsAgent,
        headers: headers
      };

      // Call local storage account to get recordings
      debug('Getting local storage recording data');

      var response = void 0;
      try {
        // deepcode ignore Ssrf:
        response = await (0, _axios2.default)(options);
      } catch (err) {
        debug(err.message);
        response = err;
      }

      if (response instanceof Error) {
        await this.reSetBaseStation.call(this);
        return Error('Error getting media library data');
      }

      if (!response || !response.data.success) {
        await this.reSetBaseStation.call(this);
        return Error('Error getting local media library data');
      }

      var recordsFound = 0;
      if (response.data.data) recordsFound = response.data.data.length;

      debug('Found ' + recordsFound + ' recordings');
      return response.data.data || [];
    }

    /**
     * Request access to RATLS
     */

  }, {
    key: 'openLocalMediaLibrary',
    value: async function openLocalMediaLibrary() {
      try {
        debug('Request local storage activation');

        debug('Checking app ID params');
        if (typeof this.config.localAppID === 'undefined') {
          // eslint-disable-next-line no-constructor-return
          var err = Error('No local media app ID param');
          debug(err.message);
          throw err;
        }

        // Get RATLS token
        var url = ARLO_URLS.DEVICE + '/ratls/token/' + this.baseStation.deviceId;
        var response = await this._get(url);
        if (response instanceof Error || !response.success) {
          var _err4 = new Error('Error getting media library data');
          debug(response.message);
          throw _err4;
        }
        this.RATLS.token = response.data.ratlsToken;

        var body = {
          from: '' + this.userId,
          to: this.baseStation.deviceId,
          action: 'open',
          resource: 'storage/ratls',
          publishResponse: false,
          transId: this._genTransID()
        };

        await this._notify(body, this.baseStation);
        debug('Requested local storage activation');
      } catch (err) {
        debug(err.message);
        return err;
      }
      return true;
    }

    /**
     * Check if camera privacy mode is enabled
     */

  }, {
    key: 'isPrivacyEnabled',
    value: async function isPrivacyEnabled(deviceID) {
      try {
        var deviceIndex = this.cameras.findIndex(function (d) {
          return d.deviceId === deviceID;
        });
        if (deviceIndex < 0) {
          var err = new Error('Is cam Privacy Enabled: No device found');
          debug(err);
          return err;
        }

        var device = this.cameras[deviceIndex];

        if (device.properties.privacyActive) {
          debug('[' + deviceID + '] Camera privacy mode active');
          return true;
        }
        debug('[' + deviceID + '] Camera privacy mode in-active');
        return false;
      } catch (err) {
        debug(err);
        return err;
      }
    }

    /**
     * Check if base station is armed
     */

  }, {
    key: 'isArmed',
    value: async function isArmed() {
      debug('Base station is ' + (this.baseStation.armed ? 'armed' : 'disarmed'));
      return this.baseStation.armed;
    }

    /**
     * Get service level settings from api
     */

  }, {
    key: 'getServiceLevelSettings',
    value: async function getServiceLevelSettings() {
      debug('Getting service level settings data');
      try {
        var url = ARLO_URLS.SERVICE_LEVEL_SETTINGS;
        var response = await this._get(url);
        if (response instanceof Error) {
          debug(response.message);
          return response;
        }

        if (response.length === 0) throw new Error('Error getting service level settings');

        return response;
      } catch (err) {
        debug(err);
        return err;
      }
    }

    /**
     * Get capabilities from api
     */

  }, {
    key: 'getCapabilities',
    value: async function getCapabilities() {
      debug('Getting capabilities data');
      try {
        var url = ARLO_URLS.CAPABILITIES;
        var response = await this._post(url);
        if (response instanceof Error) {
          debug(response.message);
          return response;
        }

        if (response.length === 0) throw new Error('Error getting capabilities');

        return response;
      } catch (err) {
        debug(err);
        return err;
      }
    }

    /**
     * Get features from api
     */

  }, {
    key: 'getFeatures',
    value: async function getFeatures() {
      debug('Getting features data');
      try {
        var xTransID = 'FE!' + (0, _uuid.v4)() + '&time=' + Date.now();
        this.headers['x-transaction-id'] = xTransID;

        var url = ARLO_URLS.FEATURES + '?eventId=' + xTransID;
        var response = await this._get(url);
        if (response instanceof Error) {
          debug(response.message);
          return response;
        }

        if (response.length === 0) throw new Error('Error getting features');

        return response;
      } catch (err) {
        debug(err);
        return err;
      }
    }

    /**
     * Get emergency locations from api
     */

  }, {
    key: 'getEmergencyLocations',
    value: async function getEmergencyLocations() {
      debug('Getting emergency location data');
      try {
        var xTransID = 'FE!' + (0, _uuid.v4)() + '&time=' + Date.now();
        this.headers['x-transaction-id'] = xTransID;

        var url = ARLO_URLS.EMERGENCY_LOCATIONS + '?eventId=' + xTransID;
        var response = await this._get(url);
        if (response instanceof Error) debug(response);
        return response;
      } catch (err) {
        debug(err);
        return err;
      }
    }

    /**
     * Get service levels from api
     */

  }, {
    key: 'getServiceLevels',
    value: async function getServiceLevels() {
      debug('Getting service levels data');
      try {
        var xTransID = 'FE!' + (0, _uuid.v4)() + '&time=' + Date.now();
        this.headers['x-transaction-id'] = xTransID;

        var url = ARLO_URLS.SERVICE_LEVELS + '?eventId=' + xTransID;
        var response = await this._get(url);
        if (response instanceof Error) {
          debug(response.message);
          return response;
        }

        if (response.length === 0) throw new Error('Error getting service levels');

        return response;
      } catch (err) {
        debug(err);
        return err;
      }
    }

    /** *************************
     * Private functions
     ************************* */

    /**
     * Get device armed status
     */

  }, {
    key: '_getArmedStatus',
    value: async function _getArmedStatus() {
      var _this3 = this;

      debug('Getting armed status data');
      try {
        var url = ARLO_URLS.AUTOMATIONACTIVE;
        var response = await this._get(url);
        if (response instanceof Error) {
          debug(response.message);
          return response;
        }

        if (response.length === 0) throw new Error('Error getting armed status settings');

        var baseStationArmedData = response.data.filter(function (device) {
          return device.gatewayId === _this3.baseStation.deviceId;
        });

        if (baseStationArmedData[0].activeModes[0] === 'mode0') this.baseStation.armed = false;else this.baseStation.armed = true;
        return this.baseStation.armed;
      } catch (err) {
        debug(err);
        return err;
      }
    }

    /**
     * Get local media library data
     */
    // eslint-disable-next-line class-methods-use-this

  }, {
    key: '_formatToPem',
    value: function _formatToPem(cert) {
      var begin = '-----BEGIN CERTIFICATE-----\n';
      var end = '\n-----END CERTIFICATE-----';
      var newFormat = cert; // .replace(/.{64}/g, '$&' + '\n');
      return '' + begin + newFormat + end;
    }

    /**
     * Get hmsweb version
     */

  }, {
    key: '_getHmswebVersion',
    value: async function _getHmswebVersion() {
      debug('Get hmsweb version');
      var url = ARLO_URLS.WEB + '/version';

      var response = await this._get(url);
      if (response instanceof Error || typeof response === 'undefined') {
        debug(response);
        return false;
      }
      this.hmsweb = response.version;
      return true;
    }

    /**
     * Request device properties refresh
     */

  }, {
    key: '_refreshDeviceProperties',
    value: async function _refreshDeviceProperties(deviceID) {
      var deviceIndex = this.cameras.findIndex(function (d) {
        return d.deviceId === deviceID;
      });
      if (deviceIndex < 0) {
        var err = new Error('No device found');
        debug(err);
        return err;
      }
      await this._requestDeviceEvents.call(this, this.cameras[deviceIndex]);
      return true;
    }

    /**
     * Generate a unique string to use as transtion
     * key across event responses
     */
    // eslint-disable-next-line class-methods-use-this

  }, {
    key: '_genTransID',
    value: function _genTransID() {
      var id1 = _crypto2.default.randomBytes(10).toString('hex').substr(1, 8);
      var id2 = _crypto2.default.randomBytes(10).toString('hex').substr(1, 6);
      var trandsID = 'iOS!' + id1 + '.' + id2 + '!' + Date.now();
      return trandsID;
    }

    /**
     * Logout and reset so can log back in if needed
     */

  }, {
    key: '_logOut',
    value: async function _logOut() {
      this.connected = false;
      this.loggedIn = false;

      // Remove pooling timers
      this.timers.forEach(function (timer) {
        return clearTimeout(timer);
      });

      var url = ARLO_URLS.LOGOUT;
      var response = await this._put(url, {}, {});

      if (!response.success) debug(response);

      // Clear headers
      this.headers = {};
      this.subscribeHeaders = {};
      delete this.cookieJar;

      // End device event stream
      this.subscribeCancelToken.cancel('Logged out of arlo so cancel stream');

      // Emit logged out event
      this.emit(EVENT_LOGOUT, {});
    }

    /**
     * Send notify requests to Arlo api
     */

  }, {
    key: '_notify',
    value: async function _notify(body, device) {
      try {
        if (!this.connected) return;

        var postBody = body;
        postBody.from = '' + this.userId;
        postBody.to = device.deviceId;
        postBody.transId = this._genTransID();

        // Set url
        var url = ARLO_URLS.NOTIFY + '/' + device.deviceId;

        // Issue request
        var response = await this._post(url, postBody, {
          xCloudId: device.xCloudId,
          'Content-Type': 'application/json; charset=utf-8'
        });

        if (response instanceof Error) {
          debugEvent(response);
          return;
        }
      } catch (err) {
        debugEvent(err);
      }
    }

    /**
     * Request device events
     */

  }, {
    key: '_requestDeviceEvents',
    value: async function _requestDeviceEvents(device) {
      var _this4 = this;

      if (!this.connected) return;

      var body = void 0;

      if (device.deviceType === TYPE_ARLOQS || device.deviceType === TYPE_ARLOQ) {
        debugEvent('[' + device.deviceId + '] Request Q camera events');
        try {
          var from = '' + this.userId;
          var to = device.deviceId;
          body = [{
            from: from,
            to: to,
            action: 'get',
            resource: 'basestation',
            transId: this._genTransID(),
            publishResponse: false
          }, {
            from: from,
            to: to,
            action: 'get',
            resource: 'cameras',
            transId: this._genTransID(),
            publishResponse: false
          }, {
            from: from,
            to: to,
            action: 'get',
            resource: 'wifi/ap',
            transId: this._genTransID(),
            publishResponse: false
          }];
        } catch (err) {
          debugEvent(err);
          return;
        }
      }

      if (device.deviceType === TYPE_BASESTATION) {
        debugEvent('[' + device.deviceId + '] Request smart hub state update');
        try {
          (function () {
            var from = '' + _this4.userId;
            var to = device.deviceId;
            body = [{
              from: from,
              to: to,
              action: 'get',
              resource: 'devices',
              transId: _this4._genTransID(),
              publishResponse: false
            }, {
              from: from,
              to: to,
              action: 'get',
              resource: 'storage',
              transId: _this4._genTransID(),
              publishResponse: false
            }];
            var cams = _this4.cameras.filter(function (d) {
              return d.deviceType === TYPE_CAMERA;
            });
            cams.map(function (c) {
              body.push({
                from: from,
                to: to,
                action: 'get',
                resource: 'siren/' + c.deviceId,
                transId: _this4._genTransID(),
                publishResponse: false
              });
              return true;
            });
          })();
        } catch (err) {
          debugEvent(err);
          return;
        }
      }

      try {
        // Issue request
        var url = ARLO_URLS.NOTIFY + '/' + device.deviceId;
        var response = await this._post(url, body, {
          xCloudId: device.xCloudId
        });

        if (response instanceof Error) debugEvent(response);
      } catch (err) {
        debugEvent(err);
      }
    }

    /**
     * Subscribe a device to events
     */

  }, {
    key: '_subscribeToEvents',
    value: async function _subscribeToEvents(device) {
      var _this5 = this;

      if (!this.connected) return;

      if (!device.isSubscribed) debugEvent('[' + device.deviceId + '] Subscribe device to receieve events');

      var body = {
        action: 'set',
        properties: { devices: [device.deviceId] },
        resource: 'subscriptions/' + this.userId,
        publishResponse: false
      };

      await this._notify(body, device);

      // Keep event stream open by subscribing base station every 20 seconds
      if (device.deviceType === TYPE_BASESTATION) (0, _promises.setTimeout)(function () {
        return _this5._subscribeToEvents.call(_this5, device);
      }, 20000);
    }

    /**
     * Subscribe devices to events
     */

  }, {
    key: '_subscribeDevices',
    value: async function _subscribeDevices() {
      // Base station
      await this._subscribeToEvents.call(this, this.baseStation);

      // Q Cameras
      var devices = this.cameras.filter(function (d) {
        return d.deviceType === TYPE_ARLOQS || d.deviceType === TYPE_ARLOQ;
      });
      if (devices.length === 0) return new Error('No Q device found');
      // eslint-disable-next-line no-restricted-syntax
      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = devices[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var device = _step2.value;

          this._subscribeToEvents.call(this, device);
        }
      } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion2 && _iterator2.return) {
            _iterator2.return();
          }
        } finally {
          if (_didIteratorError2) {
            throw _iteratorError2;
          }
        }
      }

      return true;
    }

    /**
     * Get Arlo devices
     */

  }, {
    key: '_getDevices',
    value: async function _getDevices() {
      var _this6 = this;

      debug('Getting devices');

      try {
        var url = ARLO_URLS.DEVICES_V2;
        var response = await this._get(url);
        if (response instanceof Error) {
          debug(response);
          return false;
        }
        var body = response.data;

        // Setup base station
        var baseStationData = body.filter(function (d) {
          return d.deviceType === TYPE_BASESTATION;
        });
        if (baseStationData.length === 0) {
          debug('No base station found');
          return false;
        }

        // Process base station data

        var _baseStationData = _slicedToArray(baseStationData, 1);

        this.baseStation = _baseStationData[0];

        this.userId = baseStationData[0].userId;

        debug('Found base station: ' + this.baseStation.deviceId);
        this.emit(EVENT_FOUND, {
          id: this.baseStation.deviceId,
          type: TYPE_BASESTATION,
          name: this.baseStation.deviceName
        });

        this.cameras = [];
        // Process remaining devices
        body.forEach(async function (device) {
          // Camera
          if (device.deviceType === TYPE_CAMERA) {
            debug('Found camera: ' + device.deviceId);
            _this6.cameras.push(device);
            _this6.emit(EVENT_FOUND, {
              id: device.deviceId,
              type: TYPE_CAMERA,
              name: device.deviceName
            });
          }

          // Arlo Q
          if (device.deviceType === TYPE_ARLOQS || device.deviceType === TYPE_ARLOQ) {
            debug('Found Q camera: ' + device.deviceId);
            _this6.cameras.push(device);
            _this6.emit(EVENT_FOUND, {
              id: device.deviceId,
              type: TYPE_ARLOQ,
              name: device.deviceName
            });
          }
        });

        debug('Found all devices');
        this.emit(EVENT_GOT_DEVICES, this.cameras);
        await this._subscribeDevices.call(this);

        return true;
      } catch (err) {
        debug(err);
      }
      return true;
    }

    /**
     * Get devices and their properties
     */

  }, {
    key: '_updateDevicesAndProperties',
    value: async function _updateDevicesAndProperties() {
      var getDevices = await this._getDevices.call(this);
      if (!getDevices) {
        debugEvent('Unable to get all devices');
        this._fatal();
      }
      // Update Base station properties
      debugEvent('[' + this.baseStation.deviceId + '] Request device properties');
      this._requestDeviceEvents.call(this, this.baseStation);

      // Update Q Camera properties
      var devices = this.cameras.filter(function (d) {
        return d.deviceType === TYPE_ARLOQS || d.deviceType === TYPE_ARLOQ;
      });
      if (devices.length === 0) return new Error('No Q device found');
      // eslint-disable-next-line no-restricted-syntax
      var _iteratorNormalCompletion3 = true;
      var _didIteratorError3 = false;
      var _iteratorError3 = undefined;

      try {
        for (var _iterator3 = devices[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
          var device = _step3.value;

          // eslint-disable-next-line no-await-in-loop
          debugEvent('[' + device.deviceId + '] Request device properties');
          this._requestDeviceEvents.call(this, device);
        }
      } catch (err) {
        _didIteratorError3 = true;
        _iteratorError3 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion3 && _iterator3.return) {
            _iterator3.return();
          }
        } finally {
          if (_didIteratorError3) {
            throw _iteratorError3;
          }
        }
      }

      await this._getArmedStatus.call(this);
      this.emit(EVENT_PROPERTIES, {});

      return true;
    }

    /**
     * Process event messages
     */

  }, {
    key: '_processEventMessage',
    value: async function _processEventMessage(eventData) {
      var _this7 = this;

      try {
        // Connect to event stream
        if (eventData.status === EVENT_CONNECTED) {
          debugEvent('Connected to event notification stream');
          this.connected = true;
          this.emit(EVENT_CONNECTED, eventData);

          // Get devices
          this._updateDevicesAndProperties.call(this);

          // Set interval for devices and properties refresh
          if (this.updatePropertiesTimer) {
            var timer = setInterval(async function () {
              _this7._updateDevicesAndProperties.call(_this7);
            }, this.updatePropertiesTimer);
            this.timers.push(timer);
          }
          return;
        }

        // Full frame snapshot event
        if (eventData.action === EVENT_FF_SNAPSHOT_AVAILABLE) {
          var _ret8 = function () {
            var deviceID = eventData.resource.substr(8);
            debugEvent('[' + deviceID + '] New full frame snapshot available');

            var presignedFullFrameSnapshotUrl = eventData.properties.presignedFullFrameSnapshotUrl;

            // Update device

            var deviceIndex = _this7.cameras.findIndex(function (d) {
              return d.deviceId === deviceID;
            });
            _this7.cameras[deviceIndex].presignedFullFrameSnapshotUrl = presignedFullFrameSnapshotUrl;

            _this7.emit(EVENT_FF_SNAPSHOT_AVAILABLE, {
              id: deviceID,
              data: { presignedFullFrameSnapshotUrl: presignedFullFrameSnapshotUrl }
            });
            return {
              v: void 0
            };
          }();

          if ((typeof _ret8 === 'undefined' ? 'undefined' : _typeof(_ret8)) === "object") return _ret8.v;
        }

        // Local storage open event
        if (eventData.resource === EVENT_RATLS) {
          debugEvent('[' + this.baseStation.deviceId + '] Local storage open for 5 minutes');
          this.RATLS.ip = eventData.properties.privateIP;
          this.RATLS.port = eventData.properties.port;
          this.emit(EVENT_RATLS);
        }

        // Media upload event
        if (eventData.resource === EVENT_MEDIA_UPLOAD) {
          var _ret9 = function () {
            var deviceID = eventData.deviceId;
            debugEvent('[' + deviceID + '] New media upload event');
            var presignedContentUrl = eventData.presignedContentUrl;
            var presignedThumbnailUrl = eventData.presignedThumbnailUrl;
            var presignedLastImageUrl = eventData.presignedLastImageUrl;

            // Get device

            var deviceIndex = _this7.cameras.findIndex(function (d) {
              return d.deviceId === deviceID;
            });
            if (deviceIndex < 0) {
              debugEvent('No device found');
              return {
                v: void 0
              };
            }

            // If stream was active it's now finished
            if (_this7.cameras[deviceIndex].streamActive) {
              _this7.cameras[deviceIndex].streamActive = false;
              _this7.cameras[deviceIndex].streamURL = '';
            }

            // Update device image properties
            var rtnData = {};
            if (presignedContentUrl) {
              _this7.cameras[deviceIndex].presignedContentUrl = presignedContentUrl;
              rtnData.presignedContentUrl = presignedContentUrl;
            }
            if (presignedThumbnailUrl) {
              _this7.cameras[deviceIndex].presignedThumbnailUrl = presignedThumbnailUrl;
              rtnData.presignedThumbnailUrl = presignedThumbnailUrl;
            }
            if (presignedLastImageUrl) {
              _this7.cameras[deviceIndex].presignedLastImageUrl = presignedLastImageUrl;
              rtnData.presignedLastImageUrl = presignedLastImageUrl;
            }
            _this7.emit(EVENT_MEDIA_UPLOAD, {
              id: deviceID,
              data: rtnData
            });
            return {
              v: void 0
            };
          }();

          if ((typeof _ret9 === 'undefined' ? 'undefined' : _typeof(_ret9)) === "object") return _ret9.v;
        }

        // Arm / disarm event
        if (eventData.resource === EVENT_MODE) {
          var _Object$keys = Object.keys(eventData);

          var _Object$keys2 = _slicedToArray(_Object$keys, 1);

          var id = _Object$keys2[0];
          // eslint-disable-next-line prefer-destructuring

          if (id === 'resource') id = Object.keys(eventData)[1];

          var description = eventData[id].activeModes[0] === 'mode0' ? 'disarmed' : 'armed';

          if (eventData[id].activeModes[0] === 'mode0') this.baseStation.armed = false;else this.baseStation.armed = true;

          debugEvent('[' + id + '] Mode change event');

          debugEvent('Device ' + id + ' is ' + (!this.baseStation.armed ? 'dis' : '') + 'armed - Cam motion recording is ' + (this.baseStation.armed ? '' : 'not ') + 'active');

          this.emit('mode', {
            id: Object.keys(eventData)[1],
            data: {
              mode: eventData[id].activeModes[0],
              description: description,
              armed: this.baseStation.armed
            }
          });
        }

        // Q Cemera wifi event
        if (eventData.resource === 'wifi/ap') {
          var _ret10 = function () {
            var deviceID = eventData.from;
            debugEvent('[' + deviceID + '] Wifi update event');

            // Get device
            var deviceIndex = _this7.cameras.findIndex(function (d) {
              return d.deviceId === deviceID;
            });
            if (deviceIndex < 0) {
              debugEvent('No device found');
              return {
                v: void 0
              };
            }

            debugEvent('[' + deviceID + '] Update wifi properties');
            _this7.cameras[deviceIndex].wifi = eventData.properties;
            return {
              v: void 0
            };
          }();

          if ((typeof _ret10 === 'undefined' ? 'undefined' : _typeof(_ret10)) === "object") return _ret10.v;
        }

        // Other events
        if (eventData.action === 'is') {
          var subscription = /subscriptions\/(.+)$/;
          var siren = /siren\/(.+)$/;

          // Subscribed event
          if (subscription.test(eventData.resource)) {
            var _ret11 = function () {
              var deviceID = eventData.properties.devices[0];

              if (deviceID === _this7.baseStation.deviceId) {
                _this7.baseStation.isSubscribed = true;
              } else {
                var _deviceIndex = _this7.cameras.findIndex(function (d) {
                  return d.deviceId === deviceID;
                });
                if (_deviceIndex < 0) {
                  debugEvent('No device found');
                  return {
                    v: void 0
                  };
                }
                _this7.cameras[_deviceIndex].isSubscribed = true;
              }
              return {
                v: void 0
              };
            }();

            if ((typeof _ret11 === 'undefined' ? 'undefined' : _typeof(_ret11)) === "object") return _ret11.v;
          }

          // Siren state event
          if (siren.test(eventData.resource)) {
            var _ret12 = function () {
              var deviceID = eventData.resource.substring(6);
              debugEvent('[' + deviceID + '] Update siren properties');

              // Get device
              var deviceIndex = _this7.cameras.findIndex(function (d) {
                return d.deviceId === deviceID;
              });
              if (deviceIndex < 0) {
                debugEvent('No device found');
                return {
                  v: void 0
                };
              }
              _this7.cameras[deviceIndex].siren = eventData.properties;
              _this7.emit(EVENT_SIREN, _this7.cameras[deviceIndex].siren);
              return {
                v: void 0
              };
            }();

            if ((typeof _ret12 === 'undefined' ? 'undefined' : _typeof(_ret12)) === "object") return _ret12.v;
          }

          // Smart hub devices update event
          if (eventData.resource === EVENT_DEVICES) {
            var _ret13 = function () {
              var devices = eventData.devices;

              Object.keys(devices).forEach(function (deviceID) {
                if (deviceID === _this7.baseStation.deviceId) {
                  debugEvent('[' + deviceID + '] Update base station properties');
                  _this7.baseStation.properties = devices[deviceID].properties;
                } else {
                  var _deviceIndex2 = _this7.cameras.findIndex(function (d) {
                    return d.deviceId === deviceID;
                  });
                  if (_deviceIndex2 < 0) {
                    debugEvent('No device found');
                    return false;
                  }
                  debugEvent('[' + deviceID + '] Update camera properties');
                  _this7.cameras[_deviceIndex2].properties = devices[deviceID].properties;

                  // Emit battery event
                  _this7.emit(EVENT_BATTERY, {
                    id: deviceID,
                    data: {
                      batteryLevel: _this7.cameras[_deviceIndex2].properties.batteryLevel,
                      chargingState: _this7.cameras[_deviceIndex2].properties.chargingState,
                      signalStrength: _this7.cameras[_deviceIndex2].properties.signalStrength
                    }
                  });

                  // Emit device updated event
                  _this7.emit(EVENT_DEVICE_UPDATE, {
                    id: deviceID,
                    data: _this7.cameras[_deviceIndex2].properties
                  });
                }
                return true;
              });
              return {
                v: void 0
              };
            }();

            if ((typeof _ret13 === 'undefined' ? 'undefined' : _typeof(_ret13)) === "object") return _ret13.v;
          }

          // Q Camera base station event
          if (eventData.resource === 'basestation') {
            var _ret14 = function () {
              var deviceID = eventData.from;
              debugEvent('[' + deviceID + '] Q base station update event');

              // Get device
              var deviceIndex = _this7.cameras.findIndex(function (d) {
                return d.deviceId === deviceID;
              });
              if (deviceIndex < 0) {
                debugEvent('No device found');
                return {
                  v: void 0
                };
              }

              debugEvent('[' + deviceID + '] Update Q base station properties');
              _this7.cameras[deviceIndex].baseStation = {};
              _this7.cameras[deviceIndex].baseStation.properties = eventData.properties;

              return {
                v: void 0
              };
            }();

            if ((typeof _ret14 === 'undefined' ? 'undefined' : _typeof(_ret14)) === "object") return _ret14.v;
          }

          // Q Camera event
          if (eventData.resource === 'cameras') {
            var _ret15 = function () {
              var deviceID = eventData.from;
              debugEvent('[' + deviceID + '] Q device camera update event');

              if (eventData.properties.length === 0) {
                debugEvent('[' + deviceID + '] Not device properties in payload');
                return {
                  v: void 0
                };
              }

              // Get device
              var deviceIndex = _this7.cameras.findIndex(function (d) {
                return d.deviceId === deviceID;
              });
              if (deviceIndex < 0) {
                debugEvent('No device found');
                return {
                  v: void 0
                };
              }

              debugEvent('[' + deviceID + '] Update Q camera properties');
              _this7.cameras[deviceIndex].properties = eventData.properties;

              // Emit device updated event
              _this7.emit(EVENT_DEVICE_UPDATE, {
                id: deviceID,
                data: _this7.cameras[deviceIndex].properties
              });
            }();

            if ((typeof _ret15 === 'undefined' ? 'undefined' : _typeof(_ret15)) === "object") return _ret15.v;
          }
          return;
        }

        if (eventData.action === EVENT_LOGOUT) {
          debugEvent('Logged out by another session');
          await this._logOut.call(this);

          debugEvent('Wait 5 minutes then log back in');
          (0, _promises.setTimeout)(function () {
            _this7.login.call(_this7);
          }, 5 * 60000);
          return;
        }
        // debugEvent(eventData);
      } catch (e) {
        debugEvent(e);
        this.connected = false;
      }
    }

    /**
     * Subscribe to event stream
     */
    // eslint-disable-next-line class-methods-use-this

  }, {
    key: '_convertMessageToJson',
    value: function _convertMessageToJson(data) {
      var newMessage = void 0;
      try {
        newMessage = '{' + data.replace(/^event: message\s*data/, '"event": "message", "data"') + '}';
        newMessage = newMessage.replace('“', '"');
        newMessage = JSON.parse(newMessage);
        return newMessage;
      } catch (err) {
        // debug('Unable to parse message');
        return err;
      }
    }
  }, {
    key: '_subscribe',
    value: async function _subscribe() {
      var _this8 = this;

      debugEvent('Subscribe to event notifications');

      // Set headers
      this.subscribeHeaders = this.headers;
      this.subscribeHeaders.accept = 'text/event-stream';

      // Set cancel token
      var cancelToken = _axios2.default.CancelToken;
      this.subscribeCancelToken = cancelToken.source();

      await (0, _axios2.default)({
        url: ARLO_URLS.SUBSCRIBE,
        method: 'GET',
        jar: this.cookieJar,
        withCredentials: true,
        responseType: 'stream',
        headers: this.subscribeHeaders,
        cancelToken: this.subscribeCancelToken.token
      }).then(function (response) {
        _this8.headers.accept = 'application/json';
        var partMessage = '';
        response.data.on('data', function (data) {
          try {
            // debug(data.toString());

            partMessage += data.toString();
            var msg = _this8._convertMessageToJson(partMessage);

            // Check for multi-part event message
            if (msg instanceof Error || typeof msg === 'undefined') {
              // debug('Multi-part message');
              return;
            }
            partMessage = ''; // Reset
            _this8.emit(EVENT_MESSAGE, msg);
            _this8._processEventMessage.call(_this8, msg.data);
          } catch (err) {
            debugEvent(err);
          }
        });
        response.data.on('error', async function (err) {
          _this8.connected = false;
          if (err.message.includes('aborted')) {
            debugEvent('End of current event notification stream');
            if (_this8.loggedIn) {
              await _this8._subscribe.call(_this8);
              await _this8._subscribeDevices.call(_this8);
            }
          }
        });
        response.data.on('end', async function () {
          _this8.connected = false;
          debugEvent('End of current event notification stream');
          if (_this8.loggedIn) {
            await _this8._subscribe.call(_this8);
            await _this8._subscribeDevices.call(_this8);
          }
        });
      }).catch(function (err) {
        debugEvent(err);
        _this8.headers.accept = 'application/json';
      });
    }

    /**
     * Get data from url
     */

  }, {
    key: '_get',
    value: async function _get(url) {
      try {
        var options = {
          method: 'GET',
          withCredentials: true,
          url: url,
          headers: this.headers
        };
        var response = await this.axiosClient(options);
        return response.data;
      } catch (err) {
        debugComm(err.message);
        return err;
      }
    }

    /**
     * Post data to url
     */

  }, {
    key: '_post',
    value: async function _post(url, body, headers) {
      var options = {
        withCredentials: true,
        method: 'POST',
        headers: _util2.default._extend(headers || {}, this.headers),
        url: url,
        data: body
      };

      try {
        // const response = await cloudflareScraper(options);
        var response = await this.axiosClient(options);
        return response.data;
      } catch (err) {
        debugComm(err.message);
        return err;
      }
    }

    /**
     * Put data to url
     */

  }, {
    key: '_put',
    value: async function _put(url, body, headers) {
      try {
        var options = {
          method: 'PUT',
          withCredentials: true,
          url: url,
          headers: _util2.default._extend(headers || {}, this.headers),
          data: body
        };
        var response = await this.axiosClient(options);
        return response.data;
      } catch (err) {
        debugComm(err.message);
        return err;
      }
    }

    /**
     * Print the message to console and exit the process
     */
    // eslint-disable-next-line class-methods-use-this

  }, {
    key: '_fatal',
    value: function _fatal() {
      debug('Stopping service due to fatal error');
      process.exit(1);
    }
  }]);

  return Arlo;
}(_events.EventEmitter);

Arlo.EVENT_LOGGED_IN = EVENT_LOGGED_IN;
Arlo.EVENT_GOT_DEVICES = EVENT_GOT_DEVICES;
Arlo.EVENT_DEVICE_UPDATE = EVENT_DEVICE_UPDATE;
Arlo.EVENT_BATTERY = EVENT_BATTERY;
Arlo.EVENT_MEDIA_UPLOAD = EVENT_MEDIA_UPLOAD;
Arlo.EVENT_LOGOUT = EVENT_LOGOUT;
Arlo.EVENT_RATLS = EVENT_RATLS;
Arlo.EVENT_PROPERTIES = EVENT_PROPERTIES;

Arlo.TYPE_ARLOQS = 'arloqs';
Arlo.TYPE_ARLOQ = 'arloq';
Arlo.TYPE_BASESTATION = 'basestation';
Arlo.TYPE_CAMERA = 'camera';

exports.default = Arlo;
