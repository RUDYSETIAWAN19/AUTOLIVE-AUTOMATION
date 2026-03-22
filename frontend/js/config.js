// Dynamic API URL configuration for GitHub Codespaces
function getApiUrl() {
    const hostname = window.location.hostname;
    
    // For GitHub Codespaces
    if (hostname.includes('app.github.dev')) {
        // Extract the codespace name (remove -3000 suffix)
        const codespaceName = hostname.replace('-3000.app.github.dev', '');
        // Backend runs on port 5001
        return `https://${codespaceName}-5001.app.github.dev`;
    }
    
    // For localhost
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return 'http://localhost:5001';
    }
    
    // For custom domains or IPs
    return `http://${hostname}:5001`;
}

// Export for use in other files
window.API_URL = getApiUrl();
console.log('🔧 API_URL configured:', window.API_URL);
