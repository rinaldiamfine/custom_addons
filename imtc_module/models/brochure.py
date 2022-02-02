# -*- coding: utf-8 -*-

from odoo import models, fields, api, tools, _

class Brochure(models.Model):
    _name = 'brochure.brochure'
    _description = "Brochure"

    name = fields.Char(string="Name")
    description = fields.Text(string="Description")
    file = fields.Binary(string="File")
    is_share = fields.Boolean(string="Share", default=False)
    active = fields.Boolean(string="Is Active", default=True)

    def toogle_share(self):
        for data in self:
            data.is_share = not (data.is_share)