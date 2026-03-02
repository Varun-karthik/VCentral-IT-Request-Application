sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/m/MessageToast"
], function (Controller, MessageToast) {
  "use strict";

  return Controller.extend("vcentral.controller.manager.managerPage", {

    onInit: function () {
    },

    // Approve timesheet
    onApprove: function (oEvent) {
      const oContext = oEvent.getSource().getBindingContext("PendingModel");
      const oData = oContext.getObject();
      const sPath = oContext.getPath();

      oData.status = "Approved";

      const oHistoryModel = this.getOwnerComponent().getModel("HistoryModel");
      const aHistory = oHistoryModel.getProperty("/historyTimesheets") || [];
      aHistory.push(oData);
      oHistoryModel.setProperty("/historyTimesheets", aHistory);
localStorage.setItem("HistoryModel", JSON.stringify(oHistoryModel.getData()));
      const oPendingModel = oContext.getModel();
      const aPending = oPendingModel.getProperty("/pendingTimesheets");
      const iIndex = parseInt(sPath.split("/")[2], 10);
      aPending.splice(iIndex, 1);
      oPendingModel.setProperty("/pendingTimesheets", aPending);
localStorage.setItem("PendingModel", JSON.stringify(oPendingModel.getData()));
      MessageToast.show("Timesheet approved for " + oData.name);
    },

    // Reject timesheet
    onReject: function (oEvent) {
      const oContext = oEvent.getSource().getBindingContext("PendingModel");
      const oData = oContext.getObject();
      const sPath = oContext.getPath();

      oData.status = "Rejected";

      const oHistoryModel = this.getOwnerComponent().getModel("HistoryModel");
      const aHistory = oHistoryModel.getProperty("/historyTimesheets") || [];
      aHistory.push(oData);
      oHistoryModel.setProperty("/historyTimesheets", aHistory);
localStorage.setItem("HistoryModel", JSON.stringify(oHistoryModel.getData()));

      const oPendingModel = oContext.getModel();
      const aPending = oPendingModel.getProperty("/pendingTimesheets");
      const iIndex = parseInt(sPath.split("/")[2], 10);
      aPending.splice(iIndex, 1);
      oPendingModel.setProperty("/pendingTimesheets", aPending);
localStorage.setItem("PendingModel", JSON.stringify(oPendingModel.getData()));
      MessageToast.show("Timesheet rejected for " + oData.name);
    },

    // Approve leave
onApproveLeave: function (oEvent) {
  const oContext = oEvent.getSource().getBindingContext("PendingModel");
  const oData = oContext.getObject()
  oData.status = "Approved";

  // Push into historyLeaves
  const oHistoryModel = this.getOwnerComponent().getModel("HistoryModel");
  const aHistory = oHistoryModel.getProperty("/historyLeaves") || [];
  aHistory.push(oData);
  oHistoryModel.setProperty("/historyLeaves", aHistory);

  // Remove from pendingLeaves
  const oPendingModel = oContext.getModel();
  let aPending = oPendingModel.getProperty("/pendingLeaves") || [];
  aPending = aPending.filter(l => !(l.employeeId === oData.employeeId && l.startDate === oData.startDate));
  oPendingModel.setProperty("/pendingLeaves", aPending);
  oPendingModel.refresh(true);

  MessageToast.show("Leave approved for " + oData.name);
},

onRejectLeave: function (oEvent) {
  const oContext = oEvent.getSource().getBindingContext("PendingModel");
  const oData = oContext.getObject();
 oData.status = "Rejected";

  const oHistoryModel = this.getOwnerComponent().getModel("HistoryModel");
  const aHistory = oHistoryModel.getProperty("/historyLeaves") || [];
  aHistory.push(oData);
  oHistoryModel.setProperty("/historyLeaves", aHistory);

  const oPendingModel = oContext.getModel();
  let aPending = oPendingModel.getProperty("/pendingLeaves") || [];
  aPending = aPending.filter(l => !(l.employeeId === oData.employeeId && l.startDate === oData.startDate));
  oPendingModel.setProperty("/pendingLeaves", aPending);
  oPendingModel.refresh(true);

  MessageToast.show("Leave rejected for " + oData.name);
}
,
onLeaveSelect: function(oEvent) {
  this.byId("detailLeave").setVisible(true)
  const oContext = oEvent.getParameter("listItem").getBindingContext("PendingModel");
  if (!oContext) {
    console.error("No binding context found");
    return;
  }

  // Set the binding context of the detail page directly to the selected item
  const oDetailPage = this.byId("detailLeave");
  oDetailPage.setBindingContext(oContext, "PendingModel");

  // Navigate to detail page
  this.byId("leaveSplitApp").toDetail(oDetailPage);
},

onPressDetailBack: function() {
  this.byId("leaveSplitApp").backDetail();
}




    // Reject leave without Quota
//     onRejectLeave: function (oEvent) {
//       const oContext = oEvent.getSource().getBindingContext("PendingModel");
//       const oData = oContext.getObject();
//       const sPath = oContext.getPath();

//       oData.status = "Rejected";

//       const oHistoryModel = this.getOwnerComponent().getModel("HistoryModel");
//       const aHistory = oHistoryModel.getProperty("/historyLeaves") || [];
//       aHistory.push(oData);
//       oHistoryModel.setProperty("/historyLeaves", aHistory);
// localStorage.setItem("HistoryModel", JSON.stringify(oHistoryModel.getData()));

//       const oPendingModel = oContext.getModel();
//       const aPending = oPendingModel.getProperty("/pendingLeaves");
//       const iIndex = parseInt(sPath.split("/")[2], 10);
//       aPending.splice(iIndex, 1);
//       oPendingModel.setProperty("/pendingLeaves", aPending);
// localStorage.setItem("PendingModel", JSON.stringify(oPendingModel.getData()));

//       MessageToast.show("Leave rejected for " + oData.name);
//     }

  });
});




// sap.ui.define([
//   "sap/ui/core/mvc/Controller",
//   "sap/m/MessageToast"
// ], function(Controller, MessageToast) {
//   "use strict";

//   return Controller.extend("vcentral.controller.manager.managerPage", {

//     onInit: function() {
//       // Load PendingModel from localStorage if available
//     //   const oPendingModel = this.getView().getModel("PendingModel");
//     //   const savedPending = localStorage.getItem("PendingModel");
//     //   if (savedPending) {
//     //     oPendingModel.setData(JSON.parse(savedPending));
//     //   }

//     //   // Load HistoryModel from localStorage if available
//     //   const oHistoryModel = this.getView().getModel("HistoryModel");
//     //   const savedHistory = localStorage.getItem("HistoryModel");
//     //   if (savedHistory) {
//     //     oHistoryModel.setData(JSON.parse(savedHistory));
//     //   }
//     },

//     onApprove: function(oEvent) {
//   const oContext = oEvent.getSource().getBindingContext("PendingModel");
//   const oPendingModel = oContext.getModel();
//   const oTimesheet = oPendingModel.getProperty(oContext.getPath());

//   oTimesheet.status = "Approved";

//   const oHistoryModel = this.getOwnerComponent().getModel("HistoryModel");
//   const aHistory = oHistoryModel.getProperty("/historyTimesheets") || [];
//   aHistory.push(oTimesheet);
//   oHistoryModel.setProperty("/historyTimesheets", aHistory);
//   localStorage.setItem("HistoryModel", JSON.stringify(oHistoryModel.getData()));

//   // Remove from Pending
//   const aPending = oPendingModel.getProperty("/pendingTimesheets");
//   const iIndex = parseInt(oContext.getPath().split("/").pop(), 10);
//   aPending.splice(iIndex, 1);
//   oPendingModel.setProperty("/pendingTimesheets", aPending);
//   localStorage.setItem("PendingModel", JSON.stringify(oPendingModel.getData()));

//   sap.m.MessageToast.show("Timesheet approved");
// }
// ,

//     onReject: function(oEvent) {
//       const oButton = oEvent.getSource();
//       const oRow = oButton.getParent().getParent();
//       const oContext = oRow.getBindingContext("PendingModel");

//       if (!oContext) {
//         console.error("No binding context found for Reject button");
//         return;
//       }

//       const oPendingModel = oContext.getModel();
//       const oTimesheet = oPendingModel.getProperty(oContext.getPath());

//       // Update status
//       oTimesheet.status = "Rejected";

//       // Move to HistoryModel
//       const oHistoryModel = this.getView().getModel("HistoryModel");
//       const aHistory = oHistoryModel.getProperty("/historyTimesheets") || [];
//       aHistory.push(oTimesheet);
//       oHistoryModel.setProperty("/historyTimesheets", aHistory);
//       localStorage.setItem("HistoryModel", JSON.stringify(oHistoryModel.getData()));

//       // Remove from PendingModel
//       const aPending = oPendingModel.getProperty("/pendingTimesheets");
//       const iIndex = parseInt(oContext.getPath().split("/").pop(), 10);
//       aPending.splice(iIndex, 1);
//       oPendingModel.setProperty("/pendingTimesheets", aPending);
//       localStorage.setItem("PendingModel", JSON.stringify(oPendingModel.getData()));

//       MessageToast.show("Timesheet rejected");
//     },
//     onApproveLeave: function (oEvent) {
//       const oContext = oEvent.getSource().getBindingContext("PendingModel");
//       const oData = oContext.getObject();

//       oContext.getModel().setProperty(oContext.getPath() + "/status", "Approved");

//       const oHistoryModel = this.getOwnerComponent().getModel("HistoryModel");
//       const aHistory = oHistoryModel.getProperty("/historyLeaves") || [];
//       aHistory.push(oData);
//       oHistoryModel.setProperty("/historyLeaves", aHistory);

//       MessageToast.show("Leave approved for " + oData.name);
//     },

//     onRejectLeave: function (oEvent) {
//       const oContext = oEvent.getSource().getBindingContext("PendingModel");
//       const oData = oContext.getObject();

//       oContext.getModel().setProperty(oContext.getPath() + "/status", "Rejected");

//       const oHistoryModel = this.getOwnerComponent().getModel("HistoryModel");
//       const aHistory = oHistoryModel.getProperty("/historyLeaves") || [];
//       aHistory.push(oData);
//       oHistoryModel.setProperty("/historyLeaves", aHistory);

//       MessageToast.show("Leave rejected for " + oData.name);
//     },
//     onTabSelect: function (oEvent) {
//       const sKey = oEvent.getParameter("key");
//       this.getView().getModel("view").setProperty("/selectedTab", sKey);
//     },

//   });
// });
