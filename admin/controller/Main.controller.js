sap.ui.define([
	"sap/m/MessageToast",
	"sap/m/Dialog",
	"sap/ui/core/mvc/Controller"
], function(toast,Dialog,Controller) {
	"use strict";

	return Controller.extend("idpadminIDPAdmin.controller.Main", {
		ajaxGET : function (url,callback){
			$.ajax({
				url: url,
				dataType: "json",
				success: function(response) {
					callback(response);
				}
			});
		},
		ajaxPOST : function (url,data,callback){
			$.ajax({
				url: url,
				type: "POST",
				data: data,
				dataType: "json",
				success: function(response) {
					callback(response);
				}
			});
		},
		ajaxDELETE : function (url,callback){
			$.ajax({
				url: url,
				type: "DELETE",
				dataType: "json",
				success: function(response) {
					callback(response);
				}
			});
		},
		getPersonnelData: function() {
			var that = this;
			this.ajaxGET("/api/admin/UserData", function(data) {
				var oModel = new sap.ui.model.json.JSONModel();
				oModel.setData(data);
				that.getView().setModel(oModel, "UserData");
			});
		},
		getAllUserData: function() {
			var that = this;
			this.ajaxGET("/api/admin/AllUsers", function(data) {
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
			var that = this;
			var newUser = {};
			newUser.userid = sap.ui.getCore().byId("newUserId").getValue();
			newUser.userName = sap.ui.getCore().byId("newUserName").getValue();
			newUser.emailid = sap.ui.getCore().byId("newEmailId").getValue();
			newUser.phone = sap.ui.getCore().byId("newPhone").getValue();
			this.ajaxPOST("/api/admin/NewUser", newUser, function(response){
				that.getAllUserData();
				toast.show("User Created Successfully!");
			});
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
		},
		onPressDeleteUser : function(oEvent){
			var that = this;
			var userDetails = oEvent.getSource().getParent().getBindingContext("AllUsers").getObject();
			var dialog = new Dialog({
				title: 'Confirm',
				type: 'Message',
				content: new sap.m.Text({ text: 'Are you sure you want to delete user ' + userDetails.userName + ' and his/her roles and permissions?' }),
				beginButton: new sap.m.Button({
					text: 'Delete',
					press: function () {
						that.ajaxDELETE("/api/admin/User/" + userDetails.userid,function(response){
							that.getAllUserData();
							toast.show('User Deleted Successfully!');
							dialog.close();
						});
					}
				}),
				endButton: new sap.m.Button({
					text: 'Cancel',
					press: function () {
						dialog.close();
					}
				}),
				afterClose: function() {
					dialog.destroy();
				}
			});
			dialog.open();
		}
	});
});