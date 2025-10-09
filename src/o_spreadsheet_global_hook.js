const callback = () => {
    exposeModelInWindows();
    addDebugMenuItems();
    addEditActionToDashboards();
}
waitForSpreadsheetComponent(callback);
function setupNavigationListener(callback) {
    window.addEventListener("popstate", callback);
    window.addEventListener("hashchange", callback);
    const originalPushState = history.pushState;
    history.pushState = function (...args) {
        originalPushState.apply(this, args);
        callback();
    };
    const originalReplaceState = history.replaceState;
    history.replaceState = function (...args) {
        originalReplaceState.apply(this, args);
        callback();
    };
}
setupNavigationListener(() => waitForSpreadsheetComponent(callback));

function exposeModelInWindows() {
    const addPropertyToWindow = (name, getter) => {
        Object.defineProperty(window, name, {
            get: getter,
            configurable: true,
        });
    };

    addPropertyToWindow("model", () => getComponentsByClassName("Spreadsheet")[0].props.model);
    addPropertyToWindow("getters", () => window.model.getters);
    addPropertyToWindow("dispatch", () => window.model.dispatch);
    addPropertyToWindow("sheetId", () => window.model.getters.getActiveSheetId());
    addPropertyToWindow("sheet", () => window.model.getters.getActiveSheet());
    addPropertyToWindow("figureId", () => window.model.getters.getSelectedFigureId());
    addPropertyToWindow("figure", () => window.model.getters.getFigure(window.sheetId, window.figureId));
    addPropertyToWindow("chartId", () =>
        window.model.getters.getChartIdFromFigureId
            ? window.model.getters.getChartIdFromFigureId(window.figureId)
            : window.figureId
    );
    addPropertyToWindow("chart", () => window.model.getters
        .getChart(window.chartId)
        .getDefinition());
    addPropertyToWindow("cell", () => window.model.getters.getActiveCell());
    addPropertyToWindow("coreCell", () => {
        const sheetId = window.model.getters.getActiveSheetId();
        const selection = window.model.getters.getSelectedZone();
        return window.model.getters.getCell({
            sheetId,
            col: selection.left,
            row: selection.top,
        });
    });
    addPropertyToWindow("cellPosition", () => {
        const sheetId = window.model.getters.getActiveSheetId();
        const selection = window.model.getters.getSelectedZone();
        return { sheetId, col: selection.left, row: selection.top };
    });
    addPropertyToWindow("position", () => window.cellPosition);
    addPropertyToWindow("pivotId", () => {
        const position = window.model.getters.getActivePosition();
        return window.model.getters.getPivotIdFromPosition(position);
    });
    addPropertyToWindow("pivot", () => {
        const pivotId = window.pivotId;
        return window.model.getters.getPivot(pivotId);
    });
    addPropertyToWindow("pivotCell", () => window.model.getters.getPivotCellFromPosition(window.cellPosition));
    addPropertyToWindow("corePivot", () => window.model.getters.getPivotCoreDefinition(window.pivotId));
    addPropertyToWindow("target", () => window.model.getters.getSelectedZones());
}

function addDebugMenuItems() {
    const { topbarMenuRegistry } = o_spreadsheet.registries;

    if(topbarMenuRegistry.contains("debug")) {
        return;
    }
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

function addEditActionToDashboards() {
    const dashboardEdits = getComponentsByClassName("DashboardEdit");
    for (const dashboardEdit of dashboardEdits) {
        dashboardEdit.isDashboardAdmin = true;
    }
}

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
