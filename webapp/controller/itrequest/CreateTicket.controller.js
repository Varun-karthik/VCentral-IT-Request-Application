sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/m/MessageBox",
], (Controller,MessageBox) => {
  "use strict";

  return Controller.extend("vcentral.controller.itrequest.CreateTicket", {
      onInit() {
        this.getOwnerComponent().getRouter().getRoute("create").attachPatternMatched(this.onRouteMatched,this)
      },
      onRouteMatched: function(){
        
      },
      back:function(){
        this.getOwnerComponent().getRouter().navTo("Routedashboard")
      },
      // For Local Data
      // Submit: function() {
      //   var category = this.byId("category").getSelectedKey();
      //   var priority = this.byId("priority").getSelectedKey();
      //   var desc = this.byId("description").getValue();

      //   if (!category || !priority || !desc) {
      //     MessageBox.warning("Please fill all required fields");
      //     return;
      //   }

      //   const oRequestModel = this.getOwnerComponent().getModel("RequestModel");
      //   let oData = oRequestModel.getData();

      //   let newRequests = {
      //     id: this.generateRequestId(),
      //     category: category,
      //     priority: priority,
      //     status: "Open",
      //     createdOn: new Date().toISOString().split("T")[0],
      //     description: desc
      //   };

      //   oData.requests.push(newRequests);
      //   console.log("New Request Added: ", newRequests);
      //   localStorage.setItem("requests", JSON.stringify(oData));
      //   oRequestModel.refresh(true);
      //   this.byId("category").setSelectedKey(null);
      //   this.byId("priority").setSelectedKey(null);
      //   this.byId("description").setValue("");
      // },
      
      // For Backend Data
      Submit: function() {
        var category = this.byId("category").getSelectedKey();
        var priority = this.byId("priority").getSelectedKey();
        var desc = this.byId("description").getValue();

        if (!category || !priority || !desc) {
          MessageBox.warning("Please fill all required fields");
          return;
        }

        const oModel = this.getOwnerComponent().getModel("RequestModel");

        const oNewEntry = {
          Category: category,
          Priority: priority,
          Status: "Open",
          CreatedOn: new Date(), // OData expects Date object
          Description: desc,
          RequestId:this.generateRequestId()
        };

        oModel.create("/itrequestSet", oNewEntry, {
          success: function(oData) {
            MessageBox.success("Request created successfully with ID " + oData.RequestId);
            this.byId("category").setSelectedKey(null);
            this.byId("priority").setSelectedKey(null);
            this.byId("description").setValue("");
          }.bind(this),
          error: function(oError) {
            MessageBox.error("Error creating request: " + oError.message);
          }
        });
      },
      generateRequestId :function() {
        return "REQ-" + Math.floor(1000 + Math.random() * 9000);
      },


      back:function(){
        this.getOwnerComponent().getRouter().navTo("Routedashboard")    
      }

  });
});