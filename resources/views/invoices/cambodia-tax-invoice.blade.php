<!DOCTYPE html>
<html lang="km">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>វិក្កយប័ត្រ / Invoice - {{ $invoice->invoice_number }}</title>
    <style>
        @page {
            margin: 20mm 15mm;
            size: A4 portrait;
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'DejaVu Sans', sans-serif;
            font-size: 10pt;
            line-height: 1.4;
            color: #000;
        }

        .container {
            width: 100%;
            max-width: 210mm;
        }

        /* Header */
        .header {
            text-align: center;
            margin-bottom: 15mm;
            border-bottom: 2px solid #000;
            padding-bottom: 5mm;
        }

        .company-name-km {
            font-size: 16pt;
            font-weight: bold;
            margin-bottom: 2mm;
        }

        .company-name-en {
            font-size: 12pt;
            font-weight: bold;
            margin-bottom: 3mm;
        }

        .company-details {
            font-size: 9pt;
            line-height: 1.3;
        }

        .tin {
            font-weight: bold;
            margin-top: 2mm;
        }

        /* Invoice Title */
        .invoice-title {
            text-align: center;
            margin-bottom: 8mm;
        }

        .invoice-title-km {
            font-size: 18pt;
            font-weight: bold;
            margin-bottom: 1mm;
        }

        .invoice-title-en {
            font-size: 14pt;
            font-weight: bold;
        }

        /* Invoice Info */
        .invoice-info {
            margin-bottom: 8mm;
            width: 100%;
        }

        .invoice-info table {
            width: 100%;
        }

        .invoice-info td {
            padding: 2mm 0;
            vertical-align: top;
        }

        .invoice-info .label {
            font-weight: bold;
            width: 30%;
        }

        /* Bill To Section */
        .bill-to {
            margin-bottom: 8mm;
            padding: 3mm;
            border: 1px solid #000;
        }

        .bill-to-title {
            font-weight: bold;
            font-size: 11pt;
            margin-bottom: 2mm;
        }

        /* Items Table */
        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 8mm;
        }

        .items-table th,
        .items-table td {
            border: 1px solid #000;
            padding: 3mm 2mm;
            text-align: left;
        }

        .items-table th {
            background-color: #f0f0f0;
            font-weight: bold;
            font-size: 9pt;
        }

        .items-table .text-right {
            text-align: right;
        }

        .items-table .text-center {
            text-align: center;
        }

        /* Totals */
        .totals {
            width: 60%;
            margin-left: auto;
            margin-bottom: 10mm;
        }

        .totals table {
            width: 100%;
            border-collapse: collapse;
        }

        .totals td {
            padding: 2mm;
            border-bottom: 1px solid #ddd;
        }

        .totals .label {
            font-weight: bold;
            width: 50%;
        }

        .totals .amount {
            text-align: right;
            width: 50%;
        }

        .totals .grand-total {
            font-size: 11pt;
            font-weight: bold;
            border-top: 2px solid #000;
            border-bottom: 2px solid #000;
        }

        /* Footer */
        .footer {
            margin-top: 15mm;
            text-align: center;
            font-size: 9pt;
            border-top: 1px solid #000;
            padding-top: 3mm;
        }

        .thank-you {
            font-weight: bold;
            margin-bottom: 2mm;
        }

        /* Print styles */
        @media print {
            body {
                background: white;
            }
            .no-print {
                display: none;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <div class="company-name-km">{{ $settings['company_name_km'] }}</div>
            <div class="company-name-en">{{ $settings['company_name_en'] }}</div>
            <div class="company-details">
                <div>{{ $settings['company_address_km'] }}</div>
                <div>{{ $settings['company_address_en'] }}</div>
                @if($settings['company_phone'])
                    <div>លេខទូរសព្ទ / Phone: {{ $settings['company_phone'] }}</div>
                @endif
                @if($settings['company_email'])
                    <div>អ៊ីមែល / Email: {{ $settings['company_email'] }}</div>
                @endif
                @if($settings['company_tin'])
                    <div class="tin">លេខសម្គាល់អ្នកជាប់ពន្ធ / Tax ID (TIN): {{ $settings['company_tin'] }}</div>
                @endif
            </div>
        </div>

        <!-- Invoice Title -->
        <div class="invoice-title">
            <div class="invoice-title-km">វិក្កយប័ត្រអាករ</div>
            <div class="invoice-title-en">TAX INVOICE</div>
        </div>

        <!-- Invoice Info -->
        <div class="invoice-info">
            <table>
                <tr>
                    <td class="label">លេខវិក្កយប័ត្រ / Invoice No.:</td>
                    <td><strong>{{ $invoice->invoice_number }}</strong></td>
                    <td class="label">កាលបរិច្ឆេទ / Date:</td>
                    <td><strong>{{ $invoice->invoice_date->format('d/m/Y') }}</strong></td>
                </tr>
                <tr>
                    <td class="label">វិធីទូទាត់ / Payment Method:</td>
                    <td colspan="3">{{ ucfirst(str_replace('_', ' ', $invoice->paymentTransaction->payment_method ?? 'Bank Transfer')) }}</td>
                </tr>
            </table>
        </div>

        <!-- Bill To -->
        <div class="bill-to">
            <div class="bill-to-title">អតិថិជន / Bill To:</div>
            <div><strong>{{ $invoice->tenant->name }}</strong></div>
            @if($invoice->tenant->email)
                <div>អ៊ីមែល / Email: {{ $invoice->tenant->email }}</div>
            @endif
            @if($invoice->tenant->phone)
                <div>លេខទូរសព្ទ / Phone: {{ $invoice->tenant->phone }}</div>
            @endif
        </div>

        <!-- Items Table -->
        <table class="items-table">
            <thead>
                <tr>
                    <th class="text-center" style="width: 8%">ល.រ<br>No.</th>
                    <th style="width: 50%">ពិពណ៌នា / Description</th>
                    <th class="text-center" style="width: 12%">បរិមាណ<br>Qty</th>
                    <th class="text-right" style="width: 15%">តម្លៃឯកតា<br>Unit Price</th>
                    <th class="text-right" style="width: 15%">សរុប<br>Amount</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td class="text-center">1</td>
                    <td>
                        <strong>{{ $invoice->plan->name }} Subscription</strong>
                        <br>
                        <span style="font-size: 8pt">
                            @if($invoice->plan->billing_cycle === 'monthly')
                                ការជាវប្រចាំខែ / Monthly Subscription
                            @elseif($invoice->plan->billing_cycle === 'yearly')
                                ការជាវប្រចាំឆ្នាំ / Yearly Subscription
                            @else
                                {{ $invoice->plan->billing_cycle }}
                            @endif
                        </span>
                    </td>
                    <td class="text-center">1</td>
                    <td class="text-right">${{ number_format($invoice->subtotal, 2) }}</td>
                    <td class="text-right">${{ number_format($invoice->subtotal, 2) }}</td>
                </tr>
            </tbody>
        </table>

        <!-- Totals -->
        <div class="totals">
            <table>
                <tr>
                    <td class="label">សរុបរង / Subtotal:</td>
                    <td class="amount">${{ number_format($invoice->subtotal, 2) }} USD</td>
                </tr>
                <tr>
                    <td class="label">អាករលើតម្លៃបន្ថែម ({{ number_format($invoice->tax_rate, 0) }}%) / VAT ({{ number_format($invoice->tax_rate, 0) }}%):</td>
                    <td class="amount">${{ number_format($invoice->tax_amount, 2) }} USD</td>
                </tr>
                <tr class="grand-total">
                    <td class="label">សរុបសរុប / TOTAL:</td>
                    <td class="amount">${{ number_format($invoice->total_amount, 2) }} USD</td>
                </tr>
                @if($invoice->total_khr)
                <tr>
                    <td class="label">ជារៀល / In KHR:</td>
                    <td class="amount">{{ number_format($invoice->total_khr, 0) }} ៛</td>
                </tr>
                <tr>
                    <td colspan="2" class="text-right" style="font-size: 8pt; padding-top: 1mm;">
                        អត្រាប្តូរប្រាក់ / Exchange Rate: 1 USD = {{ number_format($invoice->exchange_rate, 0) }} KHR
                    </td>
                </tr>
                @endif
            </table>
        </div>

        <!-- Payment Status -->
        <div style="margin-bottom: 10mm; padding: 3mm; background-color: #f0f0f0; text-align: center; font-weight: bold;">
            @if($invoice->status === 'paid')
                <span style="color: #059669;">✓ បានទូទាត់ / PAID</span>
            @else
                <span style="color: #d97706;">រង់ចាំទូទាត់ / PENDING PAYMENT</span>
            @endif
        </div>

        <!-- Footer -->
        <div class="footer">
            <div class="thank-you">សូមអរគុណ / Thank You for Your Business!</div>
            <div style="margin-top: 2mm; font-size: 8pt;">
                វិក្កយប័ត្រនេះត្រូវបានបង្កើតដោយស្វ័យប្រវត្តិ<br>
                This invoice was generated automatically
            </div>
        </div>
    </div>
</body>
</html>
