# # -*- coding: utf-8 -*-
from odoo import http, _
from odoo.http import request
from odoo.addons.survey.controllers.main import Survey
import json
import os
import base64
import werkzeug

class TraineeRegistration(http.Controller):
    @http.route('/action/registration/manager', type='json', auth='public')
    def actionRegistrationManager(self, obj, **kw):
        res = {
            'status': False,
            'msg': 'Registrasi gagal, Silahkan coba lagi!'
        }
        return res

    @http.route('/registration', type='http', auth='public', website=True)
    def registrationForm(self, **kw):
        map_product_ids = []
        class_obj = request.env['student.class']
        # product_obj = request.env['product.product']
        country_obj = request.env['res.country']
        state_obj = request.env['res.country.state']
        class_ids = class_obj.search([('state','=','open')])
        # product_ids = product_obj.search([('active','=',True), ('is_course','=',True)])
        course_ids = class_obj.sudo().search([('state','in',('draft', 'open'))])
        temp_course= []
        count_course = 0
        PPL = 2 #START FROM 0
        for course in course_ids:
            temp_course.append(course)
            count_course += 1
            if len(temp_course) > PPL:
                map_product_ids.append(temp_course)
                temp_course = []
            if len(course_ids) == count_course:
                map_product_ids.append(temp_course)
        values = {
            'web_title': "Registration",
            'class_ids': class_ids,
            'step': 1,
            'product_ids': map_product_ids,
        }
        return request.render("imtc_module.portal_registration_form_template", values)

    @http.route('/', http='http', auth='public', website=True)
    def homeView(self, **kw):
        print("GET REGISTRATION")
        values = {}
        return request.render("imtc_module.portal_home_form_template", values)

    @http.route('/about', http='http', auth='public', website=True)
    def aboutView(self, **kw):
        values = {}
        return request.render("imtc_module.portal_about_form_template", values)