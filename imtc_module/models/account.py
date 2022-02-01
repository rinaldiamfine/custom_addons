# -*- coding: utf-8 -*-

from odoo import models, fields, api, tools, _
from odoo.tools import email_split

class AccountMove(models.Model):
    _inherit = 'account.move'

    def action_print_receipt(self):
        print("GET PRINT RECEIPT")
        # print(flush=True)

    def action_print_payment(self):
        print("GET PRINT PAYMENT")
        # print(flush=True)

    @api.model
    def create(self, values):
        partner_obj = self.env['res.partner']
        res = super(AccountMove, self).create(values)
        if values.get('partner_id'):
            partner_id = partner_obj.sudo().browse(values['partner_id'])
            if partner_id.student_id:
                partner_id.student_id.write({
                    'student_invoice_ids': [(4, res.id)],
                })
        return res

    def action_post(self):
        res = super(AccountMove, self).action_post()
        if self.partner_id.student_id:
            sales_obj = self.env['sale.order']
            assigned_obj = self.env['assigned.student']
            sale_id = sales_obj.sudo().search([('name', '=', self.invoice_origin)])
            if sale_id:
                opportunity_id = sale_id.opportunity_id
                assigned_id = assigned_obj.sudo().create({
                    'student_id': self.partner_id.student_id.id,
                    'student_class_id': opportunity_id.class_id.id,
                })
        return res

    def button_draft(self):
        res = super(AccountMove, self).button_draft()
        if self.partner_id.student_id:
            student_id = self.partner_id.student_id
            sales_obj = self.env['sale.order']
            sale_id = sales_obj.sudo().search([('name', '=', self.invoice_origin)])
            if sale_id:
                opportunity_id = sale_id.opportunity_id
                class_id = opportunity_id.class_id
                for data in class_id.assigned_student_ids:
                    if data.student_id.id == student_id.id:
                        data.unlink()
        return res