# -*- coding: utf-8 -*-

from odoo import models, fields, api, _

class Student(models.Model):
    _name = 'student.student'
    _description = "Student"

    id_number = fields.Char(String="Identity No.", required=True)
    name = fields.Char(string='Name')
    education = fields.Char(string="Education")
    photo = fields.Binary(string='Photo')
    email = fields.Char(string='Email')
    phone = fields.Char(string='Phone')
    is_membership = fields.Boolean(string="Is Membership", default=False)
    active = fields.Boolean(string="Is Active", default=True)

    street = fields.Char(string="Street...")
    street2 = fields.Char(string="Street 2...")
    city = fields.Char(string="City")
    state_id = fields.Many2one('res.country.state', string="State")
    zip = fields.Char(string="ZIP")
    country_id = fields.Many2one('res.country', string="Country")
    
    student_class_ids = fields.One2many('assigned.student', 'student_id', string="Class")
    student_invoice_ids = fields.Many2many('account.move', string="Invoices")
    student_attachment_ids = fields.Many2many('ir.attachment', string="Attachments")

    _sql_constraints = [
        (
            "id_number_uniq",
            "unique(id_number)",
            (
                "A student with the same identity number has been created before!"
            ),
        )
    ]

    # @api.multi
    def toggleMembership(self):
        for data in self:
            data.is_membership = not (data.is_membership)