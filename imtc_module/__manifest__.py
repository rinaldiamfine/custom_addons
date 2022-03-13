# -*- coding: utf-8 -*-
{
    'name': "IMTC",

    'summary': 'Training Management System',

    'description': """
        
    """,

    'author': "Rinaldi",
    'website': "https://rinaldiamfine.herokuapp.com",
    'category': 'Administration',
    'version': '13.1.0.1',
    'installable': True,
    'license': 'LGPL-3',

    'depends': [
        'base',
        'crm',
        'sale_crm',
        'sale',
        'purchase',
        'account',
        'l10n_id',
        'website'
    ],
    'data': [
        'views/res_partner_view.xml',
        'views/account_view.xml',
        'views/crm_view.xml',
        'views/brochure_view.xml',
        'views/student_view.xml',
        'views/student_attendance_view.xml',
        'views/student_class_view.xml',
        'views/product_view.xml',
        'views/student_session_view.xml',
        'views/menuitem_view.xml',
        'views/res_group_view.xml',
        'views/menuitem_base_view.xml',

        'views/class_cron_view.xml',

        'website/base.xml',
        'website/home_view.xml',
        'website/about_view.xml',
        'website/registration_view.xml',

        'report/report_templates.xml',
        'report/report_trial_balance.xml',
        'report/report_partner_ledger.xml',
        'report/report_general_ledger.xml',
        'report/report_journal_audit.xml',
        'report/report_financial.xml',
        'report/report_aged_partner.xml',
        'report/report_tax.xml',
        
        'report/paper_format.xml',
        'report/report_bukti_pembayaran.xml',
        'report/report_bukti_penerimaan.xml',

        'report/report_sale.xml',
        'report/report_purchase.xml',
        'report/report_invoice.xml',
        
        "security/ir.model.access.csv"
    ],
}
