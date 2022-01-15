from odoo import fields, models, api


class ReportStudio(models.Model):
    _name = "odo.studio.report"

    xml = fields.Text(string="Xml")
    view_id = fields.Many2one(string="View id", comodel_name="ir.ui.view")
    report_id = fields.Many2one(string="Report Id", comodel_name="ir.actions.report")

    @api.model
    def undo_view(self, report_id):
        if report_id:
            return self.search([['report_id', '=', report_id]]).unlink()
        return False

    @api.model
    def change_report_props(self, data):
        report_action = self.env['ir.actions.report'].browse(data['id'])
        values = {}
        for key, value in data['values'].items():
            if key == "binding_model_id":
                values[key] = report_action.model_id.id if value else False
            elif key == "paperformat_id":
                values[key] = value['id'] if value else False
            elif key == "display_name":
                values["name"] = value
            elif key == "groups_id":
                values[key] = value if value else False
            else:
                values[key] = value
        report_action.write(values)

    @api.model
    def create_new_report(self, values):
        self.env['ir.ui.view']._load_records([dict(xml_id=values.get("xml_id", False), values={
            'name': values.get("name", False),
            'arch': values.get("xml", False),
            'key': values.get("xml_id", False),
            'inherit_id': False,
            'type': 'qweb',
        })])
        model_id = self.env['ir.model'].search([["model", '=', values['model']]]).id
        report = self.env["ir.actions.report"].create({
            'model': values['model'],
            "binding_type": "report",
            "binding_model_id":  model_id,
            "model_id": model_id,
            "name": values['string'],
            "report_file": values['report_file'],
            "report_name": values['report_name'],
            "report_type": "qweb-pdf",
            "type": "ir.actions.report",
            "xml_id": values['report_xml_id']
        })
        return {'id': report.id, 'name': report.name, 'report_name': report.report_name}

    @api.model
    def store_view(self, values):
        templates = values.get("templates", {})
        report_id = values.get("reportId", False)
        if report_id:
            for templateId in templates.keys():
                xml_template = templates[templateId]
                template = self.search([['report_id', '=', report_id], ['view_id', '=', int(templateId)]], limit=1)
                if len(template):
                    template.write({'xml': xml_template})
                else:
                    self.create({'report_id': report_id, 'xml': xml_template, 'view_id': templateId})
        return True

    @api.model
    def get_field_widget(self):
        all_models = self.env.registry.models
        models_name = all_models.keys()
        widgets = {}
        for model_name in models_name:
            if model_name.find("ir.qweb.field.") >= 0:
                widget_name = model_name.replace("ir.qweb.field.", "")
                self.env[model_name].get_available_options()
                widgets[widget_name] = self.env[model_name].get_available_options()

        return widgets


ReportStudio()

