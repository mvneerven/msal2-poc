import MsIdentity from '/src/MsIdentity.js';

class MainApp {

    options = {
        mode: "redirect",
        msal: {
            auth: {
                clientId: "676ad256-ec67-4601-8c76-b4f1f330faf1",
                authority: "https://login.microsoftonline.com/common/"
            },
            cache: {
                cacheLocation: "sessionStorage",
                storeAuthStateInCookie: false
            },
            loginRequest: {
                scopes: ["User.Read"]
            },
            tokenRequest: {
                scopes: ["User.Read", "Mail.Read"],
                forceRefresh: false
            }
        }
    };

    constructor(v) {
        let self = this;

        let main = document.querySelector('#main-app');

        main.innerHTML += /*html*/`<p>This demo shows an integration of federated 
            authentication using the Microsoft Identity Platform</p>
            <p>In this case, the MSAL with authorization code flow is used, through the 
            <a target="_blank" href="https://docs.microsoft.com/en-us/azure/active-directory/develop/reference-v2-libraries">msal2 library</a>.</p>`

        // login button
        var loginButton = this.createButton('Sign in');
        main.appendChild(loginButton);

        var logoutButton = this.createButton('Sign out', { disabled: true });
        main.appendChild(logoutButton);


        self.msid = new MsIdentity(this.options, {
            signedIn: e => {
                loginButton.disabled = true;
                logoutButton.disabled = false;
                self.account = e.account;
                logoutButton.innerHTML = 'Sign out ' + self.account.username;
                if (self.account) {
                    loginButton.innerHTML = self.getInitials();
                }
            },
            signedOut: e => {
                logoutButton.disabled = true;
                loginButton.disabled = false;
                self.account = null;
            }
        });

        loginButton.addEventListener("click", e => {
            self.msid.signIn();
        });

        logoutButton.addEventListener("click", e => {
            self.msid.signOut();
        });

    }

    createButton(innerHTML, options) {
        let btn = document.createElement('button');
        btn.classList.add("btn");
        btn.innerHTML += innerHTML;
        if (options) {
            for (var v in options) {
                btn[v] = options[v];
            }
        }
        return btn;
    }

    getInitials() {
        var self = this;
        if (self.account) {
            let s = self.account.name.split(" ");
            let t = s[0].substring(0, 1) + (s.length > 1 ? s[1].substring(0, 1) : "");
            return t.toUpperCase();
        }
        return null;
    }

}

new MainApp("v1");
