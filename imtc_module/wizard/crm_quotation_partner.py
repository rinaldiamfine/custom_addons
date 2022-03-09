# -*- coding: utf-8 -*-
# Part of Odoo. See LICENSE file for full copyright and licensing details.

from odoo import api, fields, models, _
from odoo.exceptions import UserError


class Opportunity2Quotation(models.TransientModel):
    _inherit = 'crm.quotation.partner'

    @api.model
    def default_get(self, fields):
        result = super(Opportunity2Quotation, self).default_get(fields)
        return result

    action = fields.Selection(string='Quotation Customer', default='create')
    lead_id = fields.Many2one('crm.lead', "Associated Lead", required=True)

    def check_students(self):
        student_obj = self.env['student.student']
        student_ids = student_obj.search([('id_number', '=', self.lead_id.id_number)])
        if len(student_ids)>0:
            return student_ids[0]
        else:
            return False

    def action_apply(self):
        student_id = self.check_students()
        if student_id:
            raise UserError(_('Student with this identity number already exists!\nThis student is registered by user %s' % student_id.create_uid.name))
        else:
            result = super(Opportunity2Quotation, self).action_apply()
            return result

    def _create_partner(self):
        """ Create partner based on action.
            :return int: created res.partner id
        """
        self.ensure_one()
        result = self.lead_id.handle_partner_assignation(action='create')
        return result.get(self.lead_id.id)

