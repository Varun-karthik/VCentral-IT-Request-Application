sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast"
], function (Controller, MessageToast) {
    "use strict";

    return Controller.extend("vcentral.controller.Login", {

        onInit: function () {
            this.getOwnerComponent().getRouter().getRoute("RouteView1").attachPatternMatched(this._onRouteMatched, this);
        },
        onRouteMatched(){
            // Auto-redirect if already logged in
           var oUser = this.getOwnerComponent().getModel("LoginModel").getProperty("/currentUser");
            if (oUser) {
                this._navigateByRole(oUser.role);
            }
        },
        navPress:function(){
            this.getOwnerComponent().getRouter().navTo("homePage")
        },
        onLoginPress: function () {
            var oUserModel = this.getOwnerComponent().getModel("LoginModel");
            var aUsers = oUserModel.getProperty("/Users");
            
            console.log(aUsers)
            var oManager = oUserModel.getProperty("/Manager");
            console.log(oManager)

            if (!Array.isArray(aUsers) || !oManager) {
                MessageToast.show("Login data not loaded properly");
                return;
            }

            var sUsername = this.byId("username").getValue().trim();
            var sPassword = this.byId("password").getValue().trim();
            var sRole = this.byId("roleSelect").getSelectedKey();

            if (!sUsername || !sPassword || !sRole) {
                MessageToast.show("Please enter username, password and role");
                return;
            }

            let oMatchedUser = null;

            if (sRole === "user") {
                oMatchedUser = aUsers.find(function (u) {
                    return u.username === sUsername && u.password === sPassword;
                });
            } else if (sRole === "manager") {
                if (oManager.username === sUsername && oManager.password === sPassword) {
                    oMatchedUser = oManager;
                }
            }

            if (!oMatchedUser) {
                MessageToast.show("Invalid credentials");
                return;
            }

            // Save logged-in user
            oUserModel.setProperty("/currentUser", oMatchedUser);
            // localStorage.setItem("CurrentUser", JSON.stringify(oMatchedUser));

            MessageToast.show("Welcome " + oMatchedUser.name);

            this._navigateByRole(oMatchedUser.role);
        },

        _navigateByRole: function (sRole) {
            var oRouter = this.getOwnerComponent().getRouter();
            switch (sRole) {
                case "manager":
                    oRouter.navTo("ManagerDashboard");
                    break;
                case "user":
                    oRouter.navTo("UserHome");
                    break;
                default:
                    oRouter.navTo("Home");
                    break;
            }
        }
    });
});
