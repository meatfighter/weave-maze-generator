function copyToClipboard(button) {
    void navigator.clipboard.writeText(button.parentElement.querySelector('pre').innerText.trim());
}

function initButtonListeners() {
    document.querySelectorAll('.copy-btn').forEach(button => button.addEventListener('click',
        () => copyToClipboard(button)));
    document.getElementById('launch-browser-version-button').addEventListener('click',
        () => window.open('spa/index.html', '_self'));
}

function init() {
    initButtonListeners();
}

document.addEventListener("DOMContentLoaded", init);