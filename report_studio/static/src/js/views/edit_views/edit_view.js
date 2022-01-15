odoo.define('report_studio.EditView', function (require) {
"use strict";

    var core = require('web.core');
    var ReportKanBan = require("report_studio.ReportKanBan");
    var ReportEdit = require("report_studio.ReportEdit");

    var BasicModel = require('web.BasicModel');

    var mixins = require('web.mixins');
    var BasicView = require('web.BasicView');
    var ActionManager = require('web.ActionManager');
    var session = require('web.session');

    var QWeb = core.qweb;
    var Widget = require('web.Widget');

    var EditBasicView = BasicView.extend({
        init: function (parent, params) {}
    });

    var EditViewModel = BasicModel.extend({
        createNewView: function (data) {
            return this['_rpc']({
                model: "odo.studio",
                method: 'create_new_view',
                args: [data],
                kwargs: {},
            });
        },
        onActionView: function (data, save=true) {
            this['_rpc']({
                model: data.model,
                method: save ? 'store_view' : 'undo_view',
                args: [data.data],
                kwargs: {},
            }).then(function (result) {
                alert("Successfully");
                location.reload();
            });
        },
        getFieldsData: function (modelName) {
            return this['_rpc']({
                model: "odo.studio",
                method: 'get_fields',
                args: [modelName],
                kwargs: {},
            });
        },
        onStoreView: function (data) {
            this.onActionView(data);
        },
        onUndoView: function (data) {
            this.onActionView(data, false);
        }
    });

    var EditView = Widget.extend(mixins.EventDispatcherMixin, {
        template: 'EditView',
        events: {
            'click ._headEdit .fa-close': 'onClose',
            'click ._headEdit .fa-minus': 'onMinus',
            'click ._headEdit .fa-expand': 'onExpand',
            'click ._aSave': 'onSaveView',
            'click ._aUndo': 'onRemoveView',
            'click ._aRemove': 'onRemoveNode',
            'click ._aStore': '_onStoreToDatabase',
        },
        init: function(parent, params) {
            this._super(parent);
            this.props = params;
            this.start();
        },
        start: function () {
            this.ref = {};
            this.viewParent = this;
            this.appState = $.bbq.getState(true);
            this.basicView = new EditBasicView(this.viewParent, {});
            this.model = new EditViewModel(this.viewParent);
            this._processFieldsView = this.basicView._processFieldsView.bind(this.basicView);
            const viewType = this.appState.view_type;
            this.state = {};
        },
        setState: function (params) {
            Object.keys(params).map((key) => {
                this.state[key] = params[key];
            });
        },
        onClose: function () {
            this.$el.remove();
            this.trigger_up("reset_edit_instance");
        },
        onMinus: function () {
            if (this.$el.hasClass("minus")) {
                this.$el.removeClass("minus");
                this.baseToEdit();
            } else {
                this.$el.addClass("minus");
                this.editToBase();
            }
        },
        onExpand: function () {
            this.$el.hasClass("expand") ? this.$el.removeClass("expand") : this.$el.addClass("expand");
        },
        onSaveView: function () {
            this.model.onStoreView(this.getViewData());
        },
        onRemoveView: function () {
            const {typeEdit} = this.state;
            this.model.onUndoView(typeEdit == "views" ? this.getViewData() : this.getReportData());
        },
        onRemoveNode: function (e) {
            e.stopPropagation();
            this.ref.view.onRemoveNode();
        },
        bindStyle: function () {
            $("._wIBi, ._editProperty").removeClass("hide");
        },
        bindAction: function () {
            this.$el.find("._wSubView").click(this.closeSubView.bind(this));
            this.$el.find("._aRemove").click(this.onRemoveNode.bind(this));
        },
        getReportData: function () {
            const params = {};
            params.model = "odo.studio.report";
            params.data = this.ref.view.getReportId();
            return params;
        },
        reloadProperty: function () {
            this.$el.find('._editProperty ._cCeP').empty().append(this.ref.view.ref.property.$el);
        },
        renderView: function () {
            let self = this, action_manager = new ActionManager(this.viewParent, session.user_context);
            action_manager.isInDOM = true;
            action_manager._loadAction("base.ir_action_report", {}).then(function (action) {
                action_manager._preprocessAction(action, {});
                action_manager._loadViews(action).then((fieldsViews) => {
                    const viewInfo = self._processFieldsView(fieldsViews["kanban"], "kanban");
                    let reportEdit = new ReportEdit(self.viewParent,
                        {action: action, action_manager: action_manager, reloadProperty: self.reloadProperty.bind(self),
                            viewInfo: {...viewInfo, fields: {...viewInfo.fields}}});
                    reportEdit.attachTo(self.$el.find('._editView')).then(function () {
                        self.$el.find('._editView ._wMainView').empty().append(reportEdit._renderContent());
                        self.$el.find('._editProperty ._cCeP').empty().append(reportEdit._renderProperty());
                    });
                    self.ref.view = reportEdit;
                });
            });
        },
        renderElement: function () {
            this._super();
            this.renderView();
        }
    });

    return EditView;
});
