class MsIdentity {

    options = {
        mode: "redirect",
        msal: {
            auth: {
                clientId: "<clientid>",
                authority: "<authority>",
                redirectUri: document.URL.split("#")[0],
            },
            cache: {
                cacheLocation: "sessionStorage", // This configures where your cache will be stored
                storeAuthStateInCookie: false, // Set this to "true" if you are having issues on IE11 or Edge
            },
            system: {
                loggerOptions: {
                    loggerCallback: (level, message, containsPii) => {
                        if (containsPii) {
                            return;
                        }
                        switch (level) {
                            case msal.LogLevel.Error:
                                console.error(message);
                                return;
                            case msal.LogLevel.Info:
                                console.info(message);
                                return;
                            case msal.LogLevel.Verbose:
                                console.debug(message);
                                return;
                            case msal.LogLevel.Warning:
                                console.warn(message);
                                return;
                        }
                    }
                }
            },
            loginRequest: {
                scopes: ["User.Read"]
            },

            tokenRequest: {
                scopes: ["User.Read", "Mail.Read"],
                forceRefresh: false // Set this to "true" to skip a cached token and go to the server to get a new token
            }
        }
    }

    constructor(options, callback) {
        var self = this;
        options = options || {};
        self.options = { ...this.options, ...options };
        self.callback = callback;

        self.require("https://alcdn.msauth.net/browser/2.7.0/js/msal-browser.js", e => {
            console.log("msal-browser.js loaded");
            self.init();
        });
    }


    require(src, c) {
        var d = document;
        d.querySelectorAll("head")
        let elm = d.createElement('script');
        elm.src = src
        d.head.appendChild(elm);
        elm.onload = c;
    }


    init() {
        var self = this;

        self.myMSALObj = new msal.PublicClientApplication(self.options.msal);

        if (self.options.mode !== "popup") {
            self.myMSALObj.handleRedirectPromise()
                .then(r => { self.handleResponse(r) })
                .catch((error) => {
                    console.error(error);
                });
        }

        self.getAccount();

    }

    signIn() {
        var self = this;
        const account = self.getAccount();
        if (!account) {

            if (self.options.mode === "popup") {
                self.myMSALObj.loginPopup(self.options.msal.loginRequest)
                    .then(response => {
                        if (response !== null) {
                            self.account = response.account;
                            self.signedIn();
                        }
                    })
                    .catch(error => {
                        console.error(error);
                    });
            }
            else {
                self.myMSALObj.loginRedirect(self.options.msal.loginRequest);
            }
        }
    }

    signedIn() {
        var self = this;
        self.callback.signedIn({
            account: self.account,
            mode: self.options.mode
        });
    }

    signOut() {
        var self = this;
        if (self.account) {
            self.myMSALObj.logout({
                account: self.myMSALObj.getAccountByUsername(self.account.username)
            });
        }
    }

    getAccount() {
        var self = this;
        const currentAccounts = self.myMSALObj.getAllAccounts();
        if (currentAccounts.length === 0) {
            return null;
        } else if (currentAccounts.length > 1) {
            throw "Multiple accounts detected.";

        } else if (currentAccounts.length === 1) {
            self.account = currentAccounts[0];
            self.signedIn();
        }
    }


    handleResponse(response) {
        var self = this;

        if (response !== null) {
            self.account = response.account;
            self.signedIn();
        }
    }

}

export default MsIdentity;