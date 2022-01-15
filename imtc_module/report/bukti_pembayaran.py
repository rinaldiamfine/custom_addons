from odoo import models, fields, api, _

class BuktiPembayaran(models.AbstractModel):
    _name = 'report.imtc_module.report_bukti_pembayaran'
    _description = 'Bukti Pembayaran'

    @api.model
    def _get_report_values(self, docids, data=None):
        list_data = []
        company_id = self.env.company
        print(docids, "GET DOCS IDS")
        print(flush=True)
        accounts = self.env['account.move'].browse(docids)
        for account in accounts:
            data = {}
            data.update({
                'name': account.name,
            })
            list_data.append(data)
        data.update({
            'doc_ids': docids,
            'datas': list_data
        })
        return data

    # def render_html(self,data=None):
    #     report_obj = self.env['report']
    #     report = report_obj._get_report_from_name('imtc_module.report_bukti_pembayaran')

    #     # your report data structure goes in data_array
    #     data_array = []
    #     docargs = {
    #         'hold_data_array': data_array,
    #     }
    #     # here we will pass the report data into our report template
    #     return report_obj.render('imtc_module.report_bukti_pembayaran', docargs)