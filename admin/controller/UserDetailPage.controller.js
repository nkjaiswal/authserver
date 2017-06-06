sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function(Controller) {
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

			},
			onPressDeleteAuth : function(oEvent){
				var app = oEvent.getSource().getParent().getBindingContext("apps").getObject();				
			}
	});

});