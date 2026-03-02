sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/m/MessageToast",
  "sap/m/MessageBox"
], (Controller, MessageToast, MessageBox) => {
  "use strict";

  return Controller.extend("vcentral.controller.itrequest.RequestDetails", {
    onInit: function () {
      const oRouter = this.getOwnerComponent().getRouter();
      oRouter.getRoute("RequestDetail").attachPatternMatched(this._onObjectMatched, this);
    },

    _onObjectMatched: function (oEvent) {
      const sId = oEvent.getParameter("arguments").requestId;
      const oModel = this.getOwnerComponent().getModel("RequestModel");

      // Bind the view directly to the OData entity
      this.getView().bindElement({
        path: "/itrequestSet('" + sId + "')",
        model: "RequestModel"
      });
    },

    back: function () {
      this.getOwnerComponent().getRouter().navTo("viewRequests");
    },
    Edit: function () {
      const oContext = this.getView().getBindingContext("RequestModel");
      this._backupData = Object.assign({}, oContext.getObject());

      this.byId("categoryText").setVisible(false);
      this.byId("category2").setVisible(true);
      this.byId("priorityText").setVisible(false);
      this.byId("priority2").setVisible(true);
      this.byId("statusText").setVisible(false);
      this.byId("status").setVisible(true);
      this.byId("descText").setVisible(false);
      this.byId("descTextArea").setVisible(true);
      this.byId("edit").setVisible(false);
      this.byId("save").setVisible(true);
      this.byId("cancel").setVisible(true);
    },

    Cancel: function () {
      // if (this._backupData) {
      //   const oContext = this.getView().getBindingContext("RequestModel");
      //   Object.assign(oContext.getObject(), this._backupData);
      //   this.getView().getModel("RequestModel").refresh(true);
      //   this._backupData = null;
      // }

      // reset visibility
      this.byId("categoryText").setVisible(true);
      this.byId("category2").setVisible(false);
      this.byId("priorityText").setVisible(true);
      this.byId("priority2").setVisible(false);
      this.byId("statusText").setVisible(true);
      this.byId("status").setVisible(false);
      this.byId("descText").setVisible(true);
      this.byId("descTextArea").setVisible(false);
      this.byId("edit").setVisible(true);
      this.byId("save").setVisible(false);
      this.byId("cancel").setVisible(false);
    },
    Save: function () {
      const oContext = this.getView().getBindingContext("RequestModel");
      const oModel = this.getView().getModel("RequestModel");

      // read values from editable controls
      const newCategory = this.byId("category2").getSelectedKey();
      const newPriority = this.byId("priority2").getSelectedKey();
      const newStatus = this.byId("status").getSelectedKey();
      const newDesc = this.byId("descTextArea").getValue();

      // set properties on the context
      oModel.setProperty(oContext.getPath() + "/Category", newCategory);
      oModel.setProperty(oContext.getPath() + "/Priority", newPriority);
      oModel.setProperty(oContext.getPath() + "/Status", newStatus);
      oModel.setProperty(oContext.getPath() + "/Description", newDesc);

      // now submit changes
      oModel.submitChanges({
        success: () => {
          oModel.refresh(true);
          MessageToast.show("Request updated successfully");
          console.log("OModel",oModel)
        },
        error: (oError) => {
          console.error("Save failed", oError);
          MessageToast.show("Error saving changes");
        }
      });

      // toggle visibility back
      this.byId("categoryText").setVisible(true);
      this.byId("category2").setVisible(false);
      this.byId("priorityText").setVisible(true);
      this.byId("priority2").setVisible(false);
      this.byId("statusText").setVisible(true);
      this.byId("status").setVisible(false);
      this.byId("descText").setVisible(true);
      this.byId("descTextArea").setVisible(false);
      this.byId("edit").setVisible(true);
      this.byId("save").setVisible(false);
      this.byId("cancel").setVisible(false);
    },

    delete: function () {
      const oContext = this.getView().getBindingContext("RequestModel");
      const sPath = oContext.getPath();
      const oModel = this.getView().getModel("RequestModel");

      MessageBox.confirm("Are you sure you want to delete this request?", {
        actions: [MessageBox.Action.YES, MessageBox.Action.NO],
        onClose: (sAction) => {
          if (sAction === MessageBox.Action.YES) {
            oModel.remove(sPath, {
              success: () => {
                MessageToast.show("Request deleted successfully");
                this.getOwnerComponent().getRouter().navTo("viewRequests");
              },
              error: () => {
                MessageBox.error("Failed to delete request");
              }
            });
          }
        }
      });
    }
  });
});

