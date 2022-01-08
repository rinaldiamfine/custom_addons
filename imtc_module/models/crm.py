# -*- coding: utf-8 -*-

from odoo import models, fields, api, tools, _
from odoo.tools import email_split

class CrmLead(models.Model):
    _inherit = 'crm.lead'

    id_number = fields.Char(string="Identity No.")
    product_id = fields.Many2one('product.product', string="Training Program")

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

            'id_number': self.id_number
        }