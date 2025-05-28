function getOwlApp() {
    return window.__OWL_DEVTOOLS__?.apps?.values()?.next()?.value;
}

function waitForSpreadsheetComponent(callback) {
    setTimeout(() => {
        const component = getComponentsByClassName("Spreadsheet")[0];
        component ? callback(component.props.model) : waitForSpreadsheetComponent(callback);
    }, 100);
}

function getComponentsByClassName(className) {
    const app = getOwlApp();
    if (!app) {
        return [];
    }
    const matchingComponents = [];
    const iterateComponentNodes = (component) => {
        const children = component.children || [];
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

waitForSpreadsheetComponent((model) => {
    exposeModelInWindows(model);
    addDebugMenuItems();
});

function exposeModelInWindows(model) {
    console.log("Model, Getters, and Dispatch now exposed in window");

    Object.defineProperty(window, "model", {
        get: function () {
            return model;
        },
    });
    Object.defineProperty(window, "getters", {
        get: function () {
            return model.getters;
        },
    });
    Object.defineProperty(window, "dispatch", {
        get: function () {
            return model.dispatch;
        },
    });
    Object.defineProperty(window, "sheetId", {
        get: function () {
            return model.getters.getActiveSheetId();
        },
    });
    Object.defineProperty(window, "sheet", {
        get: function () {
            return model.getters.getActiveSheet();
        },
    });
    Object.defineProperty(window, "figureId", {
        get: function () {
            return model.getters.getSelectedFigureId();
        },
    });
    Object.defineProperty(window, "figure", {
        get: function () {
            return model.getters.getFigure(window.sheetId, window.figureId);
        },
    });
    Object.defineProperty(window, "chart", {
        get: function () {
            return model.getters.getChart(model.getters.getSelectedFigureId()).getDefinition();
        },
    });
    Object.defineProperty(window, "cell", {
        get: function () {
            return model.getters.getActiveCell();
        },
    });
    Object.defineProperty(window, "coreCell", {
        get: function () {
            const sheetId = model.getters.getActiveSheetId();
            const selection = model.getters.getSelectedZone();
            return model.getters.getCell({ sheetId, col: selection.left, row: selection.top });
        },
    });
    Object.defineProperty(window, "cellPosition", {
        get: function () {
            const sheetId = model.getters.getActiveSheetId();
            const selection = model.getters.getSelectedZone();
            return { sheetId, col: selection.left, row: selection.top };
        },
    });
    Object.defineProperty(window, "position", {
        get: function () {
            return window.cellPosition;
        },
    });
    Object.defineProperty(window, "pivotId", {
        get: function () {
            const position = model.getters.getActivePosition();
            return model.getters.getPivotIdFromPosition(position);
        },
    });
    Object.defineProperty(window, "pivot", {
        get: function () {
            const pivotId = window.pivotId;
            return model.getters.getPivot(pivotId);
        },
    });
    Object.defineProperty(window, "corePivot", {
        get: function () {
            return model.getters.getPivotCoreDefinition(window.pivotId);
        },
    });
    Object.defineProperty(window, "target", {
        get: function () {
            return model.getters.getSelectedZones();
        },
    });
}

function addDebugMenuItems() {
    const { topbarMenuRegistry } = o_spreadsheet.registries;

    topbarMenuRegistry.add("debug", {
        name: "Debug",
        sequence: 100,
    });

    topbarMenuRegistry.addChild("display_header", ["debug"], {
        name: () => "Disable composer onBlur",
        isReadonlyAllowed: true,
        execute: () => {
            const composerComponents = getComponentsByClassName("Composer");
            for (const composerComponent of composerComponents) {
                composerComponent.onBlur = () => {};
            }
            if (composerComponents.length > 0) {
                composerComponents[0].constructor.prototype.onBlur = () => {};
            }
        },
    });
}
