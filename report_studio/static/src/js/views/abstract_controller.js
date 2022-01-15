odoo.define('report_studio.AbstractController', function (require) {
"use strict";

    var core = require('web.core');
    var AbstractController = require('web.AbstractController');
    var AbstractView = require('web.AbstractView');
    var EditView = require('report_studio.EditView');

    var QWeb = core.qweb;


    AbstractController.include({
        init: function (parent, model, renderer, params) {
            this._super.apply(this, arguments);
            this.fieldsView = params.fieldsView || {};
            this._processFieldsView = params._processFieldsView || false;
        },
        _renderSwitchButtons: function () {
            let res = this._super();
            let session = this.getSession() || {};
            if (session['showEdit']) {
                this._renderEditMode(res);
            }
            return res;
        },
        _renderEditMode: function (container) {
            const $editMode = $(QWeb.render("EditView.iconMore", this)),
                webClient = this.getParent().getParent();
            container.push($editMode[0]);
            $editMode.click(() => {
                let newView = new EditView(this, {modelName: this.modelName});
                newView.renderElement();
                webClient.editInstance = newView;
                this.getParent().$el.find(".o_content").append(newView.$el);
            });
        }
    });

    AbstractView.include({
        init: function (viewInfo, params) {
            this._super(viewInfo, params);
            this.controllerParams.fieldsView = this.fieldsView;
            this.controllerParams._processFieldsView = this._processFieldsView.bind(this);
        }
    });
});
