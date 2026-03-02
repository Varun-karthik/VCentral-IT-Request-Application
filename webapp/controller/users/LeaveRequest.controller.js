sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/m/MessageToast",
  "sap/ui/core/format/DateFormat",
  "sap/m/MessageBox",
  "sap/ui/model/json/JSONModel"
], function(Controller, MessageToast, DateFormat, MessageBox, JSONModel) {
  "use strict";

  return Controller.extend("vcentral.controller.users.LeaveRequest", {

    onInit: function() {
      this.getOwnerComponent().getRouter()
        .getRoute("Leave")
        .attachPatternMatched(this._onRouteMatched, this);
    },

    _onRouteMatched: function() {
      const oTimesheetModel = this.getOwnerComponent().getModel("TimesheetModel");
      const aTimesheets = oTimesheetModel.getProperty("/timesheets") || [];
      const oLoginModel = this.getOwnerComponent().getModel("LoginModel");
      const userId = oLoginModel.getProperty("/currentUser/employeeId");

      const current = aTimesheets.find(ts => ts.employeeId === userId);
      oTimesheetModel.setProperty("/currentTimesheet", current || {});
      const oPendingModel = this.getOwnerComponent().getModel("PendingModel"); 
    //   const savedPending = localStorage.getItem("PendingModel"); 
    //   if (savedPending) { 
    //     oPendingModel.setData(JSON.parse(savedPending)); 
    //    }
      const savedDraft = localStorage.getItem("DraftModel"); 
      if (savedDraft) { 
        const oDraft = JSON.parse(savedDraft); // Convert back to Date objects for binding 
        if (oDraft.startDate) {
        this.byId("dateRange").setDateValue(new Date(oDraft.startDate));
        }
        if (oDraft.endDate) {
        this.byId("dateRange").setSecondDateValue(new Date(oDraft.endDate));
        }

        this.getOwnerComponent().getModel("DraftModel").setData(oDraft); 
    }
        this.leaverequest()
    },

    onDateRangeChange: function(oEvent) {
      const oControl = oEvent.getSource();
      const oStart = oControl.getDateValue();
      const oEnd = oControl.getSecondDateValue();

      if (!oStart || !oEnd) {
        MessageToast.show("Please select a valid date range.");
        this._canApplyLeave = false;
        return;
      }

      if (!this.oFormatYyyymmdd) {
        this.oFormatYyyymmdd = DateFormat.getDateInstance({ pattern: "yyyy-MM-dd" });
      }

      const aLeaves = this.getView().getModel("holidays").getData();

      let totalDays = 0, holidayDays = 0, weekendDays = 0, validDays = 0;

      for (let d = new Date(oStart); d <= oEnd; d.setDate(d.getDate() + 1)) {
        totalDays++;
        const sFormattedDate = this.oFormatYyyymmdd.format(d);
        const dayOfWeek = d.getDay();
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

      this._canApplyLeave = validDays > 0;
      this._selectedRange = { start: oStart, end: oEnd, totalDays, holidayDays, weekendDays, validDays };

      MessageBox.warning(
        `You selected ${totalDays} day(s).\n` +
        `- Holidays: ${holidayDays}\n` +
        `- Weekends: ${weekendDays}\n` +
        `- Eligible leave days: ${validDays}`, {
          actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
          emphasizedAction: MessageBox.Action.CANCEL,
          onClose: (sAction) => {
            if (sAction === MessageBox.Action.CANCEL) {
              this._canApplyLeave = false;
              oControl.setDateValue(null);
              oControl.setSecondDateValue(null);
            }
          }
        }
      );
    },

    submit: function() {
      if (this._canApplyLeave && this._selectedRange) {
        const sStart = this.oFormatYyyymmdd.format(this._selectedRange.start);
        const sEnd = this.oFormatYyyymmdd.format(this._selectedRange.end);

        const currentUser = this.getOwnerComponent().getModel("LoginModel").getProperty("/currentUser");

        const oLeaveEntry = {
          employeeId: currentUser.employeeId,
          name: currentUser.name,
          startDate: sStart,
          endDate: sEnd,
          validDays: this._selectedRange.validDays,
          status: "PendingApproval",
          reason: this.byId("reason").getValue(),
          managerId: currentUser.reportingManagerId,
          managerName: currentUser.reportingManagerName,
          
        };

        const oPendingModel = this.getOwnerComponent().getModel("PendingModel");
        const aPendingLeaves = oPendingModel.getProperty("/pendingLeaves") || [];
        aPendingLeaves.push(oLeaveEntry);
        oPendingModel.setProperty("/pendingLeaves", aPendingLeaves);

        console.log("Pending Leave Data:", aPendingLeaves);
        console.log("oPendingModel:", oPendingModel.getData());
        
        localStorage.setItem("PendingModel", JSON.stringify(oPendingModel.getData()));
        
        console.log("oPendingModel: ",oPendingModel.PendingLeaves)
        MessageBox.success(
          `Leave request submitted!\n` +
          `Range: ${sStart} to ${sEnd}\n` +
          `Eligible leave days: ${this._selectedRange.validDays}\n` +
          `Sent to manager: ${currentUser.reportingManagerName}`
        );
        console.log("Leave entry being saved:", oLeaveEntry);

      } else {
        MessageBox.error("Selected range is not eligible for leave application");
      }
      this.leaverequest();
    },

    leaverequest: function() {
  const sUserId = this.getOwnerComponent().getModel("LoginModel").getProperty("/currentUser/employeeId");

  const oPendingModel = this.getOwnerComponent().getModel("PendingModel");
  const aPending = oPendingModel.getProperty("/pendingLeaves") || [];
  const aUserPending = aPending.filter(l => l.employeeId === sUserId);

  const oHistoryModel = this.getOwnerComponent().getModel("HistoryModel");
  const aHistory = oHistoryModel.getProperty("/historyLeaves") || [];
  const aUserHistory = aHistory.filter(l => l.employeeId === sUserId);

  // Show in tables
  const oUserLeaveModel = new JSONModel({
    pending: aUserPending,
    history: aUserHistory
  });
  this.getView().setModel(oUserLeaveModel, "UserLeaveModel");

  //  Update tiles directly
  const oTimesheetModel = this.getOwnerComponent().getModel("TimesheetModel");
  const aTimesheets = oTimesheetModel.getProperty("/timesheets") || [];
  const oUserTimesheet = aTimesheets.find(t => t.employeeId === sUserId);

  if (oUserTimesheet) {
    const pendingDays = aUserPending.reduce((sum, l) => sum + (l.validDays || 0), 0);
    const approvedDays = aUserHistory
      .filter(l => l.status === "Approved")
      .reduce((sum, l) => sum + (l.validDays || 0), 0);

    oUserTimesheet.daysSelected = pendingDays; // Current Request
    oUserTimesheet.remainingAfterRequest = oUserTimesheet.annualQuota - approvedDays - pendingDays; // Remaining
    oTimesheetModel.refresh();
  }
  
},
saveDraft: function() {
  const oDraftEntry = {
    employeeId: this.getOwnerComponent().getModel("LoginModel").getProperty("/currentUser/employeeId"),
    leaveType: this.byId("leaveTypeCombo").getSelectedKey(),
    startDate: this.byId("dateRange").getDateValue()?.toISOString(),
    endDate: this.byId("dateRange").getSecondDateValue()?.toISOString(),
    reason: this.byId("reason").getValue(),
    attachment: this._uploadedFile || null,
    status: "Draft"
  };
  console.log( "oDraftEntry Leave"+ oDraftEntry.leaveType)

  localStorage.setItem("DraftModel", JSON.stringify(oDraftEntry));
  this.getOwnerComponent().getModel("DraftModel").setData(oDraftEntry);

  MessageToast.show("Draft saved successfully!");
},

 

  });
});
