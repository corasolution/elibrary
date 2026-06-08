import { Head, useForm } from '@inertiajs/react';
import CentralLayout from '@/Layouts/CentralLayout';
import { Save, AlertCircle, FileText, Building2, Mail, Phone, Hash, DollarSign } from 'lucide-react';

export default function InvoiceSettings({ settings }) {
    const { data, setData, post, processing, errors } = useForm({
        invoice_prefix: settings?.invoice_prefix || 'INV',
        company_name_en: settings?.company_name_en || 'Alpha eLibrary',
        company_name_km: settings?.company_name_km || 'អាល់ហ្វា អ៊ីឡាយប្រារី',
        company_address_en: settings?.company_address_en || 'Phnom Penh, Cambodia',
        company_address_km: settings?.company_address_km || 'ភ្នំពេញ ព្រះរាជាណាចក្រកម្ពុជា',
        company_tin: settings?.company_tin || '',
        company_phone: settings?.company_phone || '+855 (0) 12 345 678',
        company_email: settings?.company_email || 'billing@bannalai.com',
        vat_rate: settings?.vat_rate || '10.00',
        usd_to_khr_rate: settings?.usd_to_khr_rate || '4100.00',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('central.settings.invoice.update'));
    };

    return (
        <CentralLayout>
            <Head title="Invoice Settings" />

            <div className="max-w-7xl mx-auto px-6">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Invoice Settings</h1>
                    <p className="text-sm text-gray-600 mt-1">
                        Configure invoice generation and Cambodia tax compliance settings (Prakas 723)
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Invoice Configuration */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Invoice Configuration</h3>

                        <div className="space-y-4">
                            {/* Invoice Prefix */}
                            <div>
                                <label htmlFor="invoice_prefix" className="block text-sm font-medium text-gray-700 mb-1">
                                    Invoice Number Prefix <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FileText className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        id="invoice_prefix"
                                        type="text"
                                        value={data.invoice_prefix}
                                        onChange={(e) => setData('invoice_prefix', e.target.value)}
                                        className={`block w-full pl-10 pr-3 py-2 border ${
                                            errors.invoice_prefix ? 'border-red-300' : 'border-gray-300'
                                        } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                                        placeholder="INV"
                                        required
                                        maxLength={10}
                                    />
                                </div>
                                <p className="mt-1 text-xs text-gray-500">
                                    Used in invoice numbers: {data.invoice_prefix}-2026-001234
                                </p>
                                {errors.invoice_prefix && (
                                    <div className="mt-1 flex items-start gap-1.5 text-red-600 text-sm">
                                        <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                        <span>{errors.invoice_prefix}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Company Information */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Company Information</h3>

                        <div className="space-y-4">
                            {/* Company Name English */}
                            <div>
                                <label htmlFor="company_name_en" className="block text-sm font-medium text-gray-700 mb-1">
                                    Company Name (English) <span className="text-red-500">*</span>
                                </label>
                                <input
                                    id="company_name_en"
                                    type="text"
                                    value={data.company_name_en}
                                    onChange={(e) => setData('company_name_en', e.target.value)}
                                    className={`block w-full px-3 py-2 border ${
                                        errors.company_name_en ? 'border-red-300' : 'border-gray-300'
                                    } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                                    required
                                    maxLength={200}
                                />
                                {errors.company_name_en && (
                                    <div className="mt-1 flex items-start gap-1.5 text-red-600 text-sm">
                                        <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                        <span>{errors.company_name_en}</span>
                                    </div>
                                )}
                            </div>

                            {/* Company Name Khmer */}
                            <div>
                                <label htmlFor="company_name_km" className="block text-sm font-medium text-gray-700 mb-1">
                                    Company Name (Khmer) <span className="text-red-500">*</span>
                                </label>
                                <input
                                    id="company_name_km"
                                    type="text"
                                    value={data.company_name_km}
                                    onChange={(e) => setData('company_name_km', e.target.value)}
                                    className={`block w-full px-3 py-2 border ${
                                        errors.company_name_km ? 'border-red-300' : 'border-gray-300'
                                    } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                                    style={{ fontFamily: 'Noto Sans Khmer, sans-serif' }}
                                    required
                                    maxLength={400}
                                />
                                {errors.company_name_km && (
                                    <div className="mt-1 flex items-start gap-1.5 text-red-600 text-sm">
                                        <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                        <span>{errors.company_name_km}</span>
                                    </div>
                                )}
                            </div>

                            {/* Company Address English */}
                            <div>
                                <label htmlFor="company_address_en" className="block text-sm font-medium text-gray-700 mb-1">
                                    Company Address (English) <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    id="company_address_en"
                                    value={data.company_address_en}
                                    onChange={(e) => setData('company_address_en', e.target.value)}
                                    className={`block w-full px-3 py-2 border ${
                                        errors.company_address_en ? 'border-red-300' : 'border-gray-300'
                                    } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                                    rows={3}
                                    required
                                />
                                {errors.company_address_en && (
                                    <div className="mt-1 flex items-start gap-1.5 text-red-600 text-sm">
                                        <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                        <span>{errors.company_address_en}</span>
                                    </div>
                                )}
                            </div>

                            {/* Company Address Khmer */}
                            <div>
                                <label htmlFor="company_address_km" className="block text-sm font-medium text-gray-700 mb-1">
                                    Company Address (Khmer) <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    id="company_address_km"
                                    value={data.company_address_km}
                                    onChange={(e) => setData('company_address_km', e.target.value)}
                                    className={`block w-full px-3 py-2 border ${
                                        errors.company_address_km ? 'border-red-300' : 'border-gray-300'
                                    } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                                    style={{ fontFamily: 'Noto Sans Khmer, sans-serif' }}
                                    rows={3}
                                    required
                                />
                                {errors.company_address_km && (
                                    <div className="mt-1 flex items-start gap-1.5 text-red-600 text-sm">
                                        <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                        <span>{errors.company_address_km}</span>
                                    </div>
                                )}
                            </div>

                            {/* TIN */}
                            <div>
                                <label htmlFor="company_tin" className="block text-sm font-medium text-gray-700 mb-1">
                                    Tax Identification Number (TIN) <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Hash className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        id="company_tin"
                                        type="text"
                                        value={data.company_tin}
                                        onChange={(e) => setData('company_tin', e.target.value)}
                                        className={`block w-full pl-10 pr-3 py-2 border ${
                                            errors.company_tin ? 'border-red-300' : 'border-gray-300'
                                        } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                                        placeholder="E001-123456789"
                                        required
                                        maxLength={50}
                                    />
                                </div>
                                <p className="mt-1 text-xs text-gray-500">
                                    Required for Cambodia tax compliance (Prakas 723)
                                </p>
                                {errors.company_tin && (
                                    <div className="mt-1 flex items-start gap-1.5 text-red-600 text-sm">
                                        <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                        <span>{errors.company_tin}</span>
                                    </div>
                                )}
                            </div>

                            {/* Phone */}
                            <div>
                                <label htmlFor="company_phone" className="block text-sm font-medium text-gray-700 mb-1">
                                    Contact Phone <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Phone className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        id="company_phone"
                                        type="tel"
                                        value={data.company_phone}
                                        onChange={(e) => setData('company_phone', e.target.value)}
                                        className={`block w-full pl-10 pr-3 py-2 border ${
                                            errors.company_phone ? 'border-red-300' : 'border-gray-300'
                                        } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                                        placeholder="+855 (0) 12 345 678"
                                        required
                                        maxLength={30}
                                    />
                                </div>
                                {errors.company_phone && (
                                    <div className="mt-1 flex items-start gap-1.5 text-red-600 text-sm">
                                        <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                        <span>{errors.company_phone}</span>
                                    </div>
                                )}
                            </div>

                            {/* Email */}
                            <div>
                                <label htmlFor="company_email" className="block text-sm font-medium text-gray-700 mb-1">
                                    Billing Email <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        id="company_email"
                                        type="email"
                                        value={data.company_email}
                                        onChange={(e) => setData('company_email', e.target.value)}
                                        className={`block w-full pl-10 pr-3 py-2 border ${
                                            errors.company_email ? 'border-red-300' : 'border-gray-300'
                                        } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                                        placeholder="billing@bannalai.com"
                                        required
                                    />
                                </div>
                                {errors.company_email && (
                                    <div className="mt-1 flex items-start gap-1.5 text-red-600 text-sm">
                                        <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                        <span>{errors.company_email}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Tax & Currency Settings */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Tax & Currency Settings</h3>

                        <div className="grid grid-cols-2 gap-4">
                            {/* VAT Rate */}
                            <div>
                                <label htmlFor="vat_rate" className="block text-sm font-medium text-gray-700 mb-1">
                                    VAT Rate (%) <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        id="vat_rate"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        max="100"
                                        value={data.vat_rate}
                                        onChange={(e) => setData('vat_rate', e.target.value)}
                                        className={`block w-full px-3 py-2 border ${
                                            errors.vat_rate ? 'border-red-300' : 'border-gray-300'
                                        } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                                        required
                                    />
                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                        <span className="text-gray-500">%</span>
                                    </div>
                                </div>
                                <p className="mt-1 text-xs text-gray-500">
                                    Default VAT rate for Cambodia is 10%
                                </p>
                                {errors.vat_rate && (
                                    <div className="mt-1 flex items-start gap-1.5 text-red-600 text-sm">
                                        <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                        <span>{errors.vat_rate}</span>
                                    </div>
                                )}
                            </div>

                            {/* USD to KHR Exchange Rate */}
                            <div>
                                <label htmlFor="usd_to_khr_rate" className="block text-sm font-medium text-gray-700 mb-1">
                                    USD to KHR Exchange Rate <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <DollarSign className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        id="usd_to_khr_rate"
                                        type="number"
                                        step="0.01"
                                        min="1"
                                        value={data.usd_to_khr_rate}
                                        onChange={(e) => setData('usd_to_khr_rate', e.target.value)}
                                        className={`block w-full pl-10 pr-3 py-2 border ${
                                            errors.usd_to_khr_rate ? 'border-red-300' : 'border-gray-300'
                                        } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                                        required
                                    />
                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                        <span className="text-gray-500">៛</span>
                                    </div>
                                </div>
                                <p className="mt-1 text-xs text-gray-500">
                                    1 USD = {data.usd_to_khr_rate} KHR (Cambodian Riel)
                                </p>
                                {errors.usd_to_khr_rate && (
                                    <div className="mt-1 flex items-start gap-1.5 text-red-600 text-sm">
                                        <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                        <span>{errors.usd_to_khr_rate}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end gap-3">
                        <button
                            type="submit"
                            disabled={processing}
                            className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors"
                        >
                            <Save className="w-4 h-4" />
                            {processing ? 'Saving...' : 'Save Settings'}
                        </button>
                    </div>
                </form>
            </div>
        </CentralLayout>
    );
}
