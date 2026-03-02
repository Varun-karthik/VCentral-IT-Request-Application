sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/m/MessageToast",
  "sap/ui/unified/DateTypeRange",
  "sap/ui/core/date/UI5Date",
  'sap/ui/core/format/DateFormat',
  "sap/m/MessageBox",
], function(Controller, MessageToast,DateTypeRange,UI5Date,DateFormat,MessageBox) {
  "use strict";

  return Controller.extend("vcentral.controller.users.Timesheet", {
   onInit: function() {
            this.getOwnerComponent().getRouter().getRoute("Timesheet").attachPatternMatched(this._onRouteMatched, this);
   },
_onRouteMatched: function() {
  const oLoginModel = this.getOwnerComponent().getModel("LoginModel");
  const oTimesheetModel = this.getOwnerComponent().getModel("TimesheetModel");

  const userId = oLoginModel.getProperty("/currentUser/employeeId");
  const aTimesheets = oTimesheetModel.getProperty("/timesheets") || [];

  // Find the logged-in user's timesheet
  const current = aTimesheets.find(ts => ts.employeeId.startsWith(userId));
  console.log("current: "+current)
  console.log("Login userId:", userId);
  console.log("Timesheet IDs:", aTimesheets.map(ts => ts.employeeId));

  // Set it as /currentTimesheet so the view can bind
  oTimesheetModel.setProperty("/currentTimesheet", current || {});

  // Leaves
  const oModel=this.getOwnerComponent().getModel("holidays")
  console.log("oModel: "+oModel)
  this._addHolidaySpecialDates(oModel.getData());

  // const oHistoryModel = this.getOwnerComponent().getModel("HistoryModel");
  //     // const aHistory = oHistoryModel.getProperty("/historyLeaves") || [];

  // const aLeaves = oHistoryModel.getProperty("/historyLeaves") || [];
  // aLeaves.forEach(function (leave) {
  //   let sType;
  //   switch (leave.status) {
  //     case "Approved":
  //       sType = sap.ui.unified.CalendarDayType.Type04;
  //       break;
  //     case "Rejected":
  //       sType = sap.ui.unified.CalendarDayType.Type05;
  //       break;
  //     default:
  //       sType = sap.ui.unified.CalendarDayType.Type06;
  //   }

  //   oCalendar.addSpecialDate(new sap.ui.unified.DateTypeRange({
  //     startDate: new Date(leave.startDate),
  //     endDate: new Date(leave.endDate),
  //     type: sType,
  //     tooltip: leave.name
  //   }));
  // });

}
,
    onHoursChange: function(oEvent) {
      const oInput = oEvent.getSource();
      const oContext = oInput.getBindingContext("TimesheetModel");
      const oModel = oContext.getModel();
      const oPath = oContext.getPath();

      const oHours = oModel.getProperty(oPath + "/hours");
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
      MessageToast.show("Timesheet saved as Draft");
    },

   onSubmitTimesheet: function() {
  const oLoginModel = this.getOwnerComponent().getModel("LoginModel");
  const oTimesheetModel = this.getOwnerComponent().getModel("TimesheetModel");
  const oPendingModel = this.getOwnerComponent().getModel("PendingModel");

  const currentUser = oLoginModel.getProperty("/currentUser");
  const currentTimesheet = oTimesheetModel.getProperty("/currentTimesheet");

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
,
    create_absence :function(){
      this.getOwnerComponent().getRouter().navTo("Leave");
    },



// Leaves
_addHolidaySpecialDates: function(aHolidays) {
  const oCalendar = this.byId("calendar");

  //  Clear old special dates first
  oCalendar.destroySpecialDates();

  // 1. Holidays (same for everyone)
  aHolidays.forEach(oHoliday => {
    let sType;
    switch (oHoliday.type) {
      case "F":  sType = "Type01"; break;
      case "RF": sType = "Type02"; break;
      case "OH": sType = "Type03"; break;
    }

    oCalendar.addSpecialDate(new DateTypeRange({
      startDate: UI5Date.getInstance(oHoliday.date),
      type: sType,
      tooltip: oHoliday.name
    }));
  });

  // 2. Leaves (filtered per current user)
  const oLoginModel = this.getOwnerComponent().getModel("LoginModel");
  const sUserId = oLoginModel.getProperty("/currentUser/employeeId");

  const oHistoryModel = this.getOwnerComponent().getModel("HistoryModel");
  const aAllLeaves = oHistoryModel.getProperty("/historyLeaves") || [];

  const aUserLeaves = aAllLeaves.filter(l => l.employeeId === sUserId);

  aUserLeaves.forEach(function (leave) {
    let sType;
    switch (leave.status) {
      case "Approved": sType = "Type04"; break;
      case "Rejected": sType = "Type05"; break;
      case "Pending": sType = "Type06";
    }

    oCalendar.addSpecialDate(new DateTypeRange({
      startDate: new Date(leave.startDate),
      endDate: new Date(leave.endDate),
      type: sType,
      tooltip: leave.name + " (" + leave.status + ")"
    }));
  });
},
//  calanderSelect: function(oEvent) {
//   const oCalendar = oEvent.getSource();
//   const aSelectedDates = oCalendar.getSelectedDates();
//   if (aSelectedDates.length > 0) {
//     // Create date formatter if not already created in onInit
//     if (!this.oFormatYyyymmdd) {
//       this.oFormatYyyymmdd = DateFormat.getDateInstance({
//         pattern: "yyyy-MM-dd"
//       });
//     }
//     // Get holidays data
//     const aLeaves = this.getView().getModel("holidays").getData();
//     // Process first selected date (you can modify to handle multiple)
//     const oDate = aSelectedDates[0].getStartDate();
//     const sFormattedDate = this.oFormatYyyymmdd.format(oDate);
//     // Find if it's a holiday
//     const oHoliday = aLeaves.find(h => h.date === sFormattedDate);
//     if (oHoliday) {
//       MessageToast.show("Selected: " + sFormattedDate + " - " + oHoliday.name);
//     } else {
//       MessageToast.show(`Selected: ${sFormattedDate} (Not a holiday)`);
//     }
//   } else {
//     MessageToast.show("No date selected");
//   }
// },
calanderSelect: function(oEvent) {
  const oCalendar = oEvent.getSource();
  const aSelectedDates = oCalendar.getSelectedDates();

  if (!aSelectedDates.length) {
    MessageToast.show("No date selected");
    this._canApplyLeave = false;
    return;
  }

  if (!this.oFormatYyyymmdd) {
    this.oFormatYyyymmdd = DateFormat.getDateInstance({
      pattern: "yyyy-MM-dd"
    });
  }

  const oRange = aSelectedDates[0];
  const oStart = oRange.getStartDate();
  const oEnd   = oRange.getEndDate() || oStart;

  const aLeaves = this.getView().getModel("holidays").getData();

  let totalDays = 0;
  let holidayDays = 0;
  let weekendDays = 0;
  let validDays = 0;

  for (let d = new Date(oStart); d <= oEnd; d.setDate(d.getDate() + 1)) {
    totalDays++;
    const sFormattedDate = this.oFormatYyyymmdd.format(d);

    const dayOfWeek = d.getDay(); // 0=Sunday, 6=Saturday
    const isWeekend = (dayOfWeek === 0 || dayOfWeek === 6);
    const oHoliday = aLeaves.find(h => h.date === sFormattedDate);

    if (isWeekend) {
      weekendDays++;
    } else if (oHoliday && oHoliday.type !== "OH") {
      holidayDays++;
    } else {
      validDays++;
    }
  }

  // Save selection state
  this._canApplyLeave = validDays > 0;
  this._selectedRange = { start: oStart, end: oEnd, totalDays, holidayDays, weekendDays, validDays };

  // Show summary in a MessageBox
 MessageBox.warning(
  `You selected ${totalDays} day(s).\n` +
  `- Holidays (fixed/regional): ${holidayDays}\n` +
  `- Weekends: ${weekendDays}\n` +
  `- Eligible leave days: ${validDays}`, {
    actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
    emphasizedAction: MessageBox.Action.CANCEL,
    onClose: (sAction) => {
      if (sAction === MessageBox.Action.CANCEL) {
        // User cancelled  clear selection and block leave
        this._canApplyLeave = false;
        oCalendar.removeAllSelectedDates();
      } else if (sAction === MessageBox.Action.OK) {
        // User confirmed  keep selection and allow leave if valid
        this._canApplyLeave = validDays > 0;
      }
    }
  });

} ,
absence: function() {
  if (this._canApplyLeave && this._selectedRange) {
    const sStart = this.oFormatYyyymmdd.format(this._selectedRange.start);
    const sEnd   = this.oFormatYyyymmdd.format(this._selectedRange.end);

      const currentUser = this.getOwnerComponent().getModel("LoginModel").getProperty("/currentUser");

    // Build pending leave entry
    const oLeaveEntry = {
      employeeId: currentUser.employeeId,
      name: currentUser.name,
      weekId: this._selectedRange.weekId || "2026-01-25_to_2026-02-01", // derive dynamically
      startDate: sStart,
      endDate: sEnd,
      validDays: this._selectedRange.validDays,
      status: "PendingApproval",
      managerId: currentUser.reportingManagerId,
      managerName: currentUser.reportingManagerName
    };
    console.log("oLeaveEntry : "+ oLeaveEntry)

    // Push into PendingModel
    const oPendingModel = this.getOwnerComponent().getModel("PendingModel");
    const aPending = oPendingModel.getProperty("/pendingLeaves") || [];
    aPending.push(oLeaveEntry);
    oPendingModel.setProperty("/pendingLeaves", aPending);

    // Update TimesheetModel
    const oTimesheetModel = this.getOwnerComponent().getModel("TimesheetModel");
    const aTimesheets = oTimesheetModel.getProperty("/timesheets");
    const oUserTimesheet = aTimesheets.find(t => t.employeeId === currentUser.employeeId 
                                                    && t.weekId === oLeaveEntry.weekId);
    if (oUserTimesheet) {
      oUserTimesheet.status = "Submitted";
      oUserTimesheet.entries[0].taskName = "Leave";
      oUserTimesheet.entries[0].submitted = true;
      // Optionally mark hours as "Leave" for selected days
    }
    oTimesheetModel.refresh();

    // Confirmation
    MessageBox.success(
      `Leave request submitted!\n` +
      `Range: ${sStart} to ${sEnd}\n` +
      `Eligible leave days: ${this._selectedRange.validDays}\n` +
      `Sent to manager: ${currentUser.reportingManagerName}`
    );
  } else {
    sap.m.MessageBox.error("Selected range is not eligible for leave application");
  }
}



  });
});
