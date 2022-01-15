odoo.define('report_studio.ReportContent', function (require) {
"use strict";

    var core = require('web.core');
    var Base = require('report_studio.BaseEdit');
    var KanbanView = require('web.KanbanView');
    var KanbanRenderer = require('web.KanbanRenderer');
    var KanbanView = require('web.KanbanView');
    var KanbanRecord = require('web.KanbanRecord');
    var session = require('web.session');
    var Widget = require('web.Widget');

    var ReportKanBan = require('report_studio.ReportKanBan');
    var Base = require('report_studio.BaseEdit');
    var QWeb = core.qweb;


    var ReportView = Widget.extend({
        template: "EditReport.ReportView",
        init: function (parent, params) {
            this._super(parent, params);
            this.props = params;
        },
        onClickPrint: function () {
            const {reportParams, action_manager} = this.props, reportUrl = this._makeReportUrls(reportParams);
            return action_manager._downloadReport(reportUrl['pdf']).then(function () {
            });
        },
        bindAction: function () {
            this.$el.find(".btnPrint").click(this.onClickPrint.bind(this));
        },
        _makeReportUrls: function (action) {
            let reportUrls = {
                html: '/report/html/' + action.report_name,
                pdf: '/report/pdf/' + action.report_name,
                text: '/report/text/' + action.report_name,
            };
            var activeIDsPath = '/' + action.context.active_ids.join(',');
            reportUrls = _.mapObject(reportUrls, function (value) {
                return value += activeIDsPath;
            });
            reportUrls.html += '?context=' + encodeURIComponent(JSON.stringify(action.context));
            reportUrls.pdf += '?context=' + encodeURIComponent(JSON.stringify(action.context));
            reportUrls.text += '?context=' + encodeURIComponent(JSON.stringify(action.context));
            return reportUrls;
        },
        renderView: function () {
            let self = this;
            const {bindSortable, action_manager, reportParams, bindAction, onReportToDom} = this.props;
            reportParams.context.from_odo_studio = true;
            const reportUrl = this._makeReportUrls(reportParams);
            $.get(reportUrl.html, {},
                function(data) {
                    let report = $(data);
                    self.$el.find('._wContent').append(report.find("main"));
                    if (self.$el.find("div.page").children().length <= 1) {
                        self.$el.find("div.page").addClass("noChild");
                    }
                    bindSortable(self.$el.find("._wContent"));
                    // self.$el.find('._wFrame').empty();
                    bindAction();
                    if (onReportToDom) {
                        onReportToDom();
                    }
                }
            );
        },
        reload: function () {
            this.renderElement();
        },
        renderElement: function () {
            this._super();
            this.renderView();
            this.bindAction();
        }
    });

    var ChooseTemplateDialog = Widget.extend({
        template: "EditReport.ChooseTemplate",
        init: function (parent, params) {
            this._super(parent, params);
            this.props = params;
        },
        onClickItem: function (type) {
            const {onClickTemplate} = this.props;
            if (onClickTemplate) {
                onClickTemplate(type.template);
                this.onClose();
            }
        },
        onClose: function () {
            this.$el.remove();
        },
        bindAction: function () {
            this.$el.find(".closeCT").click(this.onClose.bind(this));
        },
        renderView: function () {
            let reportType = [{label: "External", description: "Business header/footer", template: "ReportEdit.Template.External"},
                {label: "Internal", description: "Minimal header/footer", template: "ReportEdit.Template.Internal"},
                {label: "Blank", description: "No header/footer", template: "ReportEdit.Template.Blank"}];
            reportType.map((type) => {
                let item = $(QWeb.render("EditReport.TemType", type));
                item.click(() => this.onClickItem(type));
                this.$el.find(".wCC").append(item);
            });
        },
        reload: function () {
            this.renderElement();
        },
        renderElement: function () {
            this._super();
            this.renderView();
            this.bindAction();
        }
    });


    var ReportContent = Base.ContentBase.extend({
        name: "EditReportKanBan",
        template: 'EditReport.KanBan',
        start: function () {
            this._super();
            const {action} = this.props;
            this.state.viewType = "kan";
            this.action = action;
            this.reportData = null;
            this.sortData = [["tr", "tr"]];
            this.urlState = $.bbq.getState(true);
        },
        bindAction: function () {
            this.$el.find("[data-oe-xpath], [path-xpath]").click(this.onClickNode.bind(this));
            this.$el.find(".btnCreate").click(this.createReport.bind(this));
        },
        bindStyle: function () {
            const {viewType} = this.state;
            if (viewType !== "kan") {
                $("._wIBi, ._editProperty").removeClass("hide");
                $(".wCreateReport").addClass("hide");
            }else {
                $("._wIBi, ._editProperty").addClass("hide");
            }
        },
        createReport: function() {
            let chooseTemplate = new ChooseTemplateDialog(this, {onClickTemplate: this.onClickTemplate.bind(this)});
            chooseTemplate.renderElement();
            $("body").append(chooseTemplate.$el);
        },
        onCompleteCreate: function (data) {
            this.onClickRecord(data);
        },
        onClickTemplate: function (template) {
            const {onCreateTemplate} = this.props;
            let elTemplate = QWeb.templates[template].children[0].children[0];
            elTemplate = elTemplate.cloneNode(true);
            if (onCreateTemplate) {
                onCreateTemplate(new XMLSerializer().serializeToString(elTemplate), this.onCompleteCreate.bind(this));
            }
        },
        onClickRecord: function (recordData) {
            this.reportData = recordData;
            this.setState({viewType: "view"});
            this.renderElement();
        },
        onClickNode: function (e) {
            e.stopPropagation();
            let el = $(e.currentTarget);
            // let el = $(e.target);
            const {onClickNode} = this.props;
            onClickNode(el);
        },
        reloadReport: function () {
            this.ref.content.reload();
        },
        renderReportView: function () {
            const self = this, {model, id} = this.urlState, reportParams = {...this.reportData, context: {...this.action.context, active_id: 7,
                    active_ids: [4], active_model: model}};
            this['_rpc']({
                model: model,
                method: 'search_read',
                fields: ['id'],
                domain: []
            }).then((function (result) {
                if (result.length) {
                    reportParams.context.active_id = id || result[0].id;
                    reportParams.context.active_ids = [id || result[0].id];
                    let reportView = new ReportView(self, {
                        ...self.props, bindAction: self.bindAction.bind(self), reportParams: reportParams
                    });
                    self.ref.content = reportView;
                    reportView.renderElement();
                    self.$el.append(reportView.$el);
                }else {
                    alert("No Record to load!. Pls create a record before edit pdf template.")
                }
            }));
        },
        renderKanBanView: function () {
            let self = this;
            const {context, limit, res_model, filter} = this.action, {viewInfo} = this.props, {model} = this.urlState;
            let params = {
                ...this.props,
                action: this.action,
                onClickRecord: this.onClickRecord.bind(this),
                context: context,
                domain: [['model', '=', model]],
                groupBy: [],
                limit: limit,
                filter: filter || [],
                modelName: res_model,
            };
            let kanBanView = new ReportKanBan(viewInfo, params);
            kanBanView.withControlPanel = false;
            kanBanView.withSearchPanel = false;
            kanBanView.getController(self).then(function (widget) {
                widget.appendTo(self.$el);
            });
            this.ref.content = kanBanView;
        },
        renderView: function () {
            if (this.state.viewType == "kan") {
                this.renderKanBanView();
            }else {
                this.renderReportView();
            }
            this.bindAction();
            this.bindStyle();
        },
    });

    return ReportContent;

});
