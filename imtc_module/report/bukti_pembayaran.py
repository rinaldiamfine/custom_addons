from odoo import models, fields, api, _

ones = {
    0: '', 1: 'satu', 2: 'dua', 3: 'tiga', 4: 'empat', 5: 'lima', 6: 'enam',
    7: 'tujuh', 8: 'delapan', 9: 'sembilan', 10: 'sepuluh', 11: 'sebelas', 12: 'dua belas',
    13: 'tiga belas', 14: 'empat belas', 15: 'lima belas', 16: 'enam belas',
    17: 'tujuh belas', 18: 'delapan belas', 19: 'sembilan belas'}
tens = {
    2: 'dua puluh', 3: 'tiga puluh', 4: 'empat puluh', 5: 'lima puluh', 6: 'enam puluh',
    7: 'tujuh puluh', 8: 'delapan puluh', 9: 'sembilan puluh'}
illions = {
    1: 'ribu', 2: 'juta', 3: 'miliar', 4: 'triliun'}

class BuktiPembayaran(models.AbstractModel):
    _name = 'report.imtc_module.report_bukti_pembayaran'
    _description = 'Bukti Pembayaran'

    @api.model
    def _get_report_values(self, docids, data=None):
        list_data = []
        company_id = self.env.company
        # accounts = self.env['account.move'].browse(docids)
        payments = self.env['account.payment'].browse(docids)
        for payment in payments:
            data = {}
            word = self.say_number(payment.amount).capitalize()
            account_ids = self.env['account.move'].search([('name', '=', payment.communication)])
            detail_payment_ids = []
            for account in account_ids:
                for line in account.invoice_line_ids:
                    detail_payment_ids.append(line)
            data.update({
                'name': payment.name,
                'word_amount': word + ' rupiah',
                'detail_payment_ids': detail_payment_ids
            })
            list_data.append(data)
            
        data.update({
            'docs': payments,
            'doc_ids': docids,
            'datas': list_data,
            'company_id': company_id,
        })
        return data

    def say_number(self, i):
        """
        Convert an integer in to it's word representation.

        say_number(i: integer) -> string
        """
        if i < 0:
            return self._join('negative', self._say_number_pos(-i))
        if i == 0:
            return 'nol'
        return self._say_number_pos(i)


    def _say_number_pos(self, i):
        if i < 20:
            return ones[i]
        if i < 100:
            return self._join(tens[i // 10], ones[i % 10])
        if i < 1000:
            return self._divide(i, 100, 'ratus')
        for illions_number, illions_name in illions.items():
            if i < 1000**(illions_number + 1):
                break
        return self._divide(i, 1000**illions_number, illions_name)


    def _divide(self, dividend, divisor, magnitude):
        return self._join(
            self._say_number_pos(dividend // divisor),
            magnitude,
            self._say_number_pos(dividend % divisor),
        )


    def _join(self, *args):
        return ' '.join(filter(bool, args))