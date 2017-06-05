sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function(Controller) {
	"use strict";

	return Controller.extend("idpadminIDPAdmin.controller.UserDetailPage", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf idpadminIDPAdmin.view.UserDetailPage
		 */
			onInit: function() {
				this._oComponent = sap.ui.component(sap.ui.core.Component.getOwnerIdFor(this.getView()));
				this._oRouter = this._oComponent.getRouter();
				this._oRouter.getRoute("details").attachMatched(this._onRouteMatched, this);
			},
			_onRouteMatched : function(oEvent){
				
			}
		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf idpadminIDPAdmin.view.UserDetailPage
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf idpadminIDPAdmin.view.UserDetailPage
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf idpadminIDPAdmin.view.UserDetailPage
		 */
		//	onExit: function() {
		//
		//	}

	});

});