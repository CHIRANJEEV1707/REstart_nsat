// Cookie Clear Instructions
// Run this in your browser console on localhost:3000

// Clear all cookies for localhost
document.cookie.split(";").forEach((c) => {
    document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
});

console.log("✅ Cookies cleared! Now log in again to get new cookies with correct sameSite setting.");
