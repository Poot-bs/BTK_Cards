import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { cardAPI } from '../services/api';
import PreviewCard from '../components/Card/PreviewCard';
import { useToastContext } from '../components/UI/ToastProvider';

const CardCreator = () => {
  const [loading, setLoading] = useState(false);
  const [previewCard, setPreviewCard] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [error, setError] = useState('');
  const [sections, setSections] = useState([
    { id: 's1', label: '', content: '', layout: 'block', fontFamily: 'Inter', italic: true, bold: false, fontSize: 'base' },
    { id: 's2', label: '', content: '', layout: 'block', fontFamily: 'Inter', italic: true, bold: false, fontSize: 'base' }
  ]);
  const [activeTab, setActiveTab] = useState('content');
  const { register, handleSubmit, watch, formState: { errors }, setValue, trigger } = useForm();
  const navigate = useNavigate();
  const { addToast } = useToastContext();

  const formData = watch();

  // Update preview whenever form data changes
  useEffect(() => {
    const timer = setTimeout(() => {
      updatePreview();
    }, 300);
    return () => clearTimeout(timer);
  }, [formData, sections, imagePreview]);

  const handleSectionChange = (id, field, value) => {
    setSections(prevSections => 
      prevSections.map(section => 
        section.id === id ? { ...section, [field]: value } : section
      )
    );
  };

  const addSection = () => {
    setSections([...sections, { id: `s${Date.now()}`, label: '', content: '', layout: 'block', fontFamily: 'Inter', italic: true, bold: false, fontSize: 'base' }]);
  };

  const removeSection = (id) => {
    if (sections.length > 1) {
      setSections(sections.filter(section => section.id !== id));
    }
  };

  const buildContentFromSections = () => {
    return sections
      .filter(s => s.label || s.content)
      .map(s => {
        const layoutMarker = s.layout === 'inline' ? '|inline' : '';
        const fontMarker = s.fontFamily && s.fontFamily !== 'Inter' ? `|font=${s.fontFamily}` : '';
        const sizeMarker = s.fontSize && s.fontSize !== 'base' ? `|size=${s.fontSize}` : '';
        const italicMarker = s.italic ? '|italic' : '';
        const boldMarker = s.bold ? '|bold' : '';
        return `${s.label}${layoutMarker}${fontMarker}${sizeMarker}${italicMarker}${boldMarker}: ${s.content}`;
      })
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
        fontFamily: formData?.fontFamily || 'Inter',
        titleFont: formData?.titleFont || 'Inter',
        subtitleFont: formData?.subtitleFont || 'Inter',
        titleLayout: formData?.titleLayout || 'inline',
        titleLines: formData?.titleLines || '3',
        titleBold: formData?.titleBold,
        subtitleSize: formData?.subtitleSize || 'xl',
        subtitleBold: formData?.subtitleBold,
        description: formData?.description || '',
        descriptionFont: formData?.descriptionFont || 'Inter',
        descriptionSize: formData?.descriptionSize || 'base',
        descriptionColor: formData?.descriptionColor || formData?.textColor || '#000000',
        descriptionAlign: formData?.descriptionAlign || 'left',
        descriptionBold: formData?.descriptionBold,
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
        fontFamily: data.fontFamily,
        titleFont: data.titleFont,
        subtitleFont: data.subtitleFont,
        hasImage: !!data.image?.[0]
      });

      const formDataToSend = new FormData();
      formDataToSend.append('title', data.title);
      formDataToSend.append('subtitle', data.subtitle || '');
      formDataToSend.append('content', contentText);
      formDataToSend.append('backgroundColor', data.backgroundColor || '#ffffff');
      formDataToSend.append('textColor', data.textColor || '#1a202c');
      formDataToSend.append('buttonColor', data.buttonColor || '#1b5e4f');
      formDataToSend.append('fontFamily', data.fontFamily || 'Inter');
      formDataToSend.append('titleFont', data.titleFont || 'Inter');
      formDataToSend.append('subtitleFont', data.subtitleFont || 'Inter');
      formDataToSend.append('titleLayout', data.titleLayout || 'inline');
      formDataToSend.append('titleLines', data.titleLines || '3');
      formDataToSend.append('titleBold', data.titleBold || false);
      formDataToSend.append('subtitleSize', data.subtitleSize || 'xl');
      formDataToSend.append('subtitleBold', data.subtitleBold || false);
      formDataToSend.append('description', data.description || '');
      formDataToSend.append('descriptionFont', data.descriptionFont || 'Inter');
      formDataToSend.append('descriptionSize', data.descriptionSize || 'base');
      formDataToSend.append('descriptionColor', data.descriptionColor || data.textColor || '#000000');
      formDataToSend.append('descriptionAlign', data.descriptionAlign || 'left');
      formDataToSend.append('descriptionBold', data.descriptionBold || false);
      
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
      addToast('Card created successfully!', 'success');

      // Navigate to dashboard immediately after success
      navigate('/dashboard', { replace: true });
      
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
      addToast(errorMessage, 'error');
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

  const fontOptions = [
    { name: 'Inter (Modern)', value: 'Inter' },
    { name: 'Roboto (Clean)', value: 'Roboto' },
    { name: 'Playfair Display (Elegant)', value: 'Playfair Display' },
    { name: 'Montserrat (Bold)', value: 'Montserrat' },
    { name: 'Open Sans (Friendly)', value: 'Open Sans' },
    { name: 'Lato (Neutral)', value: 'Lato' },
    { name: 'Merriweather (Classic)', value: 'Merriweather' },
  ];

  const sizeOptions = [
    { name: 'Small', value: 'sm' },
    { name: 'Normal', value: 'base' },
    { name: 'Large', value: 'lg' },
    { name: 'Extra Large', value: 'xl' },
    { name: '2XL', value: '2xl' },
    { name: '3XL', value: '3xl' },
    { name: '4XL', value: '4xl' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-blue-50 to-cyan-50 dark:from-gray-900 dark:via-teal-950 dark:to-blue-900 py-4 sm:py-8">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6 sm:mb-12"
        >
          <motion.h1 
            className="text-3xl sm:text-4xl md:text-5xl font-black bg-gradient-to-r from-teal-700 to-teal-900 dark:from-teal-400 dark:to-teal-600 bg-clip-text text-transparent mb-2 sm:mb-4"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            Create Your Digital Card
          </motion.h1>
          <motion.p 
            className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Design stunning, shareable digital cards with our intuitive creator
          </motion.p>
        </motion.div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-8">
          {/* Form Section */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className="xl:col-span-2 order-2 xl:order-1"
          >
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-2xl border border-teal-200/50 dark:border-teal-700/50 overflow-hidden">
              {/* Form Tabs */}
              <div className="flex border-b border-teal-100 dark:border-teal-700">
                {['content', 'design', 'media'].map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-3 sm:py-4 px-2 sm:px-6 font-semibold text-sm sm:text-base transition-all duration-300 ${
                      activeTab === tab
                        ? 'bg-teal-600 text-white border-b-2 border-amber-400'
                        : 'text-gray-600 dark:text-gray-400 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/30'
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>

              <form onSubmit={handleFormSubmit} className="p-4 sm:p-6 md:p-8">
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
                      <textarea
                        {...register('title', {
                          required: 'Title is required',
                          maxLength: {
                            value: 500,
                            message: 'Title must be less than 500 characters'
                          }
                        })}
                        rows={2}
                        className="w-full px-4 py-3 bg-white dark:bg-gray-700 border-2 border-teal-200 dark:border-teal-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-300 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                        placeholder="e.g., GEISHA WHITE HONEY (Press Enter for new line)"
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
                      <textarea
                        {...register('subtitle')}
                        rows={2}
                        className="w-full px-4 py-3 bg-white dark:bg-gray-700 border-2 border-amber-200 dark:border-amber-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-300 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                        placeholder="e.g., SIGNATURE BLEND (Press Enter for new line)"
                      />
                      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                        Optional: Appears after title in your chosen accent color
                      </p>
                    </div>

                    {/* Title & Subtitle Quick Controls */}
                    <div className="bg-gradient-to-r from-teal-50 to-amber-50 dark:from-gray-700/50 dark:to-gray-700/50 rounded-xl p-4 space-y-4 border-2 border-dashed border-teal-200 dark:border-gray-600">
                      <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <span>⚙️</span> Title & Subtitle Layout
                      </h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Subtitle Position */}
                        <div>
                          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                            Subtitle Position
                          </label>
                          <select
                            {...register('titleLayout')}
                            className="w-full px-4 py-2 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg text-gray-900 dark:text-white"
                          >
                            <option value="inline">Same Line as Title</option>
                            <option value="stacked">Below Title (Stacked)</option>
                          </select>
                        </div>

                        {/* Title Size */}
                        <div>
                          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                            Title Size
                          </label>
                          <select
                            {...register('titleLines')}
                            className="w-full px-4 py-2 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg text-gray-900 dark:text-white"
                          >
                            <option value="1">Large</option>
                            <option value="2">Medium</option>
                            <option value="3">Small</option>
                          </select>
                        </div>

                        {/* Subtitle Size */}
                        <div>
                          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                            Subtitle Size
                          </label>
                          <select
                            {...register('subtitleSize')}
                            className="w-full px-4 py-2 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg text-gray-900 dark:text-white"
                          >
                            <option value="xl">Large (Match Title)</option>
                            <option value="lg">Medium</option>
                            <option value="base">Small</option>
                          </select>
                        </div>

                        {/* Bold Options */}
                        <div className="flex items-end gap-4 pb-1">
                          <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                            <input
                              {...register('titleBold')}
                              type="checkbox"
                              defaultChecked={true}
                              className="w-4 h-4 text-teal-600 focus:ring-teal-500 rounded"
                            />
                            Title Bold
                          </label>
                          <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                            <input
                              {...register('subtitleBold')}
                              type="checkbox"
                              defaultChecked={true}
                              className="w-4 h-4 text-amber-600 focus:ring-amber-500 rounded"
                            />
                            Subtitle Bold
                          </label>
                        </div>
                      </div>
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
                          <div
                            key={section.id}
                            className="relative flex flex-col gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-600"
                          >
                            {sections.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeSection(section.id)}
                                className="absolute -top-3 -right-3 p-2 bg-red-500 text-white rounded-full shadow-md hover:bg-red-600 transition-colors z-10"
                                title="Remove Section"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                              </button>
                            )}
                            <div className="flex gap-3">
                              <input
                                type="text"
                                placeholder="Label (e.g., RÉGION)"
                                value={section.label || ''}
                                onChange={(e) => handleSectionChange(section.id, 'label', e.target.value)}
                                className="flex-1 px-3 py-2 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                              />
                              <input
                                type="text"
                                placeholder="Content"
                                value={section.content || ''}
                                onChange={(e) => handleSectionChange(section.id, 'content', e.target.value)}
                                className="flex-1 px-3 py-2 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                              />
                            </div>
                            <div className="flex flex-wrap items-center gap-4">
                                <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 cursor-pointer">
                                  <input
                                    type="radio"
                                    name={`layout-${section.id}`}
                                    checked={section.layout !== 'inline'}
                                    onChange={() => handleSectionChange(section.id, 'layout', 'block')}
                                    className="text-teal-600 focus:ring-teal-500"
                                  />
                                  Block
                                </label>
                                <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 cursor-pointer">
                                  <input
                                    type="radio"
                                    name={`layout-${section.id}`}
                                    checked={section.layout === 'inline'}
                                    onChange={() => handleSectionChange(section.id, 'layout', 'inline')}
                                    className="text-teal-600 focus:ring-teal-500"
                                  />
                                  Inline
                                </label>
                                <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 cursor-pointer ml-2">
                                  <input
                                    type="checkbox"
                                    checked={section.italic !== false}
                                    onChange={(e) => handleSectionChange(section.id, 'italic', e.target.checked)}
                                    className="text-teal-600 focus:ring-teal-500 rounded"
                                  />
                                  Italic
                                </label>
                                <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 cursor-pointer ml-2">
                                  <input
                                    type="checkbox"
                                    checked={section.bold === true}
                                    onChange={(e) => handleSectionChange(section.id, 'bold', e.target.checked)}
                                    className="text-teal-600 focus:ring-teal-500 rounded"
                                  />
                                  Bold
                                </label>
                                <select
                                  value={section.fontFamily || 'Inter'}
                                  onChange={(e) => handleSectionChange(section.id, 'fontFamily', e.target.value)}
                                  className="px-2 py-1 text-sm border rounded bg-white dark:bg-gray-600 dark:text-white dark:border-gray-500"
                                >
                                  {fontOptions.map(font => (
                                    <option key={font.value} value={font.value}>{font.name}</option>
                                  ))}
                                </select>
                                <select
                                  value={section.fontSize || 'base'}
                                  onChange={(e) => handleSectionChange(section.id, 'fontSize', e.target.value)}
                                  className="px-2 py-1 text-sm border rounded bg-white dark:bg-gray-600 dark:text-white dark:border-gray-500"
                                >
                                  {sizeOptions.map(size => (
                                    <option key={size.value} value={size.value}>{size.name}</option>
                                  ))}
                                </select>
                            </div>
                          </div>
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

                    {/* Description */}
                    <div>
                      <label className="block text-lg font-bold text-gray-900 dark:text-white mb-3">
                        <span className="flex items-center gap-2">
                          <span className="text-blue-600">📄</span>
                          Description
                        </span>
                      </label>
                      <textarea
                        {...register('description')}
                        rows={4}
                        className="w-full px-4 py-3 bg-white dark:bg-gray-700 border-2 border-blue-200 dark:border-blue-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                        placeholder="Add a description or bio..."
                      />
                      
                      {/* Description Controls */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
                        <select
                          {...register('descriptionFont')}
                          className="px-3 py-2 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg text-sm"
                        >
                          {fontOptions.map(font => (
                            <option key={font.value} value={font.value}>{font.name}</option>
                          ))}
                        </select>
                        <select
                          {...register('descriptionSize')}
                          className="px-3 py-2 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg text-sm"
                        >
                          {sizeOptions.map(size => (
                            <option key={size.value} value={size.value}>{size.name}</option>
                          ))}
                        </select>
                        <select
                          {...register('descriptionAlign')}
                          className="px-3 py-2 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg text-sm"
                        >
                          <option value="left">Align Left</option>
                          <option value="center">Align Center</option>
                          <option value="right">Align Right</option>
                          <option value="justify">Justify</option>
                        </select>
                        <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 cursor-pointer bg-white dark:bg-gray-600 px-3 py-2 border border-gray-300 dark:border-gray-500 rounded-lg">
                          <input
                            {...register('descriptionBold')}
                            type="checkbox"
                            className="text-teal-600 focus:ring-teal-500 rounded"
                          />
                          Bold
                        </label>
                        <input
                          {...register('descriptionColor')}
                          type="color"
                          className="w-full h-10 rounded-lg cursor-pointer border border-gray-300 dark:border-gray-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Design Tab */}
                  <div className={activeTab !== 'design' ? 'hidden' : 'space-y-8'}>
                    <div className="text-center mb-6">
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        🎨 Color & Typography
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        Customize the look and feel of your card
                      </p>
                    </div>

                    {/* Font Selection */}
                    <div>
                      <label className="block text-lg font-bold text-gray-900 dark:text-white mb-4">
                        Global Typography
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        {fontOptions.map((font) => (
                          <label
                            key={font.value}
                            className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${
                              watch('fontFamily') === font.value
                                ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/30'
                                : 'border-gray-200 dark:border-gray-700 hover:border-teal-300'
                            }`}
                          >
                            <span style={{ fontFamily: font.value }} className="text-lg">
                              {font.name}
                            </span>
                            <input
                              {...register('fontFamily')}
                              type="radio"
                              value={font.value}
                              className="w-5 h-5 text-teal-600 focus:ring-teal-500"
                            />
                          </label>
                        ))}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                            Title Font
                          </label>
                          <select
                            {...register('titleFont')}
                            className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg"
                          >
                            <option value="">Same as Global</option>
                            {fontOptions.map(font => (
                              <option key={font.value} value={font.value}>{font.name}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                            Subtitle Font
                          </label>
                          <select
                            {...register('subtitleFont')}
                            className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg"
                          >
                            <option value="">Same as Global</option>
                            {fontOptions.map(font => (
                              <option key={font.value} value={font.value}>{font.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>
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
            className="xl:col-span-1 order-1 xl:order-2"
          >
            <div className="sticky top-4 sm:top-8">
              <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-2xl border border-teal-200/50 dark:border-teal-700/50 overflow-hidden">
                {/* Preview Header */}
                <div className="bg-gradient-to-r from-teal-600 to-teal-700 p-4 sm:p-6 text-white">
                  <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2 sm:gap-3">
                    <span>👁️</span>
                    Live Preview
                  </h2>
                  <p className="text-teal-100 mt-1 text-sm sm:text-base">Real-time updates as you design</p>
                </div>

                <div className="p-3 sm:p-6">
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