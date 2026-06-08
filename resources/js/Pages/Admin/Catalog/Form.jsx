import AdminLayout from '@/Layouts/AdminLayout';
import CatalogForm from '@/Components/Catalog/CatalogForm';
import { router } from '@inertiajs/react';
import { Link } from '@inertiajs/react';
import { ChevronRight } from 'lucide-react';

export default function CatalogFormPage({ record, materialTypes, collections, locations }) {
    const isEdit = !!record;

    const handleSuccess = () => {
        router.visit(route('admin.catalog.index'));
    };

    return (
        <AdminLayout title={isEdit ? 'Edit Record' : 'New Record'}>
            {/* Breadcrumb */}
            <nav className="flex items-center gap-1.5 text-sm text-gray-500 mb-5">
                <Link href={route('admin.catalog.index')} className="hover:text-gray-700">
                    Bibliographic Records
                </Link>
                <ChevronRight className="w-3.5 h-3.5" />
                <span className="text-gray-900 font-medium">
                    {isEdit ? (record?.title ?? 'Edit Record') : 'New Record'}
                </span>
            </nav>

            <CatalogForm
                record={record}
                materialTypes={materialTypes ?? []}
                collections={collections ?? []}
                locations={locations ?? []}
                onSuccess={handleSuccess}
            />
        </AdminLayout>
    );
}
