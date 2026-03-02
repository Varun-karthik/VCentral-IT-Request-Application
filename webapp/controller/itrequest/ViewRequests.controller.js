sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/model/Filter",
  "sap/ui/model/FilterOperator"
], (Controller,Filter,FilterOperator) => {
  "use strict";

  return Controller.extend("vcentral.controller.itrequest.ViewRequests", {
      onInit() {
        this.getOwnerComponent().getRouter().getRoute("viewRequests").attachPatternMatched(this.onRouteMatched,this);
        
      },
      onRouteMatched:function(){
        const oTable = this.byId("Requests_table");
        oTable.attachUpdateFinished(this.updateCount, this);
      },
      back:function(){
        this.getOwnerComponent().getRouter().navTo("Routedashboard")    
      },

      updateCount:function(){
        console.log("updateCount")
        var oTable = this.byId("Requests_table");
        var oBinding = oTable.getBinding("items");
        var length= oBinding.getLength()

        // var oModel = this.getView().getModel("RequestModel");
        // var aRequests = oModel.getProperty("/requests");   // returns the array
        // var iLength = aRequests.length;                    // number of items

        this.byId("count").setText(length +" of "+ length +" requests");
      },
      onStatusChange: function (oEvent) {
      var sKey = oEvent.getParameter("selectedItem").getKey();
      var oTable = this.byId("Requests_table");
      var oBinding = oTable.getBinding("items");
        var length= oBinding.getLength()
      // var oModel = this.getView().getModel("RequestModel");
      // var aRequests = oModel.getProperty("/requests");
      // var iTotal = aRequests.length;   // total rows in model

      var aFilters = [];
      if (sKey && sKey !== "allStatus") {
        aFilters.push(new Filter("Status", FilterOperator.EQ, sKey));
      }

      oBinding.filter(aFilters);

      // Correct: get filtered length from binding
      var iFiltered = oBinding.getLength();

      this.byId("count").setText(iFiltered + " of " + length + " requests");
    },
    // download: function () {
    //     // Get the model data
    //     var oRequestModel = this.getView().getModel("RequestModel");
    //     var aData = oRequestModel.getData().requests;

    //     // Build CSV header (exclude Actions)
    //     var csvContent = "ID,Category,Priority,Status,Created On\n";

    //     // Loop through requests and add rows
    //     aData.forEach(function (req) {
    //       csvContent += [
    //         req.id,
    //         req.category,
    //         req.priority,
    //         req.status,
    //         '"' + "'" + req.createdOn + '"'
    //         // '"' + req.createdOn + '"\n'
    //         // '"' + req.createdOn + '"\n"'
    //       ].join(",") + "\n";
    //     });
    //         console.log("csvContent :" +csvContent)
    //     // Create a blob and trigger download
    //     var blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    //     var link = document.createElement("a");
    //     link.href = URL.createObjectURL(blob);
    //     link.download = "Requests.csv";
    //     link.click();
    //   },
    formatDate: function(sValue){
      console.log("Date Formatter")
      if(!sValue){
        sap.m.MessageToast("Date not Loaded");
        return;
      }
      let formattedDate = new Date(req.createdOn).toISOString().split("T")[0];
      return formattedDate
    },
      download: function () {
        var oTable = this.byId("Requests_table");
        var oItems = oTable.getItems();   // only the rows currently displayed
        var csvContent = "ID,Category,Priority,Status,Created On\n";

        oItems.forEach(function (oItem) {
          // ColumnListItem has the binding context
          var oContext = oItem.getBindingContext("RequestModel");
          if (oContext) {
            var req = oContext.getObject();   // get the actual row data
            // let formattedDate = new Date(req.createdOn).toISOString().split("T")[0];
        // e.g. "2026-01-02"
            // console.log("Formatted Date: ", formattedDate)
            csvContent += [
            req.RequestId,
            req.Category,
            req.Priority,
            req.Status,
            req.CreatedOn.toISOString().split("T")[0]
          ].join(",") + "\n";
          }
        });
      console.log("csvContent :" +csvContent)
        // Create a blob and trigger download
        var blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        var link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "Requests.csv";
        link.click();
      },
      
      requestdetails: function (oEvent) {
        var oContext = oEvent.getSource().getParent().getBindingContext("RequestModel");
        var sId = oContext.getProperty("RequestId");   // fetch the ID of that row

        // Navigate to detail view with ID
        this.getOwnerComponent().getRouter().navTo("RequestDetail", {
          requestId: sId
        });
      }



    // onStatusChange: function (oEvent) {
    //     var sKey = oEvent.getParameter("selectedItem").getKey();
    //     console.log("sKey: ",sKey)
    //     var oTable = this.byId("Requests_table");
    //     var oBinding = oTable.getBinding("items");
        
    //      var oModel = this.getView().getModel("RequestModel");
    //     var aRequests = oModel.getProperty("/requests");   // returns the array
    //     var iLength = aRequests.length;   

    //     var aFilters = [];
    //     if (sKey && sKey !== "allStatus") {
    //       aFilters.push(new Filter("status",FilterOperator.EQ, sKey));
    //     }
    //     console.log(aFilters)
    //     oBinding.filter(aFilters);
    //     var alength= (aFilters.length) +1;
    //     if (sKey && sKey == "allStatus") {
    //      var alength=(oBinding.getLength())
    //     }
    //     this.byId("count").setText(alength +" of "+ iLength +" requests")
    //   },
      



  });
});