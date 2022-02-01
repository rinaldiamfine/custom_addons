# -*- coding: utf-8 -*-

from odoo import models, fields, api, _

class StudentClass(models.Model):
    _name = 'student.class'
    _description = "Student Class"

    name = fields.Char(string="Name")
    state = fields.Selection([('draft', 'Draft'), ('open', 'Open'), ('start', 'Started'), ('finish', 'Finished'), ('cancel', 'Canceled')], default='draft')
    code = fields.Char(string="Code")
    product_id = fields.Many2one('product.product', string="Training Program")
    assigned_student_ids = fields.One2many('assigned.student', 'student_class_id', string="Students")
    session_ids = fields.One2many('student.session', 'class_id', string="Session")
    active = fields.Boolean(string="Is Active", default=True)

    # @api.multi
    def setToDraft(self):
        for data in self:
            data.state = 'draft'
    # @api.multi
    def setToOpen(self):
        for data in self:
            data.state = 'open'
    # @api.multi
    def setToStart(self):
        for data in self:
            data.state = 'start'
    # @api.multi
    def setToFinish(self):
        for data in self:
            data.state = 'finish'
    # @api.multi
    def setToCancel(self):
        for data in self:
            data.state = 'cancel'
    
class AssignedStudent(models.Model):
    _name = 'assigned.student'
    _description = "Assigned Student"
    
    student_class_id = fields.Many2one('student.class', string="Class")
    student_id = fields.Many2one('student.student', string="Student")