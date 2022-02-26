# -*- coding: utf-8 -*-

from odoo import models, fields, api, tools, _
from odoo.tools import email_split

class CrmLead(models.Model):
    _inherit = 'crm.lead'

    id_number = fields.Char(string="Identity No.")
    education = fields.Char("Education")
    product_id = fields.Many2one('product.product', string="Training Program")
    class_id = fields.Many2one('student.class', string="Class")

    def action_claim_crm(self):
        for data in self:
            data.user_id = self.env.user.id
    
    def view_document_files(self):
        for data in self:
            files = self.env['ir.attachment'].sudo().search([('res_id', '=', data.id), ('res_model', '=', 'crm.lead')])
            return {
                "type": "ir.actions.act_window",
                "res_model": "ir.attachment",
                "views": [[False, "kanban"], [False, "form"], [False, "tree"]],
                "domain": [("id", "in", files.ids)],
                # "context": dict(self._context, create=False),
                "context": {'default_res_model': 'crm.lead', 'default_res_id': data.id, 'default_type': 'binary'},
                "name": "Attachment Files",
            }

    @api.onchange('class_id')
    def onchange_class_id(self):
        if self.class_id:
            self.product_id = self.class_id.product_id.id if self.class_id.product_id else False

    @api.model
    def create(self, values):
        if not values.get('name'):
            values['name'] = "Training Registration"
        if values.get('class_id'):
            class_id = self.env['student.class'].browse(values['class_id'])
            values['product_id'] = class_id.product_id.id if class_id.product_id else False
        res = super(CrmLead, self).create(values)
        return res

    def action_new_quotation(self):
        res = super(CrmLead, self).action_new_quotation()
        product_values = {
            'product_id': self.product_id.id,
            'product_uom': self.product_id.product_tmpl_id.id,
            'name': self.product_id.name,
            'product_uom_qty': 1,
            'price_unit': self.product_id.lst_price,
            'tax_id': [(6,0,self.product_id.taxes_id.ids)] if self.product_id.taxes_id else []
        }
        res['context']['default_order_line'] = [(0, 0, product_values)]
        return res

    def _create_lead_partner_data(self, name, is_company, parent_id=False):
        """ extract data from lead to create a partner
            :param name : furtur name of the partner
            :param is_company : True if the partner is a company
            :param parent_id : id of the parent partner (False if no parent)
            :returns res.partner record
        """
        email_split = tools.email_split(self.email_from)
        return {
            'name': name,
            'user_id': self.env.context.get('default_user_id') or self.user_id.id,
            'comment': self.description,
            'team_id': self.team_id.id,
            'parent_id': parent_id,
            'phone': self.phone,
            'mobile': self.mobile,
            'email': email_split[0] if email_split else False,
            'title': self.title.id,
            'function': self.function,
            'street': self.street,
            'street2': self.street2,
            'zip': self.zip,
            'city': self.city,
            'country_id': self.country_id.id,
            'state_id': self.state_id.id,
            'website': self.website,
            'is_company': is_company,
            'type': 'contact',
            
            'education': self.education,
            'id_number': self.id_number
        }