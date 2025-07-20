'use client';

import { logger } from '@/lib/logging/productionLogger';

import { useState } from 'react';
import { useTenantTheme } from '@/components/tenant/TenantThemeProvider';
import { 
  SwatchIcon, 
  PhotoIcon, 
  CodeBracketIcon,
  EyeIcon,
  CheckIcon
} from '@heroicons/react/24/outline';

export default function BrandCustomizer() {
  const { 
    theme, 
    colors, 
    updateColor, 
    updateFont, 
    applyColorScheme, 
    resetToDefault 
  } = useTenantTheme();
  
  const [activeTab, setActiveTab] = useState<'colors' | 'fonts' | 'logo' | 'css'>('colors');
  const [previewMode, setPreviewMode] = useState(false);

  const colorSchemes = [
    { id: 'green', name: 'Dixis Green', primary: '#16a34a', preview: ['#16a34a', '#059669', '#10b981'] },
    { id: 'blue', name: 'Ocean Blue', primary: '#2563eb', preview: ['#2563eb', '#1d4ed8', '#3b82f6'] },
    { id: 'purple', name: 'Royal Purple', primary: '#7c3aed', preview: ['#7c3aed', '#6d28d9', '#8b5cf6'] },
    { id: 'orange', name: 'Sunset Orange', primary: '#ea580c', preview: ['#ea580c', '#dc2626', '#f97316'] },
    { id: 'teal', name: 'Fresh Teal', primary: '#0d9488', preview: ['#0d9488', '#0f766e', '#14b8a6'] },
    { id: 'dark', name: 'Dark Mode', primary: '#10b981', preview: ['#10b981', '#059669', '#34d399'] }
  ];

  const fontOptions = [
    'Inter', 'Roboto', 'Open Sans', 'Lato', 'Montserrat', 
    'Poppins', 'Source Sans Pro', 'Nunito', 'Raleway', 'Ubuntu'
  ];

  const handleColorChange = (colorType: string, color: string) => {
    updateColor(colorType, color);
  };

  const handleFontChange = (font: string) => {
    updateFont(font);
  };

  const handleSchemeApply = (schemeId: string) => {
    applyColorScheme(schemeId);
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Brand Customizer</h2>
              <p className="text-sm text-gray-600">Προσαρμόστε την εμφάνιση του καταστήματός σας</p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setPreviewMode(!previewMode)}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                  previewMode 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <EyeIcon className="w-5 h-5" />
                {previewMode ? 'Έξοδος Preview' : 'Preview'}
              </button>
              
              <button
                onClick={resetToDefault}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Επαναφορά
              </button>
            </div>
          </div>
        </div>

        <div className="flex">
          {/* Sidebar */}
          <div className="w-64 bg-gray-50 border-r border-gray-200">
            <nav className="p-4 space-y-2">
              {[
                { id: 'colors', name: 'Χρώματα', icon: SwatchIcon },
                { id: 'fonts', name: 'Γραμματοσειρές', icon: CodeBracketIcon },
                { id: 'logo', name: 'Logo & Εικόνες', icon: PhotoIcon },
                { id: 'css', name: 'Custom CSS', icon: CodeBracketIcon }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left ${
                    activeTab === tab.id
                      ? 'bg-green-100 text-green-700 border border-green-200'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1 p-6">
            {activeTab === 'colors' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Προκαθορισμένα Σχήματα</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {colorSchemes.map((scheme) => (
                      <button
                        key={scheme.id}
                        onClick={() => handleSchemeApply(scheme.id)}
                        className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 text-left group"
                      >
                        <div className="flex gap-2 mb-2">
                          {scheme.preview.map((color, index) => (
                            <div
                              key={index}
                              className="w-6 h-6 rounded-full"
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                        <div className="font-medium text-gray-900">{scheme.name}</div>
                        {colors?.primary === scheme.primary && (
                          <div className="flex items-center gap-1 text-green-600 text-sm mt-1">
                            <CheckIcon className="w-4 h-4" />
                            Ενεργό
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Προσαρμογή Χρωμάτων</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[
                      { key: 'primary', label: 'Κύριο Χρώμα', value: colors?.primary },
                      { key: 'secondary', label: 'Δευτερεύον Χρώμα', value: colors?.secondary },
                      { key: 'accent', label: 'Χρώμα Έμφασης', value: colors?.accent },
                      { key: 'background', label: 'Φόντο', value: colors?.background },
                      { key: 'text', label: 'Κείμενο', value: colors?.text }
                    ].map((color) => (
                      <div key={color.key} className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          {color.label}
                        </label>
                        <div className="flex gap-3 items-center">
                          <input
                            type="color"
                            value={color.value || '#000000'}
                            onChange={(e) => handleColorChange(color.key, e.target.value)}
                            className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                          />
                          <input
                            type="text"
                            value={color.value || ''}
                            onChange={(e) => handleColorChange(color.key, e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            placeholder="#000000"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'fonts' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Γραμματοσειρά</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {fontOptions.map((font) => (
                      <button
                        key={font}
                        onClick={() => handleFontChange(font)}
                        className={`p-4 border rounded-lg text-left ${
                          theme?.font_family === font
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        style={{ fontFamily: font }}
                      >
                        <div className="font-medium text-lg">{font}</div>
                        <div className="text-sm text-gray-600 mt-1">
                          Αυτό είναι ένα δείγμα κειμένου με τη γραμματοσειρά {font}
                        </div>
                        {theme?.font_family === font && (
                          <div className="flex items-center gap-1 text-green-600 text-sm mt-2">
                            <CheckIcon className="w-4 h-4" />
                            Ενεργή
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'logo' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Logo</h3>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="mt-4">
                      <label className="cursor-pointer">
                        <span className="mt-2 block text-sm font-medium text-gray-900">
                          Ανεβάστε το logo σας
                        </span>
                        <input type="file" className="sr-only" accept="image/*" />
                      </label>
                    </div>
                    <p className="mt-2 text-xs text-gray-500">
                      PNG, JPG, SVG μέχρι 2MB
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Favicon</h3>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <PhotoIcon className="mx-auto h-8 w-8 text-gray-400" />
                    <div className="mt-4">
                      <label className="cursor-pointer">
                        <span className="mt-2 block text-sm font-medium text-gray-900">
                          Ανεβάστε favicon
                        </span>
                        <input type="file" className="sr-only" accept="image/*" />
                      </label>
                    </div>
                    <p className="mt-2 text-xs text-gray-500">
                      ICO, PNG 32x32px
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'css' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Custom CSS</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Προσθέστε custom CSS για προχωρημένη προσαρμογή
                  </p>
                  <textarea
                    rows={12}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent font-mono text-sm"
                    placeholder="/* Προσθέστε το custom CSS σας εδώ */
.custom-button {
  background: var(--color-primary);
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
}"
                    value={theme?.custom_css || ''}
                    onChange={(e) => {
                      // In real app, update theme with custom CSS
                      logger.info('Custom CSS:', e.target.value);
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Preview Panel */}
        {previewMode && (
          <div className="border-t border-gray-200 bg-gray-50 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Live Preview</h3>
            <div className="bg-white rounded-lg shadow p-6" style={{
              backgroundColor: colors?.background,
              color: colors?.text,
              fontFamily: theme?.font_family
            }}>
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold" style={{ color: colors?.primary }}>
                  Το Κατάστημά Μου
                </h1>
                <button 
                  className="px-4 py-2 rounded-lg text-white"
                  style={{ backgroundColor: colors?.primary }}
                >
                  Κουμπί
                </button>
              </div>
              
              <div className="grid grid-cols-3 gap-4 mb-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="border rounded-lg p-4">
                    <div 
                      className="w-full h-32 rounded mb-3"
                      style={{ backgroundColor: colors?.accent + '20' }}
                    />
                    <h3 className="font-medium mb-2">Προϊόν {i}</h3>
                    <p className="text-sm opacity-75">Περιγραφή προϊόντος</p>
                    <div className="mt-3 flex justify-between items-center">
                      <span className="font-bold" style={{ color: colors?.primary }}>€25.00</span>
                      <button 
                        className="px-3 py-1 rounded text-sm text-white"
                        style={{ backgroundColor: colors?.secondary }}
                      >
                        Προσθήκη
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="text-center">
                <button 
                  className="px-6 py-3 rounded-lg text-white font-medium"
                  style={{ backgroundColor: colors?.accent }}
                >
                  Δείτε Περισσότερα Προϊόντα
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
