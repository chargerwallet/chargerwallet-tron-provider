import TronWeb, { UnsignedTransaction, SignedTransaction } from 'tronweb/dist/TronWeb';
import SunWeb from 'sunweb';
import { IInpageProviderConfig } from '@chargerwallet/cross-inpage-provider-core';
import { ProviderTronBase } from './ProviderTronBase';
import { IProviderTron, ProviderEvents, ProviderEventsMap, ConsoleLike, Nodes, Callback, RequestArguments } from './types';
type ChargerWalletTronProviderProps = IInpageProviderConfig & {
    timeout?: number;
};
export declare const CONTRACT_ADDRESS: {
    MAIN: string;
    SIDE: string;
};
export declare const SIDE_CHAIN_ID = "41E209E4DE650F0150788E8EC5CAFA240A23EB8EB7";
export declare const AUTO_REQUEST_ACCOUNTS_ORIGIN_WHITE_LIST: string[];
export declare const TRON_REQUEST_ACCOUNTS_LOCAL_KEY = "chargerwallet_tron_request_accounts_local_key";
export declare const TRON_REQUEST_ACCOUNTS_INTERVAL: number;
declare class ProviderTron extends ProviderTronBase implements IProviderTron {
    readonly isTronLink = true;
    tronWeb: TronWeb | null;
    sunWeb: SunWeb | null;
    ready: boolean;
    private _initialized;
    private _connected;
    private _requestingAccounts;
    private _defaultAddress;
    private _accounts;
    private _nodes;
    private readonly _log;
    constructor(props: ChargerWalletTronProviderProps);
    private _registerTronWeb;
    private _initialize;
    private _registerEvents;
    isAccountsChanged(accounts: string[]): boolean;
    private _handleAccountsChanged;
    private __handleDisconnected;
    private _handleConnected;
    private _postMessage;
    private _dispatch;
    isNetworkChanged(nodes: Nodes): boolean;
    private _handleNodesChanged;
    private _requestAccounts;
    request<T>(args: RequestArguments): Promise<T>;
    sign(transaction: UnsignedTransaction): Promise<SignedTransaction>;
    getNodeInfo(callback: Callback): Promise<unknown>;
}
export { ProviderTron };
export { IProviderTron, ProviderEvents, ProviderEventsMap, ConsoleLike, Nodes, RequestArguments, TronWeb, };
