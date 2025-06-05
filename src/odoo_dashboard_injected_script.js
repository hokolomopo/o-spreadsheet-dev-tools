
function addEditActionToDashboards() {
    const dashboardEdits = getComponentsByClassName("DashboardEdit");
    for (const dashboardEdit of dashboardEdits) {
        dashboardEdit.isDashboardAdmin = true;
    }
}

waitForSpreadsheetComponent(() => {
    addEditActionToDashboards();
});
