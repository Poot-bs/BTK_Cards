import React, { useState } from 'react';
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

        // Check for italic marker
        if (label.includes('|italic')) {
          label = label.replace('|italic', '');
          italic = true;
        }

        if (currentSection) sections.push(currentSection);
        currentSection = {
          label: label.trim(),
          content: rest.join(':').trim(),
          layout,
          fontFamily,
          italic
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
    <div className="max-w-md mx-auto">
      {/* Card Display */}
      <div 
        className="rounded-2xl shadow-2xl overflow-hidden"
        style={{ 
          backgroundColor: card.backgroundColor || '#ffffff',
          color: card.textColor || '#1a202c',
          fontFamily: card.fontFamily || 'Inter, sans-serif'
        }}
      >
        {/* Image Section */}
        {card.imageUrl && (
          <div className="relative">
            <img 
              src={card.imageUrl} 
              alt={card.title}
              className="w-full h-56 object-cover"
            />
          </div>
        )}

        {/* Content Section */}
        <div className="p-8 space-y-6">
          {/* Title with Accent */}
          <div>
            <h2 
              className="text-3xl font-black uppercase tracking-tight leading-tight"
              style={{ 
                color: card.textColor || '#1a202c',
                fontFamily: card.titleFont || 'inherit'
              }}
            >
              {card.title}
              {card.subtitle && (
                card.titleLayout === 'stacked' ? (
                  <div 
                    className="mt-1 text-xl font-black"
                    style={{ 
                      color: card.buttonColor || '#f59e0b',
                      fontFamily: card.subtitleFont || 'inherit'
                    }}
                  >
                    {card.subtitle}
                  </div>
                ) : (
                  <span 
                    className="ml-2 font-black"
                    style={{ 
                      color: card.buttonColor || '#f59e0b',
                      fontFamily: card.subtitleFont || 'inherit'
                    }}
                  >
                    {card.subtitle}
                  </span>
                )
              )}
            </h2>
          </div>

          {/* Details Sections */}
          <div className="space-y-4">
            {contentData.sections.map((section, idx) => (
              <div key={idx} className="space-y-1" style={{ fontFamily: section.fontFamily || 'inherit' }}>
                <div className="flex items-start gap-2">
                  <span className="text-lg">🍃</span>
                  <div className={section.layout === 'inline' ? 'flex flex-wrap gap-2 items-baseline' : ''}>
                    <p 
                      className="text-sm font-bold uppercase tracking-wider"
                      style={{ color: card.textColor || '#1a202c' }}
                    >
                      {section.label}{section.layout === 'inline' ? ':' : ''}
                    </p>
                    <p 
                      className={`text-sm ${section.italic ? 'italic' : ''}`}
                      style={{ 
                        color: card.textColor || '#1a202c',
                        opacity: 0.9
                      }}
                    >
                      {section.content}
                    </p>
                  </div>
                </div>
              </div>
            ))}

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