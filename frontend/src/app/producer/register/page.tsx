'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { useProducerStore } from '@/stores/producerStore';
import { buildApiUrl } from '@/lib/utils/apiUrls';

const SPECIALTIES = [
  { value: 'honey', label: 'Μέλι' },
  { value: 'olive_oil', label: 'Ελαιόλαδο' },
  { value: 'olives', label: 'Ελιές' },
  { value: 'cheese', label: 'Τυροκομικά' },
  { value: 'wine', label: 'Κρασί' },
  { value: 'nuts', label: 'Ξηροί Καρποί' },
  { value: 'legumes', label: 'Όσπρια' },
  { value: 'herbs', label: 'Αρωματικά Φυτά' },
  { value: 'traditional', label: 'Παραδοσιακά Προϊόντα' },
  { value: 'cosmetics', label: 'Φυσικά Καλλυντικά' },
];

export default function ProducerRegisterPage() {
  const router = useRouter();
  const { setUser, setToken } = useAuthStore();
  const { setProfile } = useProducerStore();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    // User data
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    phone: '',
    
    // Business data
    business_name: '',
    tax_number: '',
    business_registration_number: '',
    description: '',
    specialties: [] as string[],
    
    // Location
    location_address: '',
    location_city: '',
    location_region: '',
    location_postal_code: '',
    
    // Optional
    website_url: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSpecialtyToggle = (specialty: string) => {
    setFormData(prev => ({
      ...prev,
      specialties: prev.specialties.includes(specialty)
        ? prev.specialties.filter(s => s !== specialty)
        : [...prev.specialties, specialty]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(buildApiUrl('producer/register'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Σφάλμα κατά την εγγραφή');
      }

      // Store auth data
      setUser(data.data.user);
      setToken(data.data.token);
      setProfile(data.data.profile);

      // Redirect to producer dashboard
      router.push('/producer/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Σφάλμα κατά την εγγραφή');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Εγγραφή Παραγωγού
          </h1>
          <p className="text-gray-600 mb-8">
            Γίνετε μέλος της κοινότητας του Dixis Fresh και πουλήστε τα προϊόντα σας απευθείας στους καταναλωτές
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Personal Information */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Προσωπικά Στοιχεία</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ονοματεπώνυμο *
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Κωδικός *
                  </label>
                  <input
                    type="password"
                    name="password"
                    required
                    minLength={8}
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Επιβεβαίωση Κωδικού *
                  </label>
                  <input
                    type="password"
                    name="password_confirmation"
                    required
                    value={formData.password_confirmation}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Τηλέφωνο *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
            </div>

            {/* Business Information */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Στοιχεία Επιχείρησης</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Επωνυμία Επιχείρησης *
                  </label>
                  <input
                    type="text"
                    name="business_name"
                    required
                    value={formData.business_name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ΑΦΜ *
                  </label>
                  <input
                    type="text"
                    name="tax_number"
                    required
                    value={formData.tax_number}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Αρ. ΓΕΜΗ (προαιρετικό)
                  </label>
                  <input
                    type="text"
                    name="business_registration_number"
                    value={formData.business_registration_number}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Website (προαιρετικό)
                  </label>
                  <input
                    type="url"
                    name="website_url"
                    value={formData.website_url}
                    onChange={handleInputChange}
                    placeholder="https://..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
              
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Περιγραφή Επιχείρησης *
                </label>
                <textarea
                  name="description"
                  required
                  rows={4}
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Περιγράψτε την επιχείρησή σας, την ιστορία σας, και τι σας κάνει ξεχωριστούς..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            {/* Specialties */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Κατηγορίες Προϊόντων *</h2>
              <p className="text-sm text-gray-600 mb-4">Επιλέξτε τις κατηγορίες προϊόντων που παράγετε</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {SPECIALTIES.map((specialty) => (
                  <label
                    key={specialty.value}
                    className="flex items-center space-x-2 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={formData.specialties.includes(specialty.value)}
                      onChange={() => handleSpecialtyToggle(specialty.value)}
                      className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                    />
                    <span className="text-sm text-gray-700">{specialty.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Location */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Τοποθεσία</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Διεύθυνση *
                  </label>
                  <input
                    type="text"
                    name="location_address"
                    required
                    value={formData.location_address}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Πόλη *
                  </label>
                  <input
                    type="text"
                    name="location_city"
                    required
                    value={formData.location_city}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Περιοχή/Νομός *
                  </label>
                  <input
                    type="text"
                    name="location_region"
                    required
                    value={formData.location_region}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ταχυδρομικός Κώδικας *
                  </label>
                  <input
                    type="text"
                    name="location_postal_code"
                    required
                    value={formData.location_postal_code}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
            </div>

            {/* Commission Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">
                💰 Προμήθειες & Συνδρομές
              </h3>
              <div className="text-sm text-blue-800 space-y-2">
                <p>• <strong>Χωρίς συνδρομή:</strong> 12% προμήθεια σε κάθε πώληση</p>
                <p>• <strong>Βασική συνδρομή (€29/μήνα):</strong> 9% προμήθεια</p>
                <p>• <strong>Premium συνδρομή (€49/μήνα):</strong> 7% προμήθεια</p>
                <p className="pt-2">Μπορείτε να επιλέξετε συνδρομή μετά την έγκριση του λογαριασμού σας.</p>
              </div>
            </div>

            {/* Submit */}
            <div className="flex items-center justify-between pt-6">
              <p className="text-sm text-gray-600">
                * Υποχρεωτικά πεδία
              </p>
              <button
                type="submit"
                disabled={loading || formData.specialties.length === 0}
                className="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Υποβολή...' : 'Υποβολή Αίτησης'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}