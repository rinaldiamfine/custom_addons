# -*- coding: utf-8 -*-

from odoo import models, fields, api, _

class ResPartner(models.Model):
    _inherit = 'res.partner'

    id_number = fields.Char(string="Identity No.")
    student_id = fields.Many2one('student.student', string="Student")
    education = fields.Char(string="Education")
    # product_id = fields.Many2one('product.product', string="Training Program")

    @api.model
    def create(self, values):
        student_obj = self.env['student.student']
        context = self._context
        student_values = {}
        if context.get('active_model') == 'crm.lead':
            student_values = self.setup_student_values(values, context)
        else:
            student_values = self.setup_student_values(values, context)
        student_id = student_obj.create(student_values)
        values['student_id'] = student_id.id if student_id else False
        res = super(ResPartner, self).create(values)
        return res
    
    def setup_student_values(self, values, context):
        values = {}
        if values.get('id_number'):
            values['id_number'] = values['id_number']
            values['name'] = values['name']
            values['street'] = values['street']
            values['street2'] = values['street2']
            values['city'] = values['city']
            values['state_id'] = values['state_id']
            values['zip'] = values['zip']
            values['country_id'] = values['country_id']
            values['email'] = values['email'] if values.get('email') else values['email_from']
            values['phone'] = values['phone']
            values['education'] = values['education']
        else:
            active_id = context.get('active_id')
            crm_obj = self.env['crm.lead']
            crm_id = crm_obj.browse(active_id)
            attachment_ids = self.env['ir.attachment'].sudo().search([('res_id', '=', crm_id.id), ('res_model', '=', 'crm.lead')])
            values['id_number'] = crm_id.id_number if crm_id else ""
            values['name'] = crm_id.contact_name
            values['education'] = crm_id.education
            values['email'] = crm_id.email_from
            values['phone'] = crm_id.phone
            values['street'] = crm_id.street
            values['street2'] = crm_id.street2
            values['city'] = crm_id.city
            values['zip'] = crm_id.zip
            values['student_attachment_ids'] = [(6, 0, attachment_ids.ids if attachment_ids else [])]
            # ... SKIP FOR NOW
        return values