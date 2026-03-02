sap.ui.define([
  "sap/ui/core/mvc/Controller"
], (Controller) => {
  "use strict";

  return Controller.extend("vcentral.controller.itrequest.NotificationPage", {
      onInit() {
        this.getOwnerComponent().getRouter().getRoute("notification").attachPatternMatched(this.onRouteMatched,this);
      },
      onRouteMatched:function(){
      },
      stateChange:function(){
        this.byId("combobox").setEnabled(true)
      },
      test:function(){
        sap.m.MessageToast.show("Notification Sent and Recived Successfully")
      }
  });
});

