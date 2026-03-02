sap.ui.define([
  "sap/ui/core/mvc/Controller"
], (Controller) => {
  "use strict";

  return Controller.extend("vcentral.controller.users.userPage", {
      onInit() {
        this.getOwnerComponent().getRouter().getRoute("UserHome").attachPatternMatched(this._onRouteMatched, this);
      },
      _onRouteMatched: function() {
    var oLoginModel = this.getOwnerComponent().getModel("LoginModel");
    if (!oLoginModel) {
        console.warn("LoginModel not yet available");
        return;
    }
    var oUser = oLoginModel.getProperty("/currentUser");
    console.log(oUser);
    if (!oUser || !oUser.employeeId) { 
      this.getOwnerComponent().getRouter().navTo("RouteView1"); 
    }
    
    const oTimesheetModel = this.getOwnerComponent().getModel("TimesheetModel");

  const userId = oLoginModel.getProperty("/currentUser/employeeId");
  const aTimesheets = oTimesheetModel.getProperty("/timesheets") || [];

  // Find the logged-in user's timesheet
  const current = aTimesheets.find(ts => ts.employeeId.startsWith(userId));
  oTimesheetModel.setProperty("/currentTimesheet", current || {});
},
      onCollapseExpandPress() {
			const oSideNavigation = this.byId("sideNavigation"),
				bExpanded = oSideNavigation.getExpanded();

			oSideNavigation.setExpanded(!bExpanded);
		},
       onItemSelect: function (oEvent) {
    var sKey = oEvent.getParameter("item").getKey();

    // Hide all sections
    this.byId("homeSection").setVisible(false);
    this.byId("timesheetSection").setVisible(false);
    this.byId("profileSection").setVisible(false);
    this.byId("helpdeskSection").setVisible(false);
// var sKey = oEvent.getParameter("item").getKey();
            console.log("sKey: "+sKey)
    // Show selected section
    switch (sKey) {
        case "home":
            this.byId("homeSection").setVisible(true);
            this.byId("collapseBtn").setText("Home Section");
            
            break;
        case "timesheet":
            this.getOwnerComponent().getRouter().navTo("Timesheet");
            break;
        case "submitTS":
            this.byId("timesheetSection").setVisible(true);
            this.byId("collapseBtn").setText("Time Sheets");
            break;
        case "profile":
            this.byId("profileSection").setVisible(true);
            this.byId("collapseBtn").setText("My Profile");
            break;
        case "helpdesk":
            this.byId("helpdeskSection").setVisible(true);
            this.byId("collapseBtn").setText("HelpDesk");
            break;
    }
},
onCardSelectionChange: function (oEvent) {
    const selectedKeys = oEvent.getSource().getSelectedKeys();

    // Toggle visibility based on selection
    this.byId("MyprofileCard").setVisible(selectedKeys.includes("profile"));
    this.byId("todoCard").setVisible(selectedKeys.includes("todo"));
    this.byId("timesheetCard").setVisible(selectedKeys.includes("timesheet"));
    this.byId("skillsCard").setVisible(selectedKeys.includes("skills"));
    this.byId("allocationCard").setVisible(selectedKeys.includes("allocation"));
},
logout:function(){
  this.getView().getModel("LoginModel").setProperty("/currentUser", {})
  this.getOwnerComponent().getRouter().navTo("RouteView1")
},

onEditPress: function () {
    // make inputs editable
    this.byId("empid").setEditable(true);
    this.byId("name").setEditable(true);
    this.byId("email").setEditable(true);
},

onSave: function () {
    var oModel = this.getView().getModel("LoginModel");
    var oData = oModel.getData();

    // update model with current input values
    oModel.setProperty("/currentUser/employeeId", this.byId("empid").getValue());
    oModel.setProperty("/currentUser/name", this.byId("name").getValue());
    oModel.setProperty("/currentUser/email", this.byId("email").getValue());

    // persist to local storage
    localStorage.setItem("LoginModel", JSON.stringify(oData));
    console.log(oData)

    // lock inputs again
    this.byId("empid").setEditable(false);
    this.byId("name").setEditable(false);
    this.byId("email").setEditable(false);
    },

    onHoursChange: function(oEvent) {
      console.log("onHoursChange")
      const oInput = oEvent.getSource();
      console.log("oInput :"+oInput)
      const oContext = oInput.getBindingContext("TimesheetModel");
      console.log("oContext :"+oContext)
      const oModel = oContext.getModel();
      console.log("oModel :"+oModel)
      const oPath = oContext.getPath();
      console.log("oPath :"+oPath)
      const oHours = oModel.getProperty(oPath + "/hours");
      console.log("oHours :"+oHours)
      const total =
        (parseFloat(oHours.monday) || 0) +
        (parseFloat(oHours.tuesday) || 0) +
        (parseFloat(oHours.wednesday) || 0) +
        (parseFloat(oHours.thursday) || 0) +
        (parseFloat(oHours.friday) || 0) +
        (parseFloat(oHours.saturday) || 0) +
        (parseFloat(oHours.sunday) || 0);

      oModel.setProperty(oPath + "/totalHours", total);

      const aEntries = oModel.getProperty("/currentTimesheet/entries") || [];
      const weekTotal = aEntries.reduce((sum, e) => sum + (e.totalHours || 0), 0);
      oModel.setProperty("/currentTimesheet/totalWeekHours", weekTotal);
    },

    onSaveDraft: function() {
      const oModel = this.getView().getModel("TimesheetModel");
      oModel.setProperty("/currentTimesheet/status", "Draft");
      localStorage.setItem("TimesheetModel", JSON.stringify(oModel.getData()));
      sap.m.MessageToast.show("Timesheet saved as Draft");
    },

   onSubmitTimesheet: function() {
  const oLoginModel = this.getOwnerComponent().getModel("LoginModel");
  const oTimesheetModel = this.getOwnerComponent().getModel("TimesheetModel");
  const oPendingModel = this.getOwnerComponent().getModel("PendingModel");

  const currentUser = oLoginModel.getProperty("/currentUser");
  const currentTimesheet = oTimesheetModel.getProperty("/currentTimesheet");
    console.log(currentTimesheet)
  // Attach user info to timesheet
  currentTimesheet.employeeId = currentUser.employeeId;
  currentTimesheet.name = currentUser.name;

  // Mark as pending
  oTimesheetModel.setProperty("/currentTimesheet/status", "Pending");

  // Push into PendingModel
  const aPending = oPendingModel.getProperty("/pendingTimesheets") || [];
  aPending.push(currentTimesheet);
  oPendingModel.setProperty("/pendingTimesheets", aPending);

  localStorage.setItem("PendingModel", JSON.stringify(oPendingModel.getData()));
  sap.m.MessageToast.show("Timesheet submitted for approval");
}

  });
});
// CalenderPress: function () {
//     const oCalendar = this.getView().byId("calendarContainer");
//     const bVisible = oCalendar.getVisible();

//     oCalendar.setVisible(!bVisible);
// },
// onHoursChange: function (oEvent) {
//     const oInput = oEvent.getSource();
//     const oContext = oInput.getBindingContext("TimesheetModel");
//     const oModel = oContext.getModel();
//     const oPath = oContext.getPath();

//     const oHours = oModel.getProperty(oPath + "/hours");

//     const total =
//         (parseFloat(oHours.monday)    || 0) +
//         (parseFloat(oHours.tuesday)   || 0) +
//         (parseFloat(oHours.wednesday) || 0) +
//         (parseFloat(oHours.thursday)  || 0) +
//         (parseFloat(oHours.friday)    || 0) +
//         (parseFloat(oHours.saturday)  || 0) +
//         (parseFloat(oHours.sunday)    || 0);

//     // Update row total
//     oModel.setProperty(oPath + "/totalHours", total);

//     // Update week total across all entries
//     const aEntries = oModel.getProperty("/currentTimesheet/entries") || [];
//     const weekTotal = aEntries.reduce((sum, e) => sum + (e.totalHours || 0), 0);
//     oModel.setProperty("/currentTimesheet/totalWeekHours", weekTotal);
// },
// onSaveDraft: function () {
//     const oModel = this.getView().getModel("TimesheetModel");
//     localStorage.setItem("TimesheetModel", JSON.stringify(oModel.getData()));
// },

//  onSubmitTimesheet: function() {
//       const model = this.getView().getModel("LoginModel");
      
//       model.setProperty("/currentUser/employeeId", this.byId("empid").getValue());
//       model.setProperty("/currentUser/name", this.byId("name").getValue());
//       model.setProperty("/currentUser/email", this.byId("email").getValue());

//       localStorage.setItem("LoginModel", JSON.stringify(model.getData()));
      
//       this.byId("empid").setEditable(false);
//       this.byId("name").setEditable(false);
//       this.byId("email").setEditable(false);
      
//       MessageToast.show("Profile saved");
//     },
// onApplyWeek: function () {
//     const oCalendar = this.byId("calender");
//     oCalendar.setVisible(false)
//     const aSelectedDates = oCalendar.getSelectedDates();

//     if (aSelectedDates.length > 0) {
//         const oDateRange = aSelectedDates[0];
//         const startDate = oDateRange.getStartDate();
//         console.log("start Date: "+startDate)
//         const weekRange = this._getWeekRange(startDate);

//         const oTimesheetModel = this.getView().getModel("TimesheetModel");
//         console.log("TimeSheetModel: "+ oTimesheetModel)
//         const oHistoryModel = this.getView().getModel("HistoryModel");
//         console.log("oHistoryModel: "+ oHistoryModel)
//         const aHistory = oHistoryModel.getProperty("/historyTimesheets") || [];
//         aHistory.find(ts => console.log("History week:", ts.week));
//         const existing = aHistory.find(ts => ts.week === weekRange);
//         console.log("existing:" +existing)
//         if (existing) {
//             // Load history entry into TimesheetModel
//             oTimesheetModel.setProperty("/currentTimesheet", existing);
//             // Make inputs read-only for history
//             this._setTableEditable(false);
//         } else {
//             // New week → reset draft
//             oTimesheetModel.setProperty("/currentTimesheet", {
//                 week: weekRange,
//                 entries: [
//                     {
//                         taskName: "BU15 Pool - Training",
//                         hours: { monday:"0", tuesday:"", wednesday:"", thursday:"", friday:"", saturday:"", sunday:"" },
//                         totalHours: 0,
//                         submitted: false
//                     }
//                 ],
//                 scheduledHours: 45,
//                 status: "Draft"
//             });
//             // Make inputs editable for current week
//             this._setTableEditable(true);
//         }
//     }
    
// },

// _setTableEditable: function (bEditable) {
//     const oTable = this.byId("timesheetTable");
//     oTable.getItems().forEach(item => {
//         item.getCells().forEach(cell => {
//             if (cell.isA("sap.m.Input")) {
//                 cell.setEditable(bEditable);
//             }
//         });
//     });
// }

// ,
// onDateSelect: function (oEvent) {
//     console.log("onDateSelect")
//     const oCalendar = oEvent.getSource();
//     const aSelectedDates = oCalendar.getSelectedDates();

//     if (aSelectedDates.length > 0) {
//         const oDateRange = aSelectedDates[0];
//         const startDate = oDateRange.getStartDate();
//         const endDate = oDateRange.getEndDate();

//         // If only one date picked, compute week range automatically
//         let weekRange;
//         if (endDate) {
//             weekRange = this._formatRange(startDate, endDate);
//         } else {
//             weekRange = this._getWeekRange(startDate);
//         }

//         // Update TimesheetModel
//         const oTimesheetModel = this.getView().getModel("TimesheetModel");
//         oTimesheetModel.setProperty("/currentTimesheet/week", weekRange);
//     }
// },

// _formatRange: function (startDate, endDate) {
//     console.log("_formatRange")
//     const format = d => d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
//     return format(startDate) + " to " + format(endDate);
// },

// _getWeekRange: function (date) {
//     const monday = new Date(date);
//     monday.setDate(date.getDate() - date.getDay() + 1);
//     const sunday = new Date(monday);
//     sunday.setDate(monday.getDate() + 6);

//     const format = d => d.toISOString().split("T")[0]; // yyyy-mm-dd
//     return format(monday) + " to " + format(sunday);
// }





