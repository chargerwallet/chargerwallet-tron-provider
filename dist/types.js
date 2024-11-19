export var ProviderEvents;
(function (ProviderEvents) {
    ProviderEvents["TAB_REPLY"] = "tabReply";
    ProviderEvents["CONNECT"] = "connect";
    ProviderEvents["DISCONNECT"] = "disconnect";
    ProviderEvents["ACCOUNTS_CHANGED"] = "accountsChanged";
    ProviderEvents["SET_ACCOUNT"] = "setAccount";
    ProviderEvents["SET_NODE"] = "setNode";
    ProviderEvents["NODES_CHANGED"] = "nodesChanged";
    ProviderEvents["MESSAGE"] = "message";
    ProviderEvents["MESSAGE_LOW_LEVEL"] = "message_low_level";
    ProviderEvents["CHAIN_CHANGED"] = "chainChanged";
    ProviderEvents["ACCEPT_WEB"] = "acceptWeb";
})(ProviderEvents || (ProviderEvents = {}));
