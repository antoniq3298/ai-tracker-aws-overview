function refreshTokens() {
    return new Promise((resolve, reject) => {
        const poolData = {
            UserPoolId: "us-east-1_64xXl0aTJ",
            ClientId: "7q2kt39ik32alt55rkokkgckrl",
        };

        const idToken = localStorage.getItem("idToken");
        const refreshToken = localStorage.getItem("refreshToken");

        const userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
        const tokenClaims = decodeToken(idToken);

        const userData = {
            Username: tokenClaims["cognito:username"] || tokenClaims.email, // FIX: use cognito:username first
            Pool: userPool,
        };

        const cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
        const cognitoRefreshToken = new AmazonCognitoIdentity.CognitoRefreshToken({
            RefreshToken: refreshToken,
        });

        cognitoUser.refreshSession(cognitoRefreshToken, (err, session) => {
            if (err) {
                reject(err);
                return;
            }

            localStorage.setItem("idToken", session.getIdToken().getJwtToken());
            localStorage.setItem("accessToken", session.getAccessToken().getJwtToken());
            localStorage.setItem("refreshToken", session.getRefreshToken().getToken());

            resolve();
        });
    });
}

function decodeToken(idToken) {
    const base64Url = idToken.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
        atob(base64)
            .split("")
            .map(c => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
            .join("")
    );
    return JSON.parse(jsonPayload);
}

function isLoggedIn() {
    return ( // FIX: also require refreshToken
        localStorage.getItem("idToken") !== null &&
        localStorage.getItem("accessToken") !== null &&
        localStorage.getItem("refreshToken") !== null
    );
}

function hasTokenExpired(tokenKey = "accessToken") { // FIX: check accessToken by default
    const token = localStorage.getItem(tokenKey);
    if (!token) return true;

    const tokenClaims = decodeToken(token);
    return tokenClaims.exp * 1000 < Date.now();
}

async function loginGuard() {
    if (!isLoggedIn()) {
        window.location.href = "payment.html";
        return;
    }

    if (hasTokenExpired("accessToken")) { // FIX: check accessToken expiry
        try {
            await refreshTokens();
        } catch (e) {
            localStorage.clear();
            window.location.href = "payment.html";
        }
    }
}

function showToast(message, type = "info", duration = 3000) {
    const toast = document.createElement("div");
    toast.textContent = message;

    toast.style.position = "fixed";
    toast.style.top = "10px";
    toast.style.left = "10px";
    toast.style.padding = "10px 15px";
    toast.style.borderRadius = "5px";
    toast.style.zIndex = 9999;
    toast.style.fontSize = "14px";
    toast.style.fontWeight = "500";
    toast.style.color = "#fff";

    toast.style.backgroundColor =
        type === "error" ? "#fde68a" :
            type === "success" ? "#0070f3" :
                "#0059c9";

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = "0";
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

async function awsFetch(url, options = {}) {
    await loginGuard(); // уверява се, че токенът е валиден

    const applyHeaders = () => { // FIX: helper to re-apply token after refresh
        const accessToken = localStorage.getItem("accessToken");
        const headers = options.headers || {};
        headers["Authorization"] = `Bearer ${accessToken}`;
        headers["Content-Type"] = "application/json";
        options.headers = headers;
    };

    applyHeaders();

    let response = await fetch(url, options);

    if (response.status === 401) { // FIX: refresh + retry once on 401
        try {
            await refreshTokens();
            applyHeaders();
            response = await fetch(url, options);
        } catch (e) {
            localStorage.clear();
            window.location.href = "payment.html";
            return response;
        }
    }

    if (!response.ok) {
        console.error("AWS Fetch Error:", response.status, await response.text());
    }

    return response;
}


