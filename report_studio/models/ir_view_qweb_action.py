from odoo import models, api, fields


class Http(models.AbstractModel):
    _inherit = 'ir.http'

    def session_info(self):
        result = super(Http, self).session_info()
        if self.env.user.has_group('report_studio.group_report_studio'):
            result['showEdit'] = True
        return result


class IrActionsReport(models.Model):
    _inherit = 'ir.actions.report'

    @api.model
    def render_qweb_html(self, docids, data=None):
        return super(IrActionsReport, self.with_context(REPORT_ID=self.id)).render_qweb_html(docids, data=data)


class IrUiView(models.Model):
    _inherit = "ir.ui.view"

    def read_combined(self, fields=None):
        from_odo_studio = self.env.context.get("from_odo_studio", False)
        res = super(IrUiView, self.with_context(inherit_branding=True) if from_odo_studio else self).read_combined(fields=fields)
        return res

    def read(self, fields=None, load='_classic_read'):
        report_id = self.env.context.get("REPORT_ID", False)
        res = super(IrUiView, self).read(fields=fields, load=load)
        if len(self) == 1 and self.type == "qweb" and report_id:
            template = self.env['odo.studio.report'].search([['view_id', '=', self.id], ['report_id', '=', report_id]], limit=1)
            if len(template):
                for view in res:
                    view['arch'] = template.xml
        return res

    def _pop_view_branding(self, element):
        from_odo_studio = self.env.context.get("from_odo_studio", False)
        if from_odo_studio:
            movable_branding = ['data-oe-model', 'data-oe-id', 'data-oe-field', 'data-oe-xpath', 'data-oe-source-id']
            distributed_branding = dict(
                    (attribute, element.get(attribute)) for attribute in movable_branding if element.get(attribute))
            return distributed_branding
        else:
            return super(IrUiView, self)._pop_view_branding(element)

IrUiView()
