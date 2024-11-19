export function isWalletEventMethodMatch(method, name) {
    return method === `wallet_events_${name}`;
}
