'use client';

import { logger } from '@/lib/logging/productionLogger';
import { toError, errorToContext } from '@/lib/utils/errorUtils';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  CheckCircleIcon,
  UserIcon,
  BuildingStorefrontIcon,
  CurrencyEuroIcon,
  TruckIcon,
  ChartBarIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';

interface FormData {
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  description: string;
  productTypes: string[];
  experience: string;
  certifications: string[];
  agreedToTerms: boolean;
}

export default function BecomeProducerPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    businessName: '',
    ownerName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    description: '',
    productTypes: [],
    experience: '',
    certifications: [],
    agreedToTerms: false
  });

  const productTypeOptions = [
    'Ελαιόλαδο & Ελιές',
    'Μέλι & Προϊόντα Μελιού',
    'Τυριά & Γαλακτοκομικά',
    'Κρασιά & Ποτά',
    'Φρούτα & Λαχανικά',
    'Βότανα & Μπαχαρικά',
    'Δημητριακά & Όσπρια',
    'Αρτοποιία & Ζυμαρικά',
    'Άλλο'
  ];

  const certificationOptions = [
    'Βιολογικό (ΒΙΟ)',
    'ΠΟΠ (Προστατευόμενη Ονομασία Προέλευσης)',
    'ΠΓΕ (Προστατευόμενη Γεωγραφική Ένδειξη)',
    'HACCP',
    'ISO 22000',
    'Δεν έχω πιστοποιήσεις'
  ];

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleArrayChange = (field: 'productTypes' | 'certifications', value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/producer/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        router.push('/become-producer/success');
      } else {
        throw new Error('Σφάλμα κατά την εγγραφή');
      }
    } catch (error) {
      logger.error('Registration error:', toError(error), errorToContext(error));
      alert('Σφάλμα κατά την εγγραφή. Παρακαλώ δοκιμάστε ξανά.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.businessName && formData.ownerName && formData.email && formData.phone;
      case 2:
        return formData.address && formData.city && formData.postalCode && formData.description;
      case 3:
        return formData.productTypes.length > 0 && formData.experience && formData.agreedToTerms;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Hero Section */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="p-3 bg-green-100 rounded-full">
              <BuildingStorefrontIcon className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900">
              Γίνε Παραγωγός στο Dixis
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Συνδέσου με χιλιάδες πελάτες και πούλησε τα αυθεντικά ελληνικά προϊόντα σου online
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                  step <= currentStep 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  {step < currentStep ? (
                    <CheckCircleIcon className="w-6 h-6" />
                  ) : (
                    step
                  )}
                </div>
                {step < 3 && (
                  <div className={`w-16 h-1 mx-2 ${
                    step < currentStep ? 'bg-green-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-center mt-4">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-900">
                Βήμα {currentStep} από 3
              </p>
              <p className="text-sm text-gray-500">
                {currentStep === 1 && 'Βασικά Στοιχεία'}
                {currentStep === 2 && 'Επιχείρηση & Τοποθεσία'}
                {currentStep === 3 && 'Προϊόντα & Πιστοποιήσεις'}
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          {/* Step 1: Basic Info */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <UserIcon className="w-12 h-12 text-green-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900">Βασικά Στοιχεία</h2>
                <p className="text-gray-600">Πες μας λίγα πράγματα για εσένα</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Όνομα Επιχείρησης *
                  </label>
                  <input
                    type="text"
                    value={formData.businessName}
                    onChange={(e) => handleInputChange('businessName', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="π.χ. Αγρόκτημα Παπαδόπουλος"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ονοματεπώνυμο Υπευθύνου *
                  </label>
                  <input
                    type="text"
                    value={formData.ownerName}
                    onChange={(e) => handleInputChange('ownerName', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="π.χ. Γιάννης Παπαδόπουλος"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <div className="relative">
                    <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="email@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Τηλέφωνο *
                  </label>
                  <div className="relative">
                    <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="+30 210 1234567"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Business Info */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <MapPinIcon className="w-12 h-12 text-green-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900">Επιχείρηση & Τοποθεσία</h2>
                <p className="text-gray-600">Πού βρίσκεσαι και τι κάνεις;</p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Διεύθυνση *
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="π.χ. Λεωφόρος Κηφισίας 123"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Πόλη *
                    </label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="π.χ. Αθήνα"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ταχυδρομικός Κώδικας *
                    </label>
                    <input
                      type="text"
                      value={formData.postalCode}
                      onChange={(e) => handleInputChange('postalCode', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="π.χ. 12345"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Περιγραφή Επιχείρησης *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Πες μας για την επιχείρησή σου, την ιστορία της, τις αξίες σας..."
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Products & Certifications */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <ChartBarIcon className="w-12 h-12 text-green-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900">Προϊόντα & Πιστοποιήσεις</h2>
                <p className="text-gray-600">Τι παράγεις και τι πιστοποιήσεις έχεις;</p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Τύποι Προϊόντων * (επίλεξε όσα θέλεις)
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {productTypeOptions.map((type) => (
                      <label key={type} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.productTypes.includes(type)}
                          onChange={() => handleArrayChange('productTypes', type)}
                          className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">{type}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Εμπειρία στον Τομέα *
                  </label>
                  <select
                    value={formData.experience}
                    onChange={(e) => handleInputChange('experience', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="">Επίλεξε εμπειρία</option>
                    <option value="0-2">0-2 χρόνια</option>
                    <option value="3-5">3-5 χρόνια</option>
                    <option value="6-10">6-10 χρόνια</option>
                    <option value="10+">Πάνω από 10 χρόνια</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Πιστοποιήσεις (προαιρετικό)
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {certificationOptions.map((cert) => (
                      <label key={cert} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.certifications.includes(cert)}
                          onChange={() => handleArrayChange('certifications', cert)}
                          className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">{cert}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="border-t pt-6">
                  <label className="flex items-start">
                    <input
                      type="checkbox"
                      checked={formData.agreedToTerms}
                      onChange={(e) => handleInputChange('agreedToTerms', e.target.checked)}
                      className="rounded border-gray-300 text-green-600 focus:ring-green-500 mt-1"
                    />
                    <span className="ml-3 text-sm text-gray-700">
                      Συμφωνώ με τους <a href="/terms" className="text-green-600 hover:underline">όρους χρήσης</a> και την <a href="/privacy" className="text-green-600 hover:underline">πολιτική απορρήτου</a> του Dixis *
                    </span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className={`px-6 py-3 rounded-lg font-medium ${
                currentStep === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Προηγούμενο
            </button>

            <button
              onClick={nextStep}
              disabled={!isStepValid() || isSubmitting}
              className={`px-8 py-3 rounded-lg font-medium ${
                !isStepValid() || isSubmitting
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Υποβολή...
                </div>
              ) : (
                currentStep === 3 ? 'Υποβολή Αίτησης' : 'Επόμενο'
              )}
            </button>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="mt-12 bg-white rounded-xl shadow-lg p-8">
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Γιατί να Επιλέξεις το Dixis;
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <CurrencyEuroIcon className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Χαμηλές Προμήθειες</h4>
              <p className="text-gray-600">Μόνο 5% προμήθεια ανά πώληση</p>
            </div>
            <div className="text-center">
              <TruckIcon className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Δωρεάν Αποστολές</h4>
              <p className="text-gray-600">Εμείς αναλαμβάνουμε τη logistics</p>
            </div>
            <div className="text-center">
              <ChartBarIcon className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Analytics & Insights</h4>
              <p className="text-gray-600">Παρακολούθηση πωλήσεων σε real-time</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}