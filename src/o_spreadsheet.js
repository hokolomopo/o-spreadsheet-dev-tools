window.global = window;
console.log("O-Spreadsheet Chrome Dev Tools Loaded");

var s = document.createElement("script");
s.src = chrome.runtime.getURL("src/o_spreadsheet_injected_script.js");
(document.head || document.documentElement).appendChild(s);
s.onload = function () {
    s.remove();
};
