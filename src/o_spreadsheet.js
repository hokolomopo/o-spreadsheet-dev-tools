window.global = window;
console.log("O-Spreadsheet Chrome Dev Tools Loaded");


function injectFile(filePath) {
    const script = document.createElement("script");
    script.src = chrome.runtime.getURL(filePath);
    script.onload = function () {
        this.remove();
    };
    (document.head || document.documentElement).appendChild(script);
}

injectFile("src/helpers.js");
injectFile("src/o_spreadsheet_injected_script.js");
injectFile("src/odoo_dashboard_injected_script.js");
