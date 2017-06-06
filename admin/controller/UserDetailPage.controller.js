sap.ui.define([
	"sap/m/MessageToast",
	"sap/ui/core/mvc/Controller"
], function(toast,Controller) {
	"use strict";

	return Controller.extend("idpadminIDPAdmin.controller.UserDetailPage", {

			ajaxGET : function (url,callback){
				$.ajax({
					url: url,
					dataType: "json",
					success: function(response) {
						callback(response);
					}
				});
			},
			ajaxPUT : function (url,data,callback){
				$.ajax({
					url: url,
					type: "PUT",
					data: data,
					dataType: "json",
					contentType: "application/json",
					success: function(response) {
						callback(response);
					}
				});
			},
			onInit: function() {
				this._oComponent = sap.ui.component(sap.ui.core.Component.getOwnerIdFor(this.getView()));
				this._oRouter = this._oComponent.getRouter();
				this._oRouter.getRoute("details").attachMatched(this._onRouteMatched, this);
			},
			_onRouteMatched : function(oEvent){
				this.userid = oEvent.getParameter("arguments").userid;
				this.refreshPage();
			},
			refreshPage : function(){
				var that = this;
				this.ajaxGET("/api/admin/User/" + this.userid,function(response){
					
					var oModel = new sap.ui.model.json.JSONModel();
					oModel.setData(response.apps);
					that.getView().setModel(oModel, "apps");
					that.apps = response.apps;
					if(!that.apps)
						that.apps = [];
					var userInfo = {}
					userInfo.userid = response.userid;
					userInfo.emailid = response.emailid;
					userInfo.phone = response.phone;
					userInfo.userName = response.userName;
					var oModel2 = new sap.ui.model.json.JSONModel();
					oModel2.setData(userInfo);
					that.getView().setModel(oModel2, "userInfo");
				});
			},
			onPressEditAuth : function(oEvent){
				var app = oEvent.getSource().getParent().getBindingContext("apps").getObject();
				toast.show("Not Implemented!!!")
			},
			onPressDeleteAuth : function(oEvent){
				var app = oEvent.getSource().getParent().getBindingContext("apps").getObject();		
				for(var i=0; i<this.apps.length; i++){
					if(this.apps[i].name == app.name){
						break;
					}
				}
				this.apps.splice(i,1);
				this.updateAppModel();
			},
			onPressAddApp : function(oEvent){
				if (!this._newApp) {
					this._newApp = sap.ui.xmlfragment(
						"idpadminIDPAdmin.fragment.AddApp",
						this
					);
					this.getView().addDependent(this._newApp);
				}
				sap.ui.getCore().byId("newAppId").setValue("");
				sap.ui.getCore().byId("newRoles").setValue("");
				sap.ui.getCore().byId("newPermissions").setValue("");
				this._newApp.open();
			},
			onPressCancel : function(oEvent){
				oEvent.getSource().getParent().close();
			},
			onPressAddNewApp : function(oEvent){
				var name = sap.ui.getCore().byId("newAppId").getValue();
				var roles = sap.ui.getCore().byId("newRoles").getValue().split(",");
				var permissions = sap.ui.getCore().byId("newPermissions").getValue().split(",");
				this.apps.push({
					name : name,
					roles:roles,
					permission : permissions
				});
				this.updateAppModel();
				oEvent.getSource().getParent().close();
			},
			updateAppModel : function(){
				var oModel = new sap.ui.model.json.JSONModel();
				oModel.setData(this.apps);
				this.getView().setModel(oModel, "apps");
			},
			onPressSave : function(){
				var that = this;
				this.ajaxPUT("/api/admin/User/" + this.userid + "/apps",JSON.stringify(this.apps),function(response){
					toast.show("Authorization Updated Successfully!");
					that.refreshPage();
				});
			}
	});

});