# # -*- coding: utf-8 -*-
from odoo import http, _
from odoo.http import request
from odoo.addons.survey.controllers.main import Survey
import json
import os
import base64
import werkzeug

class TraineeRegistration(http.Controller):

    @http.route('/trainee/registration/', type='http', auth='public', website=True)
    def traineeRegistrationForm(self, **kw):
        # return "Hello, world"
        values = {}
        return request.render("imtc_module.portal_trainee_registration_form_template", values)

    # @http.route(['/my/payment/<int:payment_id>'], type='http', auth="public", website=True)
    # def portal_my_rfq_form(self, payment_id,report_type=None,access_token=None,message=False,download=False,**kw):