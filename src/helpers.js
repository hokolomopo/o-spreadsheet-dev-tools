function getOwlApp() {
    return window.__OWL_DEVTOOLS__?.apps?.values()?.next()?.value;
}

function waitForSpreadsheetComponent(callback) {
    setTimeout(() => {
        const component = getComponentsByClassName("Spreadsheet")[0];
        component ? callback() : waitForSpreadsheetComponent(callback);
    }, 100);
}

function getComponentsByClassName(className) {
    const app = getOwlApp();
    if (!app) {
        return [];
    }
    const matchingComponents = [];
    const iterateComponentNodes = (component) => {
        const children = component?.children || [];
        for (const child of Object.values(children)) {
            if (child.component.constructor.name === className) {
                matchingComponents.push(child.component);
            } else {
                iterateComponentNodes(child);
            }
        }
    };
    iterateComponentNodes(app.root);
    return matchingComponents;
}
