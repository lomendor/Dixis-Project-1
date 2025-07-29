'use client';

import { toError, errorToContext } from '@/lib/utils/errorUtils';

import { logger } from '@/lib/logging/productionLogger';

import { useState, useEffect } from 'react';
import { ImageUpload } from './ImageUpload';
import { 
  InformationCircleIcon,
  CalendarIcon,
  ShieldCheckIcon,
  GlobeAltIcon,
  BeakerIcon,
  SunIcon
} from '@heroicons/react/24/outline';

interface Category {
  id: number;
  name: string;
}

interface ProductFormProps {
  product?: any;
  onSubmit: (formData: FormData) => void;
  loading?: boolean;
}

const MONTHS = [
  { value: 1, label: 'Ιανουάριος' },
  { value: 2, label: 'Φεβρουάριος' },
  { value: 3, label: 'Μάρτιος' },
  { value: 4, label: 'Απρίλιος' },
  { value: 5, label: 'Μάιος' },
  { value: 6, label: 'Ιούνιος' },
  { value: 7, label: 'Ιούλιος' },
  { value: 8, label: 'Αύγουστος' },
  { value: 9, label: 'Σεπτέμβριος' },
  { value: 10, label: 'Οκτώβριος' },
  { value: 11, label: 'Νοέμβριος' },
  { value: 12, label: 'Δεκέμβριος' }
];

export default function ProductForm({ product, onSubmit, loading = false }: ProductFormProps) {
  const [formData, setFormData] = useState({
    name: product?.name || '',
    description: product?.description || '',
    price: product?.price || '',
    category_id: product?.category_id || '',
    stock_quantity: product?.stock_quantity || '',
    weight: product?.weight || '',
    dimensions: product?.dimensions || '',
    is_organic: product?.is_organic || false,
    is_vegan: product?.is_vegan || false,
    is_gluten_free: product?.is_gluten_free || false,
    is_featured: product?.is_featured || false,
    is_seasonal: product?.is_seasonal || false,
    seasonality: product?.seasonality || [],
    
    // Certification fields
    pdo_certification: product?.pdo_certification || '',
    pgi_certification: product?.pgi_certification || '',
    tsg_certification: product?.tsg_certification || '',
    organic_certification_body: product?.organic_certification_body || '',
    organic_certification_number: product?.organic_certification_number || '',
    
    // Traceability fields
    batch_number: product?.batch_number || '',
    harvest_date: product?.harvest_date || '',
    processing_method: product?.processing_method || '',
    expiry_date: product?.expiry_date || '',
    production_facility: product?.production_facility || '',
    quality_grade: product?.quality_grade || '',
    
    // Sustainability metrics
    carbon_footprint: product?.carbon_footprint || '',
    water_usage: product?.water_usage || '',
    pesticide_free_days: product?.pesticide_free_days || '',
    soil_health_score: product?.soil_health_score || '',
    renewable_energy_percentage: product?.renewable_energy_percentage || ''
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState(product?.images || []);
  const [errors, setErrors] = useState<any>({});

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/categories`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCategories(data.data || data);
      }
    } catch (error) {
      logger.error('Error fetching categories:', toError(error), errorToContext(error));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSeasonalityChange = (month: number) => {
    setFormData(prev => ({
      ...prev,
      seasonality: prev.seasonality.includes(month)
        ? prev.seasonality.filter((m: number) => m !== month)
        : [...prev.seasonality, month]
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    // Validate file types and sizes
    const validFiles = files.filter(file => {
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'];
      const maxSize = 2 * 1024 * 1024; // 2MB
      
      if (!validTypes.includes(file.type)) {
        alert(`${file.name} δεν είναι έγκυρος τύπος εικόνας`);
        return false;
      }
      
      if (file.size > maxSize) {
        alert(`${file.name} είναι πολύ μεγάλο (μέγιστο 2MB)`);
        return false;
      }
      
      return true;
    });

    setImageFiles(prev => [...prev, ...validFiles]);

    // Create previews
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = async (imageId: number) => {
    if (!confirm('Είστε σίγουροι ότι θέλετε να διαγράψετε αυτή την εικόνα;')) {
      return;
    }

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/producer/products/${product.id}/images/${imageId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        }
      );

      if (response.ok) {
        setExistingImages((prev: any[]) => prev.filter((img: any) => img.id !== imageId));
      }
    } catch (error) {
      logger.error('Error deleting image:', toError(error), errorToContext(error));
    }
  };

  const validateForm = () => {
    const newErrors: any = {};

    // Basic validations
    if (!formData.name) newErrors.name = 'Το όνομα είναι υποχρεωτικό';
    if (!formData.description) newErrors.description = 'Η περιγραφή είναι υποχρεωτική';
    if (!formData.price || parseFloat(formData.price) <= 0) newErrors.price = 'Η τιμή πρέπει να είναι μεγαλύτερη από 0';
    if (!formData.category_id) newErrors.category_id = 'Η κατηγορία είναι υποχρεωτική';
    if (!formData.stock_quantity || parseInt(formData.stock_quantity) < 0) newErrors.stock_quantity = 'Το απόθεμα δεν μπορεί να είναι αρνητικό';
    if (!formData.weight || parseFloat(formData.weight) <= 0) newErrors.weight = 'Το βάρος πρέπει να είναι μεγαλύτερο από 0';
    
    // Certification validations
    if (formData.is_organic && !formData.organic_certification_body) {
      newErrors.organic_certification_body = 'Επιλέξτε φορέα πιστοποίησης για βιολογικό προϊόν';
    }
    
    // Date validations
    if (formData.harvest_date && formData.expiry_date) {
      const harvestDate = new Date(formData.harvest_date);
      const expiryDate = new Date(formData.expiry_date);
      if (harvestDate >= expiryDate) {
        newErrors.expiry_date = 'Η ημερομηνία λήξης πρέπει να είναι μετά τη συγκομιδή';
      }
    }
    
    // Sustainability metrics validations
    if (formData.soil_health_score && (parseInt(formData.soil_health_score) < 1 || parseInt(formData.soil_health_score) > 10)) {
      newErrors.soil_health_score = 'Ο δείκτης υγείας εδάφους πρέπει να είναι μεταξύ 1-10';
    }
    
    if (formData.renewable_energy_percentage && (parseInt(formData.renewable_energy_percentage) < 0 || parseInt(formData.renewable_energy_percentage) > 100)) {
      newErrors.renewable_energy_percentage = 'Το ποσοστό ανανεώσιμης ενέργειας πρέπει να είναι μεταξύ 0-100%';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const submitData = new FormData();

    // Add form fields
    Object.keys(formData).forEach(key => {
      if (key === 'seasonality') {
        submitData.append(key, JSON.stringify(formData[key]));
      } else {
        submitData.append(key, (formData as any)[key]);
      }
    });

    // Add image files
    imageFiles.forEach(file => {
      submitData.append('images', file);
    });

    onSubmit(submitData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Βασικές Πληροφορίες</h3>
        
        <div className="grid grid-cols-1 gap-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Όνομα Προϊόντος *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className={`mt-1 block w-full rounded-md shadow-sm ${
                errors.name ? 'border-red-300' : 'border-gray-300'
              } focus:ring-green-500 focus:border-green-500`}
              placeholder="π.χ. Βιολογικές Ντομάτες Σαντορίνης"
            />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Περιγραφή *
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              value={formData.description}
              onChange={handleInputChange}
              className={`mt-1 block w-full rounded-md shadow-sm ${
                errors.description ? 'border-red-300' : 'border-gray-300'
              } focus:ring-green-500 focus:border-green-500`}
              placeholder="Περιγράψτε το προϊόν σας..."
            />
            {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="category_id" className="block text-sm font-medium text-gray-700">
                Κατηγορία *
              </label>
              <select
                id="category_id"
                name="category_id"
                value={formData.category_id}
                onChange={handleInputChange}
                className={`mt-1 block w-full rounded-md shadow-sm ${
                  errors.category_id ? 'border-red-300' : 'border-gray-300'
                } focus:ring-green-500 focus:border-green-500`}
              >
                <option value="">Επιλέξτε κατηγορία</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              {errors.category_id && <p className="mt-1 text-sm text-red-600">{errors.category_id}</p>}
            </div>

            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                Τιμή (€) *
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <input
                  type="number"
                  id="price"
                  name="price"
                  step="0.01"
                  value={formData.price}
                  onChange={handleInputChange}
                  className={`block w-full pr-12 rounded-md ${
                    errors.price ? 'border-red-300' : 'border-gray-300'
                  } focus:ring-green-500 focus:border-green-500`}
                  placeholder="0.00"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">€</span>
                </div>
              </div>
              {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price}</p>}
              
              {formData.price && (
                <div className="mt-2 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                  <InformationCircleIcon className="h-4 w-4 inline mr-1" />
                  Καθαρά έσοδα: €{(parseFloat(formData.price) * 0.88).toFixed(2)} (μετά την προμήθεια 12%)
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Product Details */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Λεπτομέρειες Προϊόντος</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label htmlFor="stock_quantity" className="block text-sm font-medium text-gray-700">
              Απόθεμα *
            </label>
            <input
              type="number"
              id="stock_quantity"
              name="stock_quantity"
              value={formData.stock_quantity}
              onChange={handleInputChange}
              className={`mt-1 block w-full rounded-md shadow-sm ${
                errors.stock_quantity ? 'border-red-300' : 'border-gray-300'
              } focus:ring-green-500 focus:border-green-500`}
              placeholder="0"
            />
            {errors.stock_quantity && <p className="mt-1 text-sm text-red-600">{errors.stock_quantity}</p>}
          </div>

          <div>
            <label htmlFor="weight" className="block text-sm font-medium text-gray-700">
              Βάρος (γραμμάρια) *
            </label>
            <input
              type="number"
              id="weight"
              name="weight"
              value={formData.weight}
              onChange={handleInputChange}
              className={`mt-1 block w-full rounded-md shadow-sm ${
                errors.weight ? 'border-red-300' : 'border-gray-300'
              } focus:ring-green-500 focus:border-green-500`}
              placeholder="π.χ. 1000"
            />
            {errors.weight && <p className="mt-1 text-sm text-red-600">{errors.weight}</p>}
          </div>

          <div>
            <label htmlFor="dimensions" className="block text-sm font-medium text-gray-700">
              Διαστάσεις
            </label>
            <input
              type="text"
              id="dimensions"
              name="dimensions"
              value={formData.dimensions}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-green-500 focus:border-green-500"
              placeholder="π.χ. 20x15x10 cm"
            />
          </div>
        </div>
      </div>

      {/* Attributes */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Χαρακτηριστικά</h3>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_organic"
                name="is_organic"
                checked={formData.is_organic}
                onChange={handleInputChange}
                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              />
              <label htmlFor="is_organic" className="ml-2 block text-sm text-gray-900">
                Βιολογικό προϊόν
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_vegan"
                name="is_vegan"
                checked={formData.is_vegan}
                onChange={handleInputChange}
                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              />
              <label htmlFor="is_vegan" className="ml-2 block text-sm text-gray-900">
                Vegan
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_gluten_free"
                name="is_gluten_free"
                checked={formData.is_gluten_free}
                onChange={handleInputChange}
                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              />
              <label htmlFor="is_gluten_free" className="ml-2 block text-sm text-gray-900">
                Χωρίς γλουτένη
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_featured"
                name="is_featured"
                checked={formData.is_featured}
                onChange={handleInputChange}
                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              />
              <label htmlFor="is_featured" className="ml-2 block text-sm text-gray-900">
                Προτεινόμενο προϊόν
              </label>
            </div>
          </div>

          <div className="border-t pt-4">
            <div className="flex items-center mb-3">
              <input
                type="checkbox"
                id="is_seasonal"
                name="is_seasonal"
                checked={formData.is_seasonal}
                onChange={handleInputChange}
                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              />
              <label htmlFor="is_seasonal" className="ml-2 block text-sm text-gray-900">
                Εποχιακό προϊόν
              </label>
            </div>

            {formData.is_seasonal && (
              <div className="ml-6">
                <p className="text-sm text-gray-600 mb-2 flex items-center">
                  <CalendarIcon className="h-4 w-4 mr-1" />
                  Επιλέξτε τους μήνες διαθεσιμότητας:
                </p>
                <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                  {MONTHS.map(month => (
                    <label
                      key={month.value}
                      className="flex items-center space-x-2 text-sm"
                    >
                      <input
                        type="checkbox"
                        checked={formData.seasonality.includes(month.value)}
                        onChange={() => handleSeasonalityChange(month.value)}
                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                      />
                      <span>{month.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Certifications */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <ShieldCheckIcon className="h-5 w-5 mr-2 text-blue-600" />
          Πιστοποιήσεις & Ποιότητα
        </h3>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="pdo_certification" className="block text-sm font-medium text-gray-700">
                ΠΟΠ Πιστοποίηση (Protected Designation of Origin)
              </label>
              <input
                type="text"
                id="pdo_certification"
                name="pdo_certification"
                value={formData.pdo_certification}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-green-500 focus:border-green-500"
                placeholder="π.χ. Καλαματιανές Ελιές ΠΟΠ"
              />
            </div>
            
            <div>
              <label htmlFor="pgi_certification" className="block text-sm font-medium text-gray-700">
                ΠΓΕ Πιστοποίηση (Protected Geographical Indication)
              </label>
              <input
                type="text"
                id="pgi_certification"
                name="pgi_certification"
                value={formData.pgi_certification}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-green-500 focus:border-green-500"
                placeholder="π.χ. Κρητικό Ελαιόλαδο ΠΓΕ"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="tsg_certification" className="block text-sm font-medium text-gray-700">
                ΕΠΙΠ Πιστοποίηση (Traditional Speciality Guaranteed)
              </label>
              <input
                type="text"
                id="tsg_certification"
                name="tsg_certification"
                value={formData.tsg_certification}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-green-500 focus:border-green-500"
                placeholder="π.χ. Παραδοσιακό Τσουρέκι ΕΠΙΠ"
              />
            </div>
            
            <div>
              <label htmlFor="quality_grade" className="block text-sm font-medium text-gray-700">
                Βαθμός Ποιότητας
              </label>
              <select
                id="quality_grade"
                name="quality_grade"
                value={formData.quality_grade}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-green-500 focus:border-green-500"
              >
                <option value="">Επιλέξτε βαθμό</option>
                <option value="Extra">Extra</option>
                <option value="Α'">Α' Ποιότητας</option>
                <option value="Β'">Β' Ποιότητας</option>
                <option value="Premium">Premium</option>
                <option value="Artisanal">Τεχνοτροπικό</option>
              </select>
            </div>
          </div>
          
          {formData.is_organic && (
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-green-900 mb-3">Στοιχεία Βιολογικής Πιστοποίησης</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="organic_certification_body" className="block text-sm font-medium text-green-700">
                    Φορέας Πιστοποίησης
                  </label>
                  <select
                    id="organic_certification_body"
                    name="organic_certification_body"
                    value={formData.organic_certification_body}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-green-300 shadow-sm focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="">Επιλέξτε φορέα</option>
                    <option value="DIO">DIO (GR-BIO-01)</option>
                    <option value="BIOHELLAS">BIOHELLAS (GR-BIO-02)</option>
                    <option value="GMCERT">GMCERT (GR-BIO-07)</option>
                    <option value="AGROCERT">AGROCERT (GR-BIO-03)</option>
                    <option value="OTHER">Άλλος</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="organic_certification_number" className="block text-sm font-medium text-green-700">
                    Αριθμός Πιστοποίησης
                  </label>
                  <input
                    type="text"
                    id="organic_certification_number"
                    name="organic_certification_number"
                    value={formData.organic_certification_number}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-green-300 shadow-sm focus:ring-green-500 focus:border-green-500"
                    placeholder="π.χ. GR-BIO-01-12345"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Traceability & Production Info */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <GlobeAltIcon className="h-5 w-5 mr-2 text-purple-600" />
          Ιχνηλασιμότητα & Πληροφορίες Παραγωγής
        </h3>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label htmlFor="batch_number" className="block text-sm font-medium text-gray-700">
                Αριθμός Παρτίδας/Lot
              </label>
              <input
                type="text"
                id="batch_number"
                name="batch_number"
                value={formData.batch_number}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-green-500 focus:border-green-500"
                placeholder="π.χ. LOT2025-001"
              />
            </div>
            
            <div>
              <label htmlFor="harvest_date" className="block text-sm font-medium text-gray-700">
                Ημερομηνία Συγκομιδής
              </label>
              <input
                type="date"
                id="harvest_date"
                name="harvest_date"
                value={formData.harvest_date}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-green-500 focus:border-green-500"
              />
            </div>
            
            <div>
              <label htmlFor="expiry_date" className="block text-sm font-medium text-gray-700">
                Ημερομηνία Λήξης
              </label>
              <input
                type="date"
                id="expiry_date"
                name="expiry_date"
                value={formData.expiry_date}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-green-500 focus:border-green-500"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="processing_method" className="block text-sm font-medium text-gray-700">
                Μέθοδος Επεξεργασίας
              </label>
              <select
                id="processing_method"
                name="processing_method"
                value={formData.processing_method}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-green-500 focus:border-green-500"
              >
                <option value="">Επιλέξτε μέθοδο</option>
                <option value="Fresh">Φρέσκο (χωρίς επεξεργασία)</option>
                <option value="Traditional">Παραδοσιακή μέθοδος</option>
                <option value="Cold_pressed">Ψυχρή έκθλιψη</option>
                <option value="Sun_dried">Ηλιοξήρανση</option>
                <option value="Fermented">Ζύμωση</option>
                <option value="Smoked">Κάπνισμα</option>
                <option value="Aged">Ωρίμανση</option>
                <option value="Pasteurized">Παστεριωμένο</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="production_facility" className="block text-sm font-medium text-gray-700">
                Εγκατάσταση Παραγωγής
              </label>
              <input
                type="text"
                id="production_facility"
                name="production_facility"
                value={formData.production_facility}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-green-500 focus:border-green-500"
                placeholder="π.χ. Κρητικό Ελαιοτριβείο Α.Ε."
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Sustainability Metrics */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <SunIcon className="h-5 w-5 mr-2 text-green-600" />
          Περιβαλλοντικό Αποτύπωμα & Αειφορία
        </h3>
        
        <div className="bg-green-50 p-4 rounded-lg space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="carbon_footprint" className="block text-sm font-medium text-green-700">
                Ανθρακικό Αποτύπωμα (kg CO₂)
              </label>
              <input
                type="number"
                step="0.01"
                id="carbon_footprint"
                name="carbon_footprint"
                value={formData.carbon_footprint}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-green-300 shadow-sm focus:ring-green-500 focus:border-green-500"
                placeholder="π.χ. 1.25"
              />
              <p className="mt-1 text-xs text-green-600">Kg CO₂ ανά μονάδα προϊόντος</p>
            </div>
            
            <div>
              <label htmlFor="water_usage" className="block text-sm font-medium text-green-700">
                Κατανάλωση Νερού (λίτρα)
              </label>
              <input
                type="number"
                id="water_usage"
                name="water_usage"
                value={formData.water_usage}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-green-300 shadow-sm focus:ring-green-500 focus:border-green-500"
                placeholder="π.χ. 150"
              />
              <p className="mt-1 text-xs text-green-600">Λίτρα νερού ανά μονάδα προϊόντος</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label htmlFor="pesticide_free_days" className="block text-sm font-medium text-green-700">
                Ημέρες Χωρίς Φυτοφάρμακα
              </label>
              <input
                type="number"
                id="pesticide_free_days"
                name="pesticide_free_days"
                value={formData.pesticide_free_days}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-green-300 shadow-sm focus:ring-green-500 focus:border-green-500"
                placeholder="π.χ. 365"
              />
            </div>
            
            <div>
              <label htmlFor="soil_health_score" className="block text-sm font-medium text-green-700">
                Δείκτης Υγείας Εδάφους (1-10)
              </label>
              <input
                type="number"
                min="1"
                max="10"
                id="soil_health_score"
                name="soil_health_score"
                value={formData.soil_health_score}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-green-300 shadow-sm focus:ring-green-500 focus:border-green-500"
                placeholder="π.χ. 8"
              />
            </div>
            
            <div>
              <label htmlFor="renewable_energy_percentage" className="block text-sm font-medium text-green-700">
                Ανανεώσιμη Ενέργεια (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                id="renewable_energy_percentage"
                name="renewable_energy_percentage"
                value={formData.renewable_energy_percentage}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-green-300 shadow-sm focus:ring-green-500 focus:border-green-500"
                placeholder="π.χ. 75"
              />
              <p className="mt-1 text-xs text-green-600">% χρήσης ανανεώσιμων πηγών</p>
            </div>
          </div>
        </div>
      </div>

      {/* Images */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Εικόνες Προϊόντος</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Επιλέξτε εικόνες προϊόντος
            </label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageChange}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-green-50 file:text-green-700
                hover:file:bg-green-100"
            />
            <p className="mt-1 text-sm text-gray-500">
              PNG, JPG, GIF μέχρι 2MB. Μέχρι 10 εικόνες.
            </p>
          </div>

          {/* Existing Images */}
          {existingImages.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">Υπάρχουσες Εικόνες</h4>
              <div className="grid grid-cols-3 gap-4">
                {existingImages.map((image: any) => (
                  <div key={image.id} className="relative">
                    <img
                      src={image.url}
                      alt="Product"
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    {image.is_main && (
                      <span className="absolute top-2 left-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded">
                        Κύρια
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => removeExistingImage(image.id)}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* New Images Preview */}
          {imagePreviews.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">Νέες Εικόνες</h4>
              <div className="grid grid-cols-3 gap-4">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative">
                    <img
                      src={preview}
                      alt={`Preview ${index}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300"
        >
          Ακύρωση
        </button>
        <button
          type="submit"
          disabled={loading}
          className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Αποθήκευση...' : (product ? 'Ενημέρωση Προϊόντος' : 'Δημιουργία Προϊόντος')}
        </button>
      </div>
    </form>
  );
}