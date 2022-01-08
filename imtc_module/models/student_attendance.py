# -*- coding: utf-8 -*-

from odoo import models, fields

class StudentAttendance(models.Model):
    _name = 'student.attendance'
    _description = "Student"

    session_id = fields.Many2one('student.session', string="Session")
    student_id = fields.Many2one('student.student', String="Student")
    is_attendance = fields.Boolean(string="Is Attendance", default=False)
    active = fields.Boolean(string="Is Active", default=True)