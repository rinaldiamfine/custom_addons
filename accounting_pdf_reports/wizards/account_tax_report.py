# -*- coding: utf-8 -*-

from odoo import models
from logging import getLogger


LOGGER = getLogger(__name__)

class AccountTaxReport(models.TransientModel):
    _inherit = "account.common.report"
    _name = 'account.tax.report'
    _description = 'Tax Report'

    def _print_report(self, data):
        LOGGER.info(data)
        return self.env.ref('accounting_pdf_reports.action_report_account_tax').report_action(self, data=data)
