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
    start_date = fields.Date(string="Start Date")
    end_date = fields.Date(string="End Date")
    active = fields.Boolean(string="Is Active", default=True)

    def auto_schedule_class(self):
        class_ids = self.env['student.class'].search([('state', 'in', ('open', 'start'))])
        for class_id in class_ids:
            if class_id.start_date and class_id.end_date:
                if class_id.state == 'open':
                    if class_id.start_date <= fields.Date.today():
                        class_id.state = 'start'
                else:
                    if class_id.end_date <= fields.Date.today():
                        class_id.state = 'finish'

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