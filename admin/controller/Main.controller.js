sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function(Controller) {
	"use strict";

	return Controller.extend("idpadminIDPAdmin.controller.Main", {
		getData: function(path, successCallback, errorCallback) {
			if (path === "UserData") {
				var obj = {};
				obj.userid = "I322345";
				obj.userName = "Nishant";
				obj.emailid = "nishant.soft04@gmail.com";
				successCallback(obj);
			}
		},
		onInit: function() {
			var that = this;
			this.getData("UserData", function(data) {
				var oModel = new sap.ui.model.json.JSONModel();
				oModel.setData(data);
				that.getView().setModel(oModel, "UserData");
			});
		},
		handleUserItemPressed: function(oEvent) {
			var oButton = oEvent.getSource();
			if (!this._actionSheet) {
				this._actionSheet = sap.ui.xmlfragment(
					"idpadminIDPAdmin.fragment.Logout",
					this
				);
				this.getView().addDependent(this._actionSheet);
			}
			this._actionSheet.openBy(oButton);
		},
		handleLogout : function(){
			window.loccation.href = "/admin/logout";
		}
	});
});