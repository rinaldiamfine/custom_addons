odoo.define('report_studio.ReportKanBan', function (require) {
"use strict";

    var core = require('web.core');
    var KanbanRenderer = require('web.KanbanRenderer');
    var KanbanView = require('web.KanbanView');
    var KanbanRecord = require('web.KanbanRecord');


    var KanBanContentRecord = KanbanRecord.extend({
        init: function (parent, state, options) {
            this._super(parent, state, options);
            this.props = options;
        },
        _onGlobalClick: function (ev) {
            const {onClickRecord} = this.props;
            if (onClickRecord) {
                onClickRecord(this.state.data);
            }else {
                this._super(ev);
            }
        },
    });

    var KanBanContentRenderer = KanbanRenderer.extend({
        init: function (parent, state, params) {
            this.fromEdit = parent['name'] == "EditReportKanBan";
            this.config.KanbanRecord = this.fromEdit ? KanBanContentRecord : KanbanRecord;
            this._super(parent, state, params);
            if (this.fromEdit) {
                const {onClickRecord} = parent;
                this.recordOptions.onClickRecord = onClickRecord.bind(parent);
            }
        },
    });

    var KanBanContentView = KanbanView.extend({
        init: function (viewInfo, params) {
            this._super(viewInfo, params);
            this.props = params;
            this.config.Renderer = KanBanContentRenderer;
        }
    });

    return KanBanContentView;

});
