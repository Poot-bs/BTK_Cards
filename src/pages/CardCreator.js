import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { cardAPI } from '../services/api';
import PreviewCard from '../components/Card/PreviewCard';

const CardCreator = () => {
  const [loading, setLoading] = useState(false);
  const [previewCard, setPreviewCard] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [error, setError] = useState('');
  const [sections, setSections] = useState([
    { label: '', content: '' },
    { label: '', content: '' }
  ]);
  const [activeTab, setActiveTab] = useState('content');
  const { register, handleSubmit, watch, formState: { errors }, setValue, trigger } = useForm();
  const navigate = useNavigate();

  const formData = watch();

  // Update preview whenever form data changes
  useEffect(() => {
    updatePreview();
  }, [formData, sections, imagePreview]);

  const handleSectionChange = (idx, field, value) => {
    const newSections = [...sections];
    newSections[idx][field] = value;
    setSections(newSections);
  };

  const addSection = () => {
    setSections([...sections, { label: '', content: '' }]);
  };

  const removeSection = (idx) => {
    if (sections.length > 1) {
      setSections(sections.filter((_, i) => i !== idx));
    }
  };

  const buildContentFromSections = () => {
    return sections
      .filter(s => s.label || s.content)
      .map(s => `${s.label}: ${s.content}`)
      .join('\n');
  };

  const updatePreview = () => {
    const contentText = buildContentFromSections();
    const hasContent = formData?.title || contentText || imagePreview;
    
    if (hasContent) {
      setPreviewCard({
        title: formData?.title || 'Your Card Title',
        subtitle: formData?.subtitle || '',
        content: contentText,
        imageUrl: imagePreview,
        backgroundColor: formData?.backgroundColor || '#ffffff',
        textColor: formData?.textColor || '#1a202c',
        buttonColor: formData?.buttonColor || '#1b5e4f',
        shortCode: 'preview',
        views: 0
      });
    } else {
      setPreviewCard(null);
    }
  };

  const setColorValue = (field, value) => {
    setValue(field, value, { shouldValidate: true });
  };

  const onSubmit = async (data) => {
    console.log('Form submitted with data:', data);
    
    setLoading(true);
    setError('');
    
    try {
      // Validate form
      const isValid = await trigger();
      if (!isValid) {
        throw new Error('Please fill in all required fields correctly');
      }



      const contentText = buildContentFromSections();
      
      console.log('Creating card with content:', {
        title: data.title,
        subtitle: data.subtitle,
        content: contentText,
        backgroundColor: data.backgroundColor,
        textColor: data.textColor,
        buttonColor: data.buttonColor,
        hasImage: !!data.image?.[0]
      });

      const formDataToSend = new FormData();
      formDataToSend.append('title', data.title);
      formDataToSend.append('subtitle', data.subtitle || '');
      formDataToSend.append('content', contentText);
      formDataToSend.append('backgroundColor', data.backgroundColor || '#ffffff');
      formDataToSend.append('textColor', data.textColor || '#1a202c');
      formDataToSend.append('buttonColor', data.buttonColor || '#1b5e4f');
      
      // FIX: Properly handle image file upload
      if (data.image && data.image.length > 0) {
        const imageFile = data.image[0];
        console.log('Image file details:', {
          name: imageFile.name,
          type: imageFile.type,
          size: imageFile.size
        });
        formDataToSend.append('image', imageFile);
      }

      console.log('Sending API request...');
      
      // Make API call
      const response = await cardAPI.create(formDataToSend);
      
      console.log('Card created successfully:', response);

      // Show success message
      alert('Creating successful...');

      // Navigate to dashboard immediately after success
      navigate('/dashboard');
      
    } catch (error) {
      console.error('Error creating card:', error);
      
      let errorMessage = 'Error creating card. Please try again.';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      } else if (error.response?.status === 401) {
        errorMessage = 'Please log in to create cards';
        navigate('/login');
      } else if (error.response?.status === 400) {
        errorMessage = 'Invalid card data. Please check your inputs.';
      } else if (error.response?.status === 413) {
        errorMessage = 'Image file is too large. Please choose a smaller file.';
      }
      
      setError(errorMessage);
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    console.log('Form submit triggered');
    handleSubmit(onSubmit)(e).catch(error => {
      console.error('Form submission error:', error);
      setError('Form submission failed: ' + error.message);
    });
  };

  // Handle image file selection
  const handleImageFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setError('');
      };
      reader.readAsDataURL(file);

      // Set the file in react-hook-form
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      setValue('image', dataTransfer.files);
    }
  };

  const colorPresets = {
    background: [
      { name: 'White', color: '#ffffff', textColor: '#1f2937' },
      { name: 'Cream', color: '#fef3c7', textColor: '#78350f' },
      { name: 'Light Gray', color: '#f3f4f6', textColor: '#374151' },
      { name: 'Dark', color: '#1f2937', textColor: '#f9fafb' }
    ],
    text: [
      { name: 'Black', color: '#1f2937' },
      { name: 'Dark Gray', color: '#374151' },
      { name: 'Brown', color: '#78350f' },
      { name: 'White', color: '#ffffff' }
    ],
    accent: [
      { name: 'Teal', color: '#1b5e4f' },
      { name: 'Gold', color: '#d4a574' },
      { name: 'Orange', color: '#ea580c' },
      { name: 'Red', color: '#dc2626' },
      { name: 'Green', color: '#16a34a' },
      { name: 'Purple', color: '#9333ea' }
    ]
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-blue-50 to-cyan-50 dark:from-gray-900 dark:via-teal-950 dark:to-blue-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <motion.h1 
            className="text-5xl font-black bg-gradient-to-r from-teal-700 to-teal-900 dark:from-teal-400 dark:to-teal-600 bg-clip-text text-transparent mb-4"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            Create Your Digital Card
          </motion.h1>
          <motion.p 
            className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Design stunning, shareable digital cards with our intuitive creator
          </motion.p>
        </motion.div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Form Section */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className="xl:col-span-2"
          >
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-teal-200/50 dark:border-teal-700/50 overflow-hidden">
              {/* Form Tabs */}
              <div className="flex border-b border-teal-100 dark:border-teal-700">
                {['content', 'design', 'media'].map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-4 px-6 font-semibold transition-all duration-300 ${
                      activeTab === tab
                        ? 'bg-teal-600 text-white border-b-2 border-amber-400'
                        : 'text-gray-600 dark:text-gray-400 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/30'
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>

              <form onSubmit={handleFormSubmit} className="p-8">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl text-sm mb-6"
                  >
                    <strong>Error:</strong> {error}
                  </motion.div>
                )}

                <div className="space-y-8">
                  {/* Content Tab */}
                  <div className={activeTab !== 'content' ? 'hidden' : 'space-y-6'}>
                    {/* Title */}
                    <div>
                      <label className="block text-lg font-bold text-gray-900 dark:text-white mb-3">
                        <span className="flex items-center gap-2">
                          <span className="text-teal-600">📝</span>
                          Card Title *
                        </span>
                      </label>
                      <input
                        {...register('title', {
                          required: 'Title is required',
                          maxLength: {
                            value: 100,
                            message: 'Title must be less than 100 characters'
                          }
                        })}
                        type="text"
                        className="w-full px-4 py-3 bg-white dark:bg-gray-700 border-2 border-teal-200 dark:border-teal-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-300 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                        placeholder="e.g., STAMAYA ESPERANZA"
                      />
                      {errors.title && (
                        <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                          {errors.title.message}
                        </p>
                      )}
                    </div>

                    {/* Subtitle */}
                    <div>
                      <label className="block text-lg font-bold text-gray-900 dark:text-white mb-3">
                        <span className="flex items-center gap-2">
                          <span className="text-amber-600">🎨</span>
                          Subtitle (Accent Color)
                        </span>
                      </label>
                      <input
                        {...register('subtitle')}
                        type="text"
                        className="w-full px-4 py-3 bg-white dark:bg-gray-700 border-2 border-amber-200 dark:border-amber-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-300 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                        placeholder="e.g., SIGNATURE BLEND (will use accent color)"
                      />
                      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                        Optional: Appears after title in your chosen accent color
                      </p>
                    </div>

                    {/* Content Sections */}
                    <div>
                      <label className="block text-lg font-bold text-gray-900 dark:text-white mb-3">
                        <span className="flex items-center gap-2">
                          <span className="text-green-600">📋</span>
                          Card Details - Add Sections *
                        </span>
                      </label>
                      <div className="space-y-4 mb-4">
                        {sections.map((section, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-600"
                          >
                            <input
                              type="text"
                              placeholder="Label (e.g., RÉGION)"
                              value={section.label}
                              onChange={(e) => handleSectionChange(idx, 'label', e.target.value)}
                              className="flex-1 px-3 py-2 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                            />
                            <input
                              type="text"
                              placeholder="Content"
                              value={section.content}
                              onChange={(e) => handleSectionChange(idx, 'content', e.target.value)}
                              className="flex-1 px-3 py-2 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                            />
                            {sections.length > 1 && (
                              <motion.button
                                type="button"
                                onClick={() => removeSection(idx)}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
                              >
                                Remove
                              </motion.button>
                            )}
                          </motion.div>
                        ))}
                      </div>
                      <motion.button
                        type="button"
                        onClick={addSection}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full py-4 px-6 border-2 border-dashed border-teal-300 dark:border-teal-600 rounded-xl text-teal-600 dark:text-teal-400 hover:border-teal-500 dark:hover:border-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/30 font-semibold transition-all duration-300 flex items-center justify-center gap-2"
                      >
                        <span className="text-xl">+</span>
                        Add New Section
                      </motion.button>
                      <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                        Format: Each section will display as "🍃 LABEL: Content"
                      </p>
                    </div>
                  </div>

                  {/* Design Tab */}
                  <div className={activeTab !== 'design' ? 'hidden' : 'space-y-8'}>
                    <div className="text-center mb-6">
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        🎨 Color Customization
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        Choose from our <span className="font-semibold text-teal-600">ITACOSPECIALTY</span> palette
                      </p>
                    </div>

                    {/* Background Color */}
                    <div>
                      <label className="block text-lg font-bold text-gray-900 dark:text-white mb-4">
                        Background Color
                      </label>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {colorPresets.background.map((preset) => (
                            <motion.button
                              key={preset.color}
                              type="button"
                              onClick={() => {
                                setColorValue('backgroundColor', preset.color);
                                setColorValue('textColor', preset.textColor);
                              }}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="py-3 px-4 rounded-xl border-2 border-gray-300 dark:border-gray-600 hover:border-teal-500 transition-all font-medium text-sm shadow-lg"
                              style={{ 
                                backgroundColor: preset.color,
                                color: preset.textColor
                              }}
                            >
                              {preset.name}
                            </motion.button>
                          ))}
                        </div>
                        <div className="flex items-center gap-4 p-4 bg-white dark:bg-gray-700 rounded-xl border-2 border-teal-200 dark:border-teal-600">
                          <input
                            {...register('backgroundColor')}
                            type="color"
                            defaultValue="#ffffff"
                            className="w-16 h-16 rounded-lg cursor-pointer border-2 border-gray-300 dark:border-gray-600"
                            onChange={(e) => setColorValue('backgroundColor', e.target.value)}
                          />
                          <div className="flex-1">
                            <input
                              {...register('backgroundColor')}
                              type="text"
                              defaultValue="#ffffff"
                              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg text-sm font-mono text-gray-900 dark:text-white"
                              placeholder="#ffffff"
                              onChange={(e) => setColorValue('backgroundColor', e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Text Color */}
                    <div>
                      <label className="block text-lg font-bold text-gray-900 dark:text-white mb-4">
                        Text Color
                      </label>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {colorPresets.text.map((preset) => (
                            <motion.button
                              key={preset.color}
                              type="button"
                              onClick={() => setColorValue('textColor', preset.color)}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="py-3 px-4 rounded-xl border-2 border-gray-300 dark:border-gray-600 hover:border-teal-500 transition-all font-medium text-sm shadow-lg text-white"
                              style={{ backgroundColor: preset.color }}
                            >
                              {preset.name}
                            </motion.button>
                          ))}
                        </div>
                        <div className="flex items-center gap-4 p-4 bg-white dark:bg-gray-700 rounded-xl border-2 border-teal-200 dark:border-teal-600">
                          <input
                            {...register('textColor')}
                            type="color"
                            defaultValue="#1a202c"
                            className="w-16 h-16 rounded-lg cursor-pointer border-2 border-gray-300 dark:border-gray-600"
                            onChange={(e) => setColorValue('textColor', e.target.value)}
                          />
                          <div className="flex-1">
                            <input
                              {...register('textColor')}
                              type="text"
                              defaultValue="#1a202c"
                              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg text-sm font-mono text-gray-900 dark:text-white"
                              placeholder="#1a202c"
                              onChange={(e) => setColorValue('textColor', e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Accent Color */}
                    <div>
                      <label className="block text-lg font-bold text-gray-900 dark:text-white mb-4">
                        Accent Color
                      </label>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {colorPresets.accent.map((preset) => (
                            <motion.button
                              key={preset.color}
                              type="button"
                              onClick={() => setColorValue('buttonColor', preset.color)}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="py-3 px-4 rounded-xl border-2 border-gray-300 dark:border-gray-600 hover:border-gray-900 transition-all font-medium text-sm shadow-lg text-white"
                              style={{ backgroundColor: preset.color }}
                            >
                              {preset.name}
                            </motion.button>
                          ))}
                        </div>
                        <div className="flex items-center gap-4 p-4 bg-white dark:bg-gray-700 rounded-xl border-2 border-teal-200 dark:border-teal-600">
                          <input
                            {...register('buttonColor')}
                            type="color"
                            defaultValue="#1b5e4f"
                            className="w-16 h-16 rounded-lg cursor-pointer border-2 border-gray-300 dark:border-gray-600"
                            onChange={(e) => setColorValue('buttonColor', e.target.value)}
                          />
                          <div className="flex-1">
                            <input
                              {...register('buttonColor')}
                              type="text"
                              defaultValue="#1b5e4f"
                              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg text-sm font-mono text-gray-900 dark:text-white"
                              placeholder="#1b5e4f"
                              onChange={(e) => setColorValue('buttonColor', e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Color Tips */}
                    <div className="p-6 bg-gradient-to-r from-teal-500 to-teal-600 rounded-2xl text-white">
                      <h4 className="font-bold text-lg mb-2">🎯 Pro Tips</h4>
                      <ul className="text-sm space-y-1">
                        <li>• <strong>Teal + Gold</strong> - Premium & professional</li>
                        <li>• <strong>Dark background + White text</strong> - Modern & elegant</li>
                        <li>• <strong>High contrast</strong> - Better readability</li>
                        <li>• <strong>Brand colors</strong> - Maintain consistency</li>
                      </ul>
                    </div>
                  </div>

                  {/* Media Tab */}
                  <div className={activeTab !== 'media' ? 'hidden' : 'space-y-6'}>
                    {/* Image Upload - FIXED */}
                    <div>
                      <label className="block text-lg font-bold text-gray-900 dark:text-white mb-4">
                        <span className="flex items-center gap-2">
                          <span className="text-purple-600">🖼️</span>
                          Card Image
                        </span>
                      </label>
                      <div className="border-2 border-dashed border-teal-300 dark:border-teal-600 rounded-2xl p-8 text-center hover:border-teal-500 dark:hover:border-teal-400 transition-all duration-300">
                        <input
                          {...register('image', {
                            onChange: handleImageFileChange
                          })}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          id="image-upload"
                        />
                        <label
                          htmlFor="image-upload"
                          className="cursor-pointer block"
                        >
                          <div className="text-6xl mb-4">📸</div>
                          <p className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Click to upload an image
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            PNG, JPG, GIF up to 5MB
                          </p>
                        </label>
                      </div>
                      {imagePreview && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="mt-4 text-center"
                        >
                          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Preview:
                          </p>
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="mx-auto max-h-48 rounded-xl shadow-lg border-2 border-teal-200 dark:border-teal-600"
                          />
                        </motion.div>
                      )}
                    </div>

                    {/* Media Tips */}
                    <div className="p-6 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl text-white">
                      <h4 className="font-bold text-lg mb-2">💡 Image Tips</h4>
                      <ul className="text-sm space-y-1">
                        <li>• <strong>High quality</strong> - Sharp & clear images</li>
                        <li>• <strong>Good lighting</strong> - Well-lit photos work best</li>
                        <li>• <strong>Relevant content</strong> - Match your card's theme</li>
                        <li>• <strong>Proper ratio</strong> - Landscape images fit better</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: loading ? 1 : 1.02 }}
                  whileTap={{ scale: loading ? 1 : 0.98 }}
                  className="w-full mt-8 bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white py-4 px-6 rounded-xl font-bold text-lg shadow-2xl hover:shadow-3xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                >
                  {loading ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-6 h-6 border-2 border-white border-t-transparent rounded-full"
                      />
                      Creating Your Card...
                    </>
                  ) : (
                    <>
                      <span>✨</span>
                      Create Amazing Card
                      <span>✨</span>
                    </>
                  )}
                </motion.button>
              </form>
            </div>
          </motion.div>

          {/* Preview Section */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="xl:col-span-1"
          >
            <div className="sticky top-8">
              <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-teal-200/50 dark:border-teal-700/50 overflow-hidden">
                {/* Preview Header */}
                <div className="bg-gradient-to-r from-teal-600 to-teal-700 p-6 text-white">
                  <h2 className="text-2xl font-bold flex items-center gap-3">
                    <span>👁️</span>
                    Live Preview
                  </h2>
                  <p className="text-teal-100 mt-1">Real-time updates as you design</p>
                </div>

                <div className="p-6">
                  {previewCard ? (
                    <PreviewCard 
                      card={previewCard} 
                      isPreview={true}
                    />
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-center py-12 text-gray-500 dark:text-gray-400"
                    >
                      <div className="text-6xl mb-4">🎨</div>
                      <p className="text-lg font-semibold mb-2">Start Designing</p>
                      <p>Fill out the form to see your card come to life!</p>
                    </motion.div>
                  )}

                  {/* Preview Instructions */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="mt-6 p-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl text-white"
                  >
                    <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                      <span>🚀</span>
                      How it works:
                    </h3>
                    <ul className="text-sm space-y-2">
                      <li className="flex items-center gap-2">
                        <span className="text-amber-300">1.</span>
                        Design your card with the form
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-amber-300">2.</span>
                        Watch real-time preview updates
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-amber-300">3.</span>
                        Create to get shareable link & QR
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-amber-300">4.</span>
                        Share via URL or QR scanning
                      </li>
                    </ul>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default CardCreator;