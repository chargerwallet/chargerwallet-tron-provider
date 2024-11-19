"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProviderTronBase = void 0;
const cross_inpage_provider_types_1 = require("@chargerwallet/cross-inpage-provider-types");
const cross_inpage_provider_core_1 = require("@chargerwallet/cross-inpage-provider-core");
class ProviderTronBase extends cross_inpage_provider_core_1.ProviderBase {
    constructor(props) {
        super(props);
        this.providerName = cross_inpage_provider_types_1.IInjectedProviderNames.tron;
    }
    request(data) {
        return this.bridgeRequest(data);
    }
}
exports.ProviderTronBase = ProviderTronBase;
