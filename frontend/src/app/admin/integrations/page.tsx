import { Metadata } from 'next';
import QuickBooksIntegration from '@/components/admin/QuickBooksIntegration';

export const metadata: Metadata = {
  title: 'Integrations - Admin Dashboard',
  description: 'Manage third-party integrations',
};

export default function IntegrationsPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Enterprise Integrations</h1>
          <p className="text-gray-600">
            Manage your third-party integrations and synchronization settings.
          </p>
        </div>

        <div className="space-y-8">
          {/* QuickBooks Integration */}
          <section>
            <QuickBooksIntegration />
          </section>

          {/* Future Integrations */}
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="border rounded-lg p-6 bg-gray-50">
              <h3 className="text-lg font-semibold mb-2">Xero Integration</h3>
              <p className="text-sm text-gray-600 mb-4">
                Connect with Xero for advanced accounting features.
              </p>
              <div className="text-sm text-gray-500">Coming Soon</div>
            </div>

            <div className="border rounded-lg p-6 bg-gray-50">
              <h3 className="text-lg font-semibold mb-2">Inventory Management</h3>
              <p className="text-sm text-gray-600 mb-4">
                Advanced inventory tracking and automation.
              </p>
              <div className="text-sm text-gray-500">Coming Soon</div>
            </div>

            <div className="border rounded-lg p-6 bg-gray-50">
              <h3 className="text-lg font-semibold mb-2">Shipping Automation</h3>
              <p className="text-sm text-gray-600 mb-4">
                Automated shipping with Greek carriers (ELTA, ACS, Speedex).
              </p>
              <div className="text-sm text-gray-500">Coming Soon</div>
            </div>

            <div className="border rounded-lg p-6 bg-gray-50">
              <h3 className="text-lg font-semibold mb-2">Marketing Automation</h3>
              <p className="text-sm text-gray-600 mb-4">
                Customer journey automation and email marketing.
              </p>
              <div className="text-sm text-gray-500">Coming Soon</div>
            </div>

            <div className="border rounded-lg p-6 bg-gray-50">
              <h3 className="text-lg font-semibold mb-2">CRM Integration</h3>
              <p className="text-sm text-gray-600 mb-4">
                Connect with HubSpot and Salesforce.
              </p>
              <div className="text-sm text-gray-500">Coming Soon</div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
