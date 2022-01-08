# -*- coding: utf-8 -*-

from odoo import models, fields

class StudentSession(models.Model):
    _name = 'student.session'
    _description = "Student Session"

    name = fields.Char(string="Name")
    start_date = fields.Date(string="Start Date")
    finish_date = fields.Date(string="Finish Date")
    class_id = fields.Many2one('student.class', string="Class")
    student_attendance_ids = fields.One2many('student.attendance', 'session_id', string="Students Attendance")
    active = fields.Boolean(string="Is Active", default=True)