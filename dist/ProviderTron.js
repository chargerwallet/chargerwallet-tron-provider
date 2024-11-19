var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import dequal from 'fast-deep-equal';
import TronWeb from 'tronweb/dist/TronWeb';
import SunWeb from 'sunweb';
import { isEmpty } from 'lodash';
import { checkWalletSwitchEnable, defineWindowProperty, } from '@chargerwallet/cross-inpage-provider-core';
import { getOrCreateExtInjectedJsBridge } from '@chargerwallet/extension-bridge-injected';
import { web3Errors } from '@chargerwallet/cross-inpage-provider-errors';
import { ProviderTronBase } from './ProviderTronBase';
import { ProviderEvents, } from './types';
import { isWalletEventMethodMatch } from './utils';
import BigNumber from 'bignumber.js';
export const CONTRACT_ADDRESS = {
    MAIN: 'TL9q7aDAHYbW5KdPCwk8oJR3bCDhRwegFf',
    SIDE: 'TGKotco6YoULzbYisTBuP6DWXDjEgJSpYz',
};
export const SIDE_CHAIN_ID = '41E209E4DE650F0150788E8EC5CAFA240A23EB8EB7';
export const AUTO_REQUEST_ACCOUNTS_ORIGIN_WHITE_LIST = [
    'https://tronscan.org',
    'https://tronscan.io',
];
export const TRON_REQUEST_ACCOUNTS_LOCAL_KEY = 'chargerwallet_tron_request_accounts_local_key';
export const TRON_REQUEST_ACCOUNTS_INTERVAL = 10 * 60 * 1000; // ten minutes
const globalWindow = typeof window !== 'undefined' ? window : global;
class ChargerWalletTronWeb extends TronWeb {
    constructor(props, provider) {
        super(props);
        this.provider = provider;
        this.defaultAddress = {
            hex: false,
            base58: false,
        };
        this.trx.sign = (transaction) => provider.sign(transaction);
        this.trx.getNodeInfo = (callback) => provider.getNodeInfo(callback);
    }
    request(args) {
        return this.provider.request(args);
    }
}
class ProviderTron extends ProviderTronBase {
    constructor(props) {
        var _a;
        super(Object.assign(Object.assign({}, props), { bridge: props.bridge || getOrCreateExtInjectedJsBridge({ timeout: props.timeout }) }));
        this.isTronLink = true;
        this.tronWeb = null;
        this.sunWeb = null;
        this.ready = false;
        this._initialized = false;
        this._connected = false;
        this._requestingAccounts = false;
        this._defaultAddress = {
            hex: false,
            base58: false,
        };
        this._accounts = [];
        this._nodes = {
            fullHost: '',
            fullNode: '',
            solidityNode: '',
            eventServer: '',
        };
        this._log = (_a = props.logger) !== null && _a !== void 0 ? _a : window.console;
        if (checkWalletSwitchEnable()) {
            this._registerEvents();
            void this._initialize();
        }
    }
    _registerTronWeb(nodes) {
        if (isEmpty(nodes))
            return null;
        const tronWeb = new ChargerWalletTronWeb(Object.assign({}, nodes), this);
        const tronWeb1 = new ChargerWalletTronWeb(Object.assign({}, nodes), this);
        const tronWeb2 = new ChargerWalletTronWeb(Object.assign({}, nodes), this);
        const sunWeb = new SunWeb(tronWeb1, tronWeb2, CONTRACT_ADDRESS.MAIN, CONTRACT_ADDRESS.SIDE, SIDE_CHAIN_ID);
        return { tronWeb, sunWeb };
    }
    _initialize() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { accounts, nodes } = yield this.request({
                    method: 'tron_getProviderState',
                });
                const resp = this._registerTronWeb(nodes);
                if (!resp)
                    return;
                const { sunWeb, tronWeb } = resp;
                if (window.tronWeb !== undefined) {
                    this._log.warn('ChargerWallet: TronWeb is already initiated. Chargerwallet will overwrite the current instance');
                }
                if (window.sunWeb !== undefined) {
                    this._log.warn('ChargerWallet: TronWeb is already initiated. Chargerwallet will overwrite the current instance');
                }
                this.tronWeb = tronWeb;
                this.sunWeb = sunWeb;
                defineWindowProperty('tronWeb', tronWeb);
                defineWindowProperty('sunWeb', sunWeb);
                // eslint-disable-next-line @typescript-eslint/no-this-alias
                const self = this;
                Object.defineProperty(tronWeb, 'defaultAddress', {
                    get() {
                        var _a;
                        if (!self._connected) {
                            self._log.warn('ChargerWallet: We recommend that DApp developers use $chargerwallet.tron.request({method: "tron_requestAccounts"}) to request users’ account information at the earliest time possible in order to get a complete TronWeb injection.');
                            const origin = ((_a = globalWindow === null || globalWindow === void 0 ? void 0 : globalWindow.location) === null || _a === void 0 ? void 0 : _a.origin) || '';
                            if (origin && AUTO_REQUEST_ACCOUNTS_ORIGIN_WHITE_LIST.includes(origin)) {
                                const requestAccountsLocalStr = localStorage.getItem(TRON_REQUEST_ACCOUNTS_LOCAL_KEY);
                                const requestAccountsLocal = requestAccountsLocalStr
                                    ? JSON.parse(requestAccountsLocalStr)
                                    : null;
                                if (requestAccountsLocal && requestAccountsLocal[origin]) {
                                    const requestTimeStamp = requestAccountsLocal[origin];
                                    if (new BigNumber(Date.now())
                                        .minus(requestTimeStamp)
                                        .isGreaterThan(TRON_REQUEST_ACCOUNTS_INTERVAL)) {
                                        localStorage.setItem(TRON_REQUEST_ACCOUNTS_LOCAL_KEY, JSON.stringify(Object.assign(Object.assign({}, requestAccountsLocal), { [origin]: Date.now() })));
                                        void self.request({
                                            method: 'tron_requestAccounts',
                                        });
                                    }
                                }
                                else {
                                    localStorage.setItem(TRON_REQUEST_ACCOUNTS_LOCAL_KEY, JSON.stringify(Object.assign(Object.assign({}, requestAccountsLocal), { [origin]: Date.now() })));
                                    void self.request({
                                        method: 'tron_requestAccounts',
                                    });
                                }
                            }
                        }
                        return self._defaultAddress;
                    },
                    set(value) {
                        self._defaultAddress = value;
                    },
                });
                this._handleAccountsChanged(accounts);
                this._dispatch('tronLink#initialized');
                this._initialized = true;
            }
            catch (error) {
                this._log.error('ChargerWallet: Failed to get initial state. Please report this bug.', error);
            }
        });
    }
    _registerEvents() {
        window.addEventListener('chargerwallet_bridge_disconnect', () => {
            this.__handleDisconnected();
        });
        this.on(ProviderEvents.MESSAGE_LOW_LEVEL, (payload) => {
            const { method } = payload;
            if (isWalletEventMethodMatch(method, ProviderEvents.ACCOUNTS_CHANGED)) {
                this._handleAccountsChanged(payload.params);
            }
            if (isWalletEventMethodMatch(method, ProviderEvents.NODES_CHANGED)) {
                if (this._initialized) {
                    this._handleNodesChanged(payload.params);
                }
                else {
                    void this._initialize();
                }
            }
        });
    }
    isAccountsChanged(accounts) {
        return !dequal(this._accounts, accounts);
    }
    _handleAccountsChanged(accounts) {
        let _accounts = accounts;
        if (!Array.isArray(accounts)) {
            this._log.error('Chargerwallet: Received invalid accounts parameter. Please report this bug.', accounts);
            _accounts = [];
        }
        for (const account of _accounts) {
            if (typeof account !== 'string') {
                this._log.error('Chargerwallet: Received non-string account. Please report this bug.', accounts);
                _accounts = [];
                break;
            }
        }
        if (this.isAccountsChanged(_accounts)) {
            this._accounts = _accounts;
            const address = _accounts[0];
            const tronWeb = this.tronWeb;
            if (!tronWeb) {
                return;
            }
            if (tronWeb.isAddress(address)) {
                tronWeb.setAddress(address);
                tronWeb.ready = true;
                this.ready = true;
                this._handleConnected();
            }
            else {
                tronWeb.defaultAddress = {
                    hex: false,
                    base58: false,
                };
                tronWeb.ready = false;
                this.ready = false;
                this.__handleDisconnected();
            }
            if (this._initialized) {
                this._postMessage(ProviderEvents.SET_ACCOUNT, {
                    address,
                });
                this._postMessage(ProviderEvents.ACCOUNTS_CHANGED, {
                    address,
                });
            }
        }
    }
    __handleDisconnected() {
        if (this._connected) {
            this._connected = false;
            this._postMessage(ProviderEvents.DISCONNECT);
        }
    }
    _handleConnected() {
        if (!this._connected) {
            this._connected = true;
            this._postMessage(ProviderEvents.CONNECT);
            this._postMessage(ProviderEvents.ACCEPT_WEB);
        }
    }
    _postMessage(action, data) {
        window.postMessage({
            message: {
                action,
                data,
            },
            isTronLink: true,
        });
    }
    _dispatch(event) {
        window.dispatchEvent(new Event(event));
    }
    isNetworkChanged(nodes) {
        return !dequal(nodes, this._nodes);
    }
    _handleNodesChanged({ nodes, chainId }) {
        var _a, _b, _c, _d, _e, _f;
        if (isEmpty(nodes))
            return;
        if (this.isNetworkChanged(nodes)) {
            this._nodes = nodes;
            (_a = this.tronWeb) === null || _a === void 0 ? void 0 : _a.setFullNode((_b = nodes.fullNode) !== null && _b !== void 0 ? _b : nodes.fullHost);
            (_c = this.tronWeb) === null || _c === void 0 ? void 0 : _c.setSolidityNode((_d = nodes.comlidityNode) !== null && _d !== void 0 ? _d : nodes.fullHost);
            (_e = this.tronWeb) === null || _e === void 0 ? void 0 : _e.setEventServer((_f = nodes.eventServer) !== null && _f !== void 0 ? _f : nodes.fullHost);
            this._postMessage(ProviderEvents.NODES_CHANGED, Object.assign({}, nodes));
            this._postMessage(ProviderEvents.SET_NODE, Object.assign(Object.assign({}, nodes), { node: {
                    chainId,
                    chain: '_',
                } }));
        }
    }
    _requestAccounts(args) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this._requestingAccounts) {
                return {
                    code: 4001,
                    message: 'in the request queue',
                };
            }
            this._requestingAccounts = true;
            try {
                const accounts = (yield this.bridgeRequest(args));
                this._handleAccountsChanged(accounts);
                this._requestingAccounts = false;
                if (accounts.length > 0) {
                    return {
                        code: 200,
                        message: 'ok',
                    };
                }
                return {
                    code: 4000,
                    message: 'user rejected',
                };
            }
            catch (e) {
                this._requestingAccounts = false;
                return {
                    code: 4000,
                    message: 'user rejected',
                };
            }
        });
    }
    request(args) {
        return __awaiter(this, void 0, void 0, function* () {
            const { method, params } = args;
            if (!method || typeof method !== 'string' || method.length === 0) {
                throw web3Errors.rpc.methodNotFound();
            }
            if (params !== undefined &&
                !Array.isArray(params) &&
                (typeof params !== 'object' || params === null)) {
                throw web3Errors.rpc.invalidParams();
            }
            if (method === 'tron_requestAccounts') {
                const result = yield this._requestAccounts(args);
                this._postMessage(ProviderEvents.TAB_REPLY, result);
                return result;
            }
            const resp = yield this.bridgeRequest(args);
            return resp;
        });
    }
    sign(transaction) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.request({
                method: 'tron_signTransaction',
                params: transaction,
            });
        });
    }
    getNodeInfo(callback) {
        return __awaiter(this, void 0, void 0, function* () {
            const info = yield this.request({
                method: 'tron_getNodeInfo',
            });
            if (!callback)
                return info;
            callback(null, info);
        });
    }
}
export { ProviderTron };
export { ProviderEvents, TronWeb, };
