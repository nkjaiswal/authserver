sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function(Controller) {
	"use strict";

	return Controller.extend("idpadminIDPAdmin.controller.Main", {
		ajaxCaller : function (url,callback){
			$.ajax({
				url: url,
				dataType: "json",
				success: function(response) {
					callback(response);
				}
			});
		},
		getData: function(path, successCallback, errorCallback) {
			if (path === "UserData") {
				var obj = {};
				obj.userid = "I322345";
				obj.userName = "Nishant";
				obj.emailid = "nishant.soft04@gmail.com";
				successCallback(obj);
				
			}
			if (path === "AllUsers") {
				var obj = [];
				obj.push({
					userid: "I322345",
					userName: "Nishant",
					emailid: "nishant.soft04@gmail.com",
					phone : "7760533699"
				});
				obj.push({
					userid: "I322321",
					userName: "Mounika",
					emailid: "mounika@gmail.com",
					phone : "9876543210"
				});
				successCallback(obj);
			}
		},
		getPersonnelData: function() {
			var that = this;
			this.ajaxCaller("/api/admin/UserData", function(data) {
				var oModel = new sap.ui.model.json.JSONModel();
				oModel.setData(data);
				that.getView().setModel(oModel, "UserData");
			});
		},
		getAllUserData: function() {
			var that = this;
			this.getData("AllUsers", function(data) {
				var oModel = new sap.ui.model.json.JSONModel();
				oModel.setData(data);
				that.getView().setModel(oModel, "AllUsers");
			});
		},
		onInit: function() {
			this.getPersonnelData();
			this.getAllUserData();
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
		handleLogout: function() {
			location.href = "/admin/logout";
		},
		handlePressHome: function() {
			location.href = "/admin/";
		},
		onAddPressed: function() {
			if (!this._addNewUser) {
				this._addNewUser = sap.ui.xmlfragment(
					"idpadminIDPAdmin.fragment.AddNewUser",
					this
				);
				this.getView().addDependent(this._addNewUser);
			}
			this._addNewUser.open();
		},
		onPressSaveNewUser : function(oEvent){
			var newUser = {};
			newUser.userid = sap.ui.getCore().byId("newUserId").getValue();
			newUser.userName = sap.ui.getCore().byId("newUserName").getValue();
			newUser.emailid = sap.ui.getCore().byId("newEmailId").getValue();
			newUser.phone = sap.ui.getCore().byId("newPhone").getValue();
			
			oEvent.getSource().getParent().close();
		},
		onPressCancel : function(oEvent){
			oEvent.getSource().getParent().close();
		},
		onPressUsersItem: function(oEvent){
			var userData = oEvent.getSource().getBindingContext("AllUsers").getObject();
			this.getRouter().navTo("details",{
				userid : userData.userid
			});
		},
		getRouter : function(){
			return sap.ui.core.UIComponent.getRouterFor(this);
		}
	});
});