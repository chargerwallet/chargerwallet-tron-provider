"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isWalletEventMethodMatch = void 0;
function isWalletEventMethodMatch(method, name) {
    return method === `wallet_events_${name}`;
}
exports.isWalletEventMethodMatch = isWalletEventMethodMatch;
