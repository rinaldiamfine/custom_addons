# -*- coding: utf-8 -*-

from odoo import models, fields, api, tools, _
from odoo.tools import email_split

class CrmLead(models.Model):
    _inherit = 'account.move'

    def action_print_receipt(self):
        print("GET PRINT RECEIPT")
        print(flush=True)

    def action_print_payment(self):
        print("GET PRINT PAYMENT")
        print(flush=True)

