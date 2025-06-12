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

injectFile("src/o_spreadsheet_global_hook.js");
