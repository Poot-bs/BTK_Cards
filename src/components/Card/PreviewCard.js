import React, { useState, useEffect } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { motion, AnimatePresence } from 'framer-motion';

const PreviewCard = ({
  card,
  showQR = false,
  onShare,
  isPreview = false
}) => {
  const cardUrl = `${window.location.origin}/card/${card.shortCode}`;
  const [showSuccess, setShowSuccess] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleShare = async () => {
    if (onShare) {
      onShare(cardUrl);
    } else {
      try {
        await navigator.clipboard.writeText(cardUrl);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      } catch (error) {
        alert('Failed to copy URL to clipboard');
      }
    }
  };

  // Parse the content to extract sections (assuming format: "TITLE\nSUBTITLE\nSECTION: content\n...")
  const parseCardContent = (content) => {
    if (!content) return { title: '', subtitle: '', sections: [] };
    
    const lines = content.split('\n').filter(l => l.trim());
    const sections = [];
    let currentSection = null;

    lines.forEach((line) => {
      if (line.includes(':')) {
        const [labelPart, ...rest] = line.split(':');
        let label = labelPart.trim();
        let layout = 'block';
        let fontFamily = null;
        let italic = false;
        let bold = false;
        let fontSize = 'base';

        // Check for layout marker
        if (label.includes('|inline')) {
          label = label.replace('|inline', '');
          layout = 'inline';
        }

        // Check for font marker
        if (label.includes('|font=')) {
          const fontMatch = label.match(/\|font=([^|]+)/);
          if (fontMatch) {
            fontFamily = fontMatch[1];
            label = label.replace(fontMatch[0], '');
          }
        }

        // Check for size marker
        if (label.includes('|size=')) {
          const sizeMatch = label.match(/\|size=([^|]+)/);
          if (sizeMatch) {
            fontSize = sizeMatch[1];
            label = label.replace(sizeMatch[0], '');
          }
        }

        // Check for italic marker
        if (label.includes('|italic')) {
          label = label.replace('|italic', '');
          italic = true;
        }

        // Check for bold marker
        if (label.includes('|bold')) {
          label = label.replace('|bold', '');
          bold = true;
        }

        if (currentSection) sections.push(currentSection);
        currentSection = {
          label: label.trim(),
          content: rest.join(':').trim(),
          layout,
          fontFamily,
          italic,
          bold,
          fontSize
        };
      } else if (currentSection) {
        currentSection.content += ' ' + line.trim();
      }
    });
    
    if (currentSection) sections.push(currentSection);
    
    return { sections };
  };

  const contentData = parseCardContent(card.content);

  return (
    <div className="w-full max-w-xl mx-auto px-2 sm:px-0">
      {/* Image Section - Offset above card */}
      {card.imageUrl && (
        <div className="relative px-8 sm:px-16 -mb-20 sm:-mb-32 z-10">
          <img 
            src={card.imageUrl} 
            alt={card.title}
            className="w-full h-48 sm:h-64 object-cover rounded-xl sm:rounded-2xl shadow-xl"
          />
        </div>
      )}
      
      {/* Card Display */}
      <div 
        className="rounded-2xl sm:rounded-3xl shadow-2xl overflow-visible"
        style={{ 
          backgroundColor: card.backgroundColor || '#ffffff',
          color: card.textColor || '#1a202c',
          fontFamily: card.fontFamily || 'Inter, sans-serif',
          padding: isMobile ? '1.25rem' : '2rem',
          paddingTop: card.imageUrl ? (isMobile ? '6rem' : '10rem') : (isMobile ? '1.25rem' : '2rem'),
          paddingBottom: isMobile ? '1.5rem' : '2.5rem',
          minHeight: 'auto'
        }}
      >

        {/* Content Section */}
        <div className="space-y-4 sm:space-y-6">
          {/* Title with Accent */}
          <div>
            <h2 
              className={`uppercase tracking-tight leading-tight ${card.titleBold !== false ? 'font-black' : 'font-normal'}`}
              style={{ 
                color: card.textColor || '#1a202c',
                fontFamily: card.titleFont || 'inherit',
                fontSize: card.titleLines === '1' ? (isMobile ? '1.5rem' : '2.5rem') : card.titleLines === '2' ? (isMobile ? '1.25rem' : '2rem') : (isMobile ? '1rem' : '1.5rem'),
                lineHeight: '1.2',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word'
              }}
            >
              {card.title}
              {card.subtitle && (
                card.titleLayout === 'stacked' ? (
                  <div 
                    className={`mt-1 ${card.subtitleBold !== false ? 'font-black' : 'font-normal'}`}
                    style={{ 
                      color: card.buttonColor || '#f59e0b',
                      fontFamily: card.subtitleFont || 'inherit',
                      fontSize: card.subtitleSize === 'xl' ? (isMobile ? '1.5rem' : '2.5rem') : card.subtitleSize === 'lg' ? (isMobile ? '1.25rem' : '2rem') : (isMobile ? '1rem' : '1.5rem'),
                      lineHeight: '1.2',
                      whiteSpace: 'pre-wrap'
                    }}
                  >
                    {card.subtitle}
                  </div>
                ) : (
                  <span 
                    className={`ml-1 sm:ml-2 ${card.subtitleBold !== false ? 'font-black' : 'font-normal'}`}
                    style={{ 
                      color: card.buttonColor || '#f59e0b',
                      fontFamily: card.subtitleFont || 'inherit',
                      fontSize: card.subtitleSize === 'xl' ? (isMobile ? '1.5rem' : '2.5rem') : card.subtitleSize === 'lg' ? (isMobile ? '1.25rem' : '2rem') : (isMobile ? '1rem' : '1.5rem'),
                      lineHeight: '1.2',
                      whiteSpace: 'pre-wrap'
                    }}
                  >
                    {card.subtitle}
                  </span>
                )
              )}
            </h2>
          </div>

          {/* Details Sections */}
          <div className="space-y-2 sm:space-y-3">
            {contentData.sections.map((section, idx) => (
              <div key={idx} style={{ fontFamily: section.fontFamily || 'inherit' }}>
                <div className="flex items-start gap-2 sm:gap-3">
                  <span className="text-lg sm:text-xl mt-0.5" style={{ color: card.buttonColor || '#1b5e4f' }}>🍃</span>
                  <div className={section.layout === 'inline' ? 'flex flex-wrap gap-1 items-baseline' : ''}>
                    <p 
                      className={`font-bold tracking-wide ${section.bold ? 'font-black' : ''}`}
                      style={{ 
                        color: card.textColor || '#1a202c',
                        fontSize: section.fontSize === 'lg' ? (isMobile ? '0.875rem' : '1.125rem') : section.fontSize === 'xl' ? (isMobile ? '1rem' : '1.25rem') : (isMobile ? '0.875rem' : '1rem')
                      }}
                    >
                      {section.label}{section.layout === 'inline' ? ' :' : ''}
                    </p>
                    <p 
                      className={`${section.italic ? 'italic' : ''} ${section.bold ? 'font-semibold' : ''}`}
                      style={{ 
                        color: card.textColor || '#1a202c',
                        opacity: 0.85,
                        fontSize: section.fontSize === 'lg' ? (isMobile ? '0.875rem' : '1.125rem') : section.fontSize === 'xl' ? (isMobile ? '1rem' : '1.25rem') : (isMobile ? '0.875rem' : '1rem'),
                        marginTop: section.layout !== 'inline' ? '0.25rem' : '0',
                        marginLeft: section.layout !== 'inline' ? '0' : '0.25rem'
                      }}
                    >
                      {section.content}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Description - Styled like Profil Gustatif section */}
          {card.description && (
            <div className="mt-2">
              <div 
                className={`${card.descriptionBold ? 'font-semibold' : ''}`}
                style={{ 
                  fontFamily: card.descriptionFont || 'inherit',
                  color: card.descriptionColor || card.textColor || 'inherit',
                  textAlign: card.descriptionAlign || 'left',
                  whiteSpace: 'pre-wrap',
                  fontSize: card.descriptionSize === 'lg' ? (isMobile ? '0.875rem' : '1.125rem') : card.descriptionSize === 'sm' ? (isMobile ? '0.75rem' : '0.875rem') : (isMobile ? '0.875rem' : '1rem'),
                  lineHeight: '1.6',
                  marginLeft: isMobile ? '1.5rem' : '2rem'
                }}
              >
                {card.description}
              </div>
            </div>
          )}

            {/* Fallback content display if no sections */}
            {contentData.sections.length === 0 && card.content && (
              <p 
                className="text-sm leading-relaxed whitespace-pre-wrap"
                style={{ 
                  color: card.textColor || '#1a202c',
                  opacity: 0.9
                }}
              >
                {card.content}
              </p>
            )}
          </div>

          {/* Action Button */}
          {!isPreview && (
            <div className="pt-4">
              <button
                onClick={handleShare}
                className="w-full px-6 py-3 rounded-lg font-bold text-white transition-all hover:shadow-lg"
                style={{ 
                  backgroundColor: card.buttonColor || '#d97706'
                }}
              >
                Share Card
              </button>
            </div>
          )}
        </div>

      {/* QR Code */}
      {showQR && (
        <div className="mt-6 p-4 bg-white rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-3 text-center">QR Code</h3>
          <div className="flex justify-center">
            <QRCodeCanvas
              value={cardUrl}
              size={200}
              level="H"
              includeMargin
              fgColor="#000000"
            />
          </div>
          <div className="mt-4 flex gap-2">
            <input
              type="text"
              value={cardUrl}
              readOnly
              className="flex-1 px-3 py-2 border rounded-lg text-sm"
            />
            <button
              onClick={() => navigator.clipboard.writeText(cardUrl)}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm"
            >
              Copy
            </button>
          </div>
        </div>
      )}

      {/* Success Message */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-4 right-4 z-50"
          >
            <div className="bg-gradient-to-r from-teal-500 to-teal-600 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-3">
              <span className="text-2xl">✅</span>
              <span className="font-semibold">Card URL copied to clipboard!</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PreviewCard;