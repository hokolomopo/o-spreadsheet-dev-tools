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
    Object.defineProperty(window, "pivotCell", {
        get: function () {
            return window.model.getters.getPivotCellFromPosition(window.cellPosition);
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
}
