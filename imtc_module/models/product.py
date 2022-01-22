# -*- coding: utf-8 -*-

from odoo import models, fields, api, tools, _

class ProductTemplate(models.Model):
    _inherit = 'product.template'

    is_course = fields.Boolean(string="Is Course", default=False)
