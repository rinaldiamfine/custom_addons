odoo.define('report_pdf_preview.report', function (require) {
    'use strict';

    var ActionManager = require('web.ActionManager');
    var framework = require('web.framework');

    var PreviewDialog = require('report_pdf_preview.PreviewDialog');
    /**
     * JULEB CUSTOMISATION
     * Disable report pdf preview if it's on POS.UI Session
     */

    ActionManager.include({
        _executeReportAction: function (action, options) {
            var self = this;
            action = _.clone(action);
            var currentTag = this.getCurrentAction().tag;
            if (action.report_type === 'qweb-pdf' && currentTag != 'pos.ui' && !['JMS Format', 'Government Invoice'].includes(action.name)) {
                return this.call('report', 'checkWkhtmltopdf').then(function (state) {
//                    var active_ids_path = '/' + action.context.active_ids.join(',');
                    // var url = '/report/pdf/' + action.report_name + active_ids_path;
                    var url = self._makeReportUrls(action)['pdf'];
                    var filename = action.report_name;
                    var title = action.display_name;
                    var def = $.Deferred()
                    var dialog = PreviewDialog.createPreviewDialog(self, url, false, "pdf", title);
                    $.when(dialog, dialog._opened).then(function (dialog) {
                        var a = 1;
                        dialog.$modal.find('.preview-download').hide();

                    })
                    framework.unblockUI();
                });

            } else {
                return self._super(action, options);
            }

        }
    });

});