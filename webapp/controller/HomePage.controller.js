sap.ui.define([
  "sap/ui/core/mvc/Controller"
], (Controller) => {
  "use strict";

  return Controller.extend("vcentral.controller.HomePage", {
      onInit() {
      },
      VCentral_press:function(){
        this.getOwnerComponent().getRouter().navTo("RouteView1")
      },
      ITService_press:function(){
        this.getOwnerComponent().getRouter().navTo("Routedashboard")
      }
  });
});