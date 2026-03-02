sap.ui.define([
    "sap/ui/core/UIComponent",
    "sap/ui/model/json/JSONModel",
    "vcentral/model/models"
], function (UIComponent, JSONModel, models) {
    "use strict";

    return UIComponent.extend("vcentral.Component", {
        metadata: {
            manifest: "json"
        },

        init: function () {
            // Call base init
            UIComponent.prototype.init.apply(this, arguments);

            // Device model
            this.setModel(models.createDeviceModel(), "device");

            // Routing
            this.getRouter().initialize();

            // Load login.json
            const oLoginModel = new JSONModel(sap.ui.require.toUrl("vcentral/model/login.json"));
            this.setModel(oLoginModel, "LoginModel");

            // Restore saved user
            oLoginModel.attachRequestCompleted(() => {
                const savedModel = localStorage.getItem("LoginModel");
                if (savedModel) {
                    oLoginModel.setData(JSON.parse(savedModel));
                }
            });

            
            // TimeSheet Model

        const oTimesheetModel = new JSONModel(sap.ui.require.toUrl("vcentral/model/TimesheetModel.json"));
        this.setModel(oTimesheetModel, "TimesheetModel");
        oTimesheetModel.attachRequestCompleted(()=>{
            const timeModel= localStorage.getItem("TimesheetModel");
            if (timeModel) {
                    oTimesheetModel.setData(JSON.parse(timeModel));
                }
        })
        // Pending Timesheet Model
        const oPendingModel = new JSONModel(sap.ui.require.toUrl("vcentral/model/PendingModel.json"));
        this.setModel(oPendingModel, "PendingModel");
        oPendingModel.attachRequestCompleted(()=>{
            const pendingModel= localStorage.getItem("PendingModel");
            if (pendingModel) {
                    oPendingModel.setData(JSON.parse(pendingModel));
                }
        })
        // History Timesheet Model
        const oHistoryModel = new JSONModel(sap.ui.require.toUrl("vcentral/model/HistoryModel.json"));
        this.setModel(oHistoryModel, "HistoryModel");
        oHistoryModel.attachRequestCompleted(()=>{
            const historyModel= localStorage.getItem("HistoryModel");
            if (historyModel) {
                    oHistoryModel.setData(JSON.parse(historyModel));
                }
        })

        //Leaves model 
        const oLeavesModel= new JSONModel(sap.ui.require.toUrl("vcentral/model/leaves.json"))
        this.setModel(oLeavesModel,"holidays");
        
        const oDraftModel = new JSONModel(sap.ui.require.toUrl("vcentral/model/draftModel.json"));
         this.setModel(oDraftModel, "DraftModel");  
         const savedDraft = localStorage.getItem("DraftModel"); 
         if (savedDraft) {
             const oDraft = JSON.parse(savedDraft); // Convert ISO strings back to Date objects 
             if (oDraft.startDate) oDraft.startDate = new Date(oDraft.startDate); if (oDraft.endDate) oDraft.endDate = new Date(oDraft.endDate); oDraftModel.setData(oDraft); }
        }
    });
});