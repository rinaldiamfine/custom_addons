{
    'name': 'Report Designer',
    'summary': 'Report Studio - Report Designer. Customize and Build a Report Template on the fly without any technical knowledge',
    'version': '1.0',
    'category': 'Web',
    'description': """
        Report Studio. Customize and Build a Report Template on the fly without any technical knowledge
    """,
    'author': "apps.odoo.community@gmail.com",
    'depends': ['web', "web_editor"],
    'data': [
        'views/templates.xml',
        'views/report_kanban_view.xml',
        'security/view_dynamic_security.xml',
        'security/ir.model.access.csv',
    ],
    'qweb': [
        'static/src/xml/form_edit.xml',
        'static/src/xml/base.xml',
        'static/src/xml/form_fields.xml',
        'static/src/xml/report_edit.xml',
    ],
    'images': ['images/main_screen.jpg'],
    'price': 200,
    'license': 'OPL-1',
    'currency': 'EUR',
    'installable': True,
    'auto_install': False,
    'application': False,
    'images': [
        'static/description/module_image.jpg',
    ],
}
