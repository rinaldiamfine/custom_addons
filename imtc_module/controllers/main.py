# # -*- coding: utf-8 -*-
from odoo import http, _
from odoo.http import request
from odoo.addons.survey.controllers.main import Survey
import json
import os
import base64
import werkzeug

class TraineeRegistration(http.Controller):

    @http.route('/registration/', type='http', auth='public', website=True)
    def registrationForm(self, **kw):
        class_obj = request.env['student.class']
        country_obj = request.env['res.country']
        state_obj = request.env['res.country.state']
        class_ids = class_obj.search([('state','=','open')])
        values = {
            'web_title': "Registration - IMTC",
            'class_ids': class_ids,
            'step': 1
        }
        return request.render("imtc_module.portal_registration_form_template", values)

    @http.route('/', http='http', auth='public', website=True)
    def homeView(self, **kw):
        print("GET REGISTRATION")
        values = {}
        return request.render("imtc_module.portal_home_form_template", values)