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

waitForSpreadsheetComponent(() => {
    exposeModelInWindows();
    addDebugMenuItems();
});

function exposeModelInWindows() {
    console.log("Model, Getters, and Dispatch now exposed in window");



    Object.defineProperty(window, "model", {
        get: function () {
            return getComponentsByClassName("Spreadsheet")[0].props.model;
        },
    });
    Object.defineProperty(window, "getters", {
        get: function () {
            return window.model.getters;
        },
    });
    Object.defineProperty(window, "dispatch", {
        get: function () {
            return window.model.dispatch;
        },
    });
    Object.defineProperty(window, "sheetId", {
        get: function () {
            return window.model.getters.getActiveSheetId();
        },
    });
    Object.defineProperty(window, "sheet", {
        get: function () {
            return window.model.getters.getActiveSheet();
        },
    });
    Object.defineProperty(window, "figureId", {
        get: function () {
            return window.model.getters.getSelectedFigureId();
        },
    });
    Object.defineProperty(window, "figure", {
        get: function () {
            return window.model.getters.getFigure(window.sheetId, window.figureId);
        },
    });
    Object.defineProperty(window, "chart", {
        get: function () {
            return window.model.getters.getChart(window.model.getters.getSelectedFigureId()).getDefinition();
        },
    });
    Object.defineProperty(window, "cell", {
        get: function () {
            return window.model.getters.getActiveCell();
        },
    });
    Object.defineProperty(window, "coreCell", {
        get: function () {
            const sheetId = window.model.getters.getActiveSheetId();
            const selection = window.model.getters.getSelectedZone();
            return window.model.getters.getCell({ sheetId, col: selection.left, row: selection.top });
        },
    });
    Object.defineProperty(window, "cellPosition", {
        get: function () {
            const sheetId = window.model.getters.getActiveSheetId();
            const selection = window.model.getters.getSelectedZone();
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
            const position = window.model.getters.getActivePosition();
            return window.model.getters.getPivotIdFromPosition(position);
        },
    });
    Object.defineProperty(window, "pivot", {
        get: function () {
            const pivotId = window.pivotId;
            return window.model.getters.getPivot(pivotId);
        },
    });
    Object.defineProperty(window, "corePivot", {
        get: function () {
            return window.model.getters.getPivotCoreDefinition(window.pivotId);
        },
    });
    Object.defineProperty(window, "target", {
        get: function () {
            return window.model.getters.getSelectedZones();
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

    topbarMenuRegistry.addChild("slow_cell_animations", ["debug"], {
        name: () => "Slow cell animations x10",
        isReadonlyAllowed: true,
        execute: () => slowDownCellAnimations(10),
    });

    topbarMenuRegistry.addChild("slow_cell_animations_100", ["debug"], {
        name: () => "Slow cell animations x100",
        isReadonlyAllowed: true,
        execute: () => slowDownCellAnimations(100),
    });
}

function slowDownCellAnimations(factor) {
    const component = getComponentsByClassName("Spreadsheet")[0];
    const env = component.env;
    const gridRendererStore = [...env.__spreadsheet_stores__.dependencies.values()].find(
        (item) => item.constructor.name === "GridRenderer"
    );
    const originalFn = gridRendererStore.updateAnimationsProgress;
    gridRendererStore.updateAnimationsProgress = function (timestamp) {
        const startAnimationTimestamp = [...gridRendererStore.animations.values()]
            .map((a) => a.startTime)
            .find((t) => t !== undefined);
        if (!timestamp || !startAnimationTimestamp) {
            return originalFn.apply(this, [timestamp]);
        }
        // Slow the animation by 20x
        const elapsedTime = timestamp - startAnimationTimestamp;
        const mockTimeStamp = startAnimationTimestamp + elapsedTime / factor;
        return originalFn.apply(this, [mockTimeStamp]);
    };
}
