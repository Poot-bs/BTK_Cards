import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeCanvas } from 'qrcode.react';
import { cardAPI } from '../services/api';
import PreviewCard from '../components/Card/PreviewCard';
import { useAuth } from '../contexts/AuthContext';
import { useToastContext } from '../components/UI/ToastProvider';
import { Button, Card } from '../components/UI';
import { useTheme } from '../contexts/ThemeContext';

const Dashboard = () => {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCard, setSelectedCard] = useState(null);
  const [editingCard, setEditingCard] = useState(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [showQRModal, setShowQRModal] = useState(null);
  const [deleteModalCard, setDeleteModalCard] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const qrRef = useRef(null);
  const { user } = useAuth();
  const { addToast } = useToastContext();
  const { isDark } = useTheme();

  useEffect(() => {
    fetchUserCards();
  }, []);

  const fetchUserCards = async () => {
    try {
      const response = await cardAPI.getUserCards();
      setCards(response.data.cards);
    } catch (error) {
      console.error('Error fetching cards:', error);
      addToast('Error loading cards', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort cards
  const filteredAndSortedCards = cards
    .filter(card => 
      card.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.content?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt);
        case 'views':
          return b.views - a.views;
        case 'title':
          return (a.title || '').localeCompare(b.title || '');
        default:
          return 0;
      }
    });

  const handleDeleteCard = async (cardId) => {
    try {
      await cardAPI.delete(cardId);
      setCards(cards.filter(card => card._id !== cardId));
      if (selectedCard && selectedCard._id === cardId) {
        setSelectedCard(null);
      }
      setDeleteModalCard(null);
      addToast('Card deleted successfully', 'success');
    } catch (error) {
      console.error('Error deleting card:', error);
      addToast('Error deleting card', 'error');
    }
  };

  const openEdit = (card) => {
    setEditingCard({ ...card });
    setImagePreview(card.imageUrl || '');
    setEditError('');
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    setEditError('');

    try {
      const response = await cardAPI.update(editingCard._id, {
        title: editingCard.title,
        subtitle: editingCard.subtitle,
        content: editingCard.content,
        backgroundColor: editingCard.backgroundColor,
        textColor: editingCard.textColor,
        buttonColor: editingCard.buttonColor,
        fontFamily: editingCard.fontFamily,
        titleFont: editingCard.titleFont,
        subtitleFont: editingCard.subtitleFont,
        titleLayout: editingCard.titleLayout,
        titleLines: editingCard.titleLines,
        titleBold: editingCard.titleBold,
        subtitleSize: editingCard.subtitleSize,
        subtitleBold: editingCard.subtitleBold
      });

      // Update the card in the local state
      setCards(cards.map(card =>
        card._id === editingCard._id ? response.data.card : card
      ));

      // Update selected card if it's the one being edited
      if (selectedCard && selectedCard._id === editingCard._id) {
        setSelectedCard(response.data.card);
      }

      setEditingCard(null);
      addToast('Card updated successfully', 'success');
    } catch (error) {
      console.error('Error updating card:', error);
      setEditError(error.response?.data?.message || 'Error updating card');
      addToast('Error updating card', 'error');
    } finally {
      setEditLoading(false);
    }
  };

  const downloadQRCode = (card) => {
    if (!qrRef.current) return;
    
    const canvas = qrRef.current.querySelector('canvas');
    const url = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = url;
    link.download = `${card.title || 'card'}-qr-code.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('QR code downloaded successfully!', 'success');
    setShowQRModal(null);
  };

  const cardStats = {
    total: cards.length,
    totalViews: cards.reduce((sum, card) => sum + (card.views || 0), 0),
    mostViewed: cards.reduce((max, card) => (card.views > (max?.views || 0) ? card : max), null)
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gradient-to-br from-teal-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-teal-600 border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-teal-700 dark:text-teal-300 font-medium">Loading your cards...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gradient-to-br from-teal-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 sm:mb-8"
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-6 mb-4 sm:mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-teal-700 to-blue-700 dark:from-teal-400 dark:to-blue-300 bg-clip-text text-transparent">
                My Digital Cards
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1 sm:mt-2 text-sm sm:text-base md:text-lg">
                Manage and track your digital business cards
              </p>
            </div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full sm:w-auto"
            >
              <button
                onClick={() => setShowCreateModal(true)}
                className="w-full sm:w-auto bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                <span className="text-lg">+</span>
                Create New Card
              </button>
            </motion.div>
          </div>

          {/* Stats Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6"
          >
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-teal-200/50 dark:border-teal-700/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-teal-100 dark:bg-teal-900 rounded-lg flex items-center justify-center">
                  <span className="text-teal-600 dark:text-teal-400 text-lg">📊</span>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Cards</p>
                  <p className="text-2xl font-bold text-teal-700 dark:text-teal-300">{cardStats.total}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-blue-200/50 dark:border-blue-700/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                  <span className="text-blue-600 dark:text-blue-400 text-lg">👁️</span>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Views</p>
                  <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{cardStats.totalViews}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-purple-200/50 dark:border-purple-700/50 overflow-hidden">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex-shrink-0 flex items-center justify-center">
                  <span className="text-purple-600 dark:text-purple-400 text-lg">🔥</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Most Viewed</p>
                  <p className="text-lg font-bold text-purple-700 dark:text-purple-300 truncate" title={cardStats.mostViewed?.title || 'N/A'}>
                    {cardStats.mostViewed?.title || 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Search and Filter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 mb-6"
          >
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search cards..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-teal-200 dark:border-teal-700 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-300"
              />
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span>
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-teal-200 dark:border-teal-700 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-300"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="views">Most Views</option>
              <option value="title">Title A-Z</option>
            </select>
          </motion.div>
        </motion.div>

        {filteredAndSortedCards.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16"
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-8xl mb-6"
            >
              🎨
            </motion.div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              {searchTerm ? 'No matching cards found' : 'No cards yet'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-8 text-lg">
              {searchTerm ? 'Try adjusting your search terms' : 'Create your first digital card to get started'}
            </p>
            <Link to="/create">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Create Your First Card
              </motion.button>
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cards List */}
            <div className="lg:col-span-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <AnimatePresence>
                  {filteredAndSortedCards.map((card, index) => (
                    <motion.div
                      key={card._id}
                      initial={{ opacity: 0, y: 20, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -20, scale: 0.9 }}
                      transition={{ delay: index * 0.1, duration: 0.3 }}
                      whileHover={{ y: -5, scale: 1.02 }}
                      className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl overflow-hidden border border-teal-200/50 dark:border-teal-700/50 transition-all duration-300 cursor-pointer"
                      onClick={() => setSelectedCard(card)}
                    >
                      {card.imageUrl && (
                        <div className="relative h-40 overflow-hidden">
                          <img
                            src={card.imageUrl}
                            alt={card.title}
                            className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                          />
                          <div className="absolute top-3 right-3 bg-black/50 text-white px-2 py-1 rounded-full text-xs backdrop-blur-sm">
                            {card.views} views
                          </div>
                        </div>
                      )}
                      <div className="p-5">
                        <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-2 line-clamp-1">
                          {card.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">
                          {card.content}
                        </p>
                        
                        <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400 mb-4">
                          <span className="flex items-center gap-1">
                            📅 {new Date(card.createdAt).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1">
                            👁️ {card.views || 0}
                          </span>
                        </div>

                        <div className="flex gap-2 flex-wrap">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={(e) => { e.stopPropagation(); setSelectedCard(card); }}
                            className="flex-1 bg-gradient-to-r from-teal-500 to-teal-600 text-white py-2 px-3 rounded-lg text-sm font-medium transition-all duration-300 shadow-md hover:shadow-lg"
                          >
                            View & Share
                          </motion.button>
                          
                          <motion.button
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => { e.stopPropagation(); setShowQRModal(card._id); }}
                            className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-2 rounded-lg text-sm transition-all duration-300 shadow-md hover:shadow-lg"
                            title="Download QR Code"
                          >
                            📱
                          </motion.button>
                          
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => { e.stopPropagation(); openEdit(card); }}
                            className="bg-gradient-to-r from-amber-500 to-amber-600 text-white p-2 rounded-lg text-sm transition-all duration-300 shadow-md hover:shadow-lg"
                          >
                            ✏️
                          </motion.button>
                          
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => { e.stopPropagation(); setDeleteModalCard(card); }}
                            className="bg-gradient-to-r from-red-500 to-red-600 text-white p-2 rounded-lg text-sm transition-all duration-300 shadow-md hover:shadow-lg"
                            title="Delete Card"
                          >
                            🗑️
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>

            {/* Edit Modal */}
            <AnimatePresence>
              {editingCard && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-50 flex items-center justify-center p-4"
                >
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.4 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black"
                    onClick={() => setEditingCard(null)}
                  />
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl p-6 z-10 max-h-[90vh] overflow-y-auto"
                  >
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Card</h3>
                      <motion.button
                        whileHover={{ scale: 1.1, rotate: 90 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setEditingCard(null)}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl"
                      >
                        ✕
                      </motion.button>
                    </div>

                    {editError && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl text-sm mb-6"
                      >
                        {editError}
                      </motion.div>
                    )}

                    <form onSubmit={handleEditSubmit} className="space-y-6">
                      {/* Title */}
                      <div>
                        <label className="block text-lg font-bold text-gray-900 dark:text-white mb-3">
                          <span className="flex items-center gap-2">
                            <span className="text-teal-600">📝</span>
                            Card Title *
                          </span>
                        </label>
                        <textarea
                          value={editingCard.title || ''}
                          onChange={(e) => setEditingCard({...editingCard, title: e.target.value})}
                          rows={2}
                          className="w-full px-4 py-3 bg-white dark:bg-gray-700 border-2 border-teal-200 dark:border-teal-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-300 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                          placeholder="e.g., STAMAYA ESPERANZA (Press Enter for new line)"
                          required
                        />
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
                          value={editingCard.subtitle || ''}
                          onChange={(e) => setEditingCard({...editingCard, subtitle: e.target.value})}
                          rows={2}
                          className="w-full px-4 py-3 bg-white dark:bg-gray-700 border-2 border-amber-200 dark:border-amber-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-300 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                          placeholder="e.g., SIGNATURE BLEND (Press Enter for new line)"
                        />
                      </div>

                      {/* Title & Subtitle Layout Controls */}
                      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 space-y-4">
                        <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                          <span>⚙️</span> Title & Subtitle Options
                        </h4>
                        
                        {/* Layout - Same line or below */}
                        <div>
                          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                            Subtitle Position
                          </label>
                          <select
                            value={editingCard.titleLayout || 'inline'}
                            onChange={(e) => setEditingCard({...editingCard, titleLayout: e.target.value})}
                            className="w-full px-4 py-2 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg text-gray-900 dark:text-white"
                          >
                            <option value="inline">Same Line (Title + Subtitle)</option>
                            <option value="stacked">Below Title (Stacked)</option>
                          </select>
                        </div>

                        {/* Title Size */}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                              Title Size
                            </label>
                            <select
                              value={editingCard.titleLines || '3'}
                              onChange={(e) => setEditingCard({...editingCard, titleLines: e.target.value})}
                              className="w-full px-4 py-2 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg text-gray-900 dark:text-white"
                            >
                              <option value="1">Large</option>
                              <option value="2">Medium</option>
                              <option value="3">Small</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                              Subtitle Size
                            </label>
                            <select
                              value={editingCard.subtitleSize || 'xl'}
                              onChange={(e) => setEditingCard({...editingCard, subtitleSize: e.target.value})}
                              className="w-full px-4 py-2 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg text-gray-900 dark:text-white"
                            >
                              <option value="xl">Large</option>
                              <option value="lg">Medium</option>
                              <option value="base">Small</option>
                            </select>
                          </div>
                        </div>

                        {/* Bold Options */}
                        <div className="flex gap-6">
                          <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={editingCard.titleBold !== false}
                              onChange={(e) => setEditingCard({...editingCard, titleBold: e.target.checked})}
                              className="w-4 h-4 text-teal-600 focus:ring-teal-500 rounded"
                            />
                            Title Bold
                          </label>
                          <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={editingCard.subtitleBold !== false}
                              onChange={(e) => setEditingCard({...editingCard, subtitleBold: e.target.checked})}
                              className="w-4 h-4 text-amber-600 focus:ring-amber-500 rounded"
                            />
                            Subtitle Bold
                          </label>
                        </div>

                        {/* Font Options */}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                              Title Font
                            </label>
                            <select
                              value={editingCard.titleFont || 'Inter'}
                              onChange={(e) => setEditingCard({...editingCard, titleFont: e.target.value})}
                              className="w-full px-4 py-2 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg text-gray-900 dark:text-white"
                            >
                              <option value="Inter">Inter</option>
                              <option value="Playfair Display">Playfair Display</option>
                              <option value="Roboto">Roboto</option>
                              <option value="Montserrat">Montserrat</option>
                              <option value="Lato">Lato</option>
                              <option value="Open Sans">Open Sans</option>
                              <option value="Oswald">Oswald</option>
                              <option value="Raleway">Raleway</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                              Subtitle Font
                            </label>
                            <select
                              value={editingCard.subtitleFont || 'Inter'}
                              onChange={(e) => setEditingCard({...editingCard, subtitleFont: e.target.value})}
                              className="w-full px-4 py-2 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg text-gray-900 dark:text-white"
                            >
                              <option value="Inter">Inter</option>
                              <option value="Playfair Display">Playfair Display</option>
                              <option value="Roboto">Roboto</option>
                              <option value="Montserrat">Montserrat</option>
                              <option value="Lato">Lato</option>
                              <option value="Open Sans">Open Sans</option>
                              <option value="Oswald">Oswald</option>
                              <option value="Raleway">Raleway</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* Content */}
                      <div>
                        <label className="block text-lg font-bold text-gray-900 dark:text-white mb-3">
                          <span className="flex items-center gap-2">
                            <span className="text-green-600">📋</span>
                            Card Content *
                          </span>
                        </label>
                        <textarea
                          value={editingCard.content || ''}
                          onChange={(e) => setEditingCard({...editingCard, content: e.target.value})}
                          rows={4}
                          className="w-full px-4 py-3 bg-white dark:bg-gray-700 border-2 border-green-200 dark:border-green-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                          placeholder="Enter your card content here..."
                          required
                        />
                      </div>

                      {/* Colors */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2">
                            Background Color
                          </label>
                          <input
                            type="color"
                            value={editingCard.backgroundColor || '#ffffff'}
                            onChange={(e) => setEditingCard({...editingCard, backgroundColor: e.target.value})}
                            className="w-full h-10 rounded-lg cursor-pointer border-2 border-gray-300 dark:border-gray-600"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2">
                            Text Color
                          </label>
                          <input
                            type="color"
                            value={editingCard.textColor || '#1a202c'}
                            onChange={(e) => setEditingCard({...editingCard, textColor: e.target.value})}
                            className="w-full h-10 rounded-lg cursor-pointer border-2 border-gray-300 dark:border-gray-600"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2">
                            Accent Color
                          </label>
                          <input
                            type="color"
                            value={editingCard.buttonColor || '#1b5e4f'}
                            onChange={(e) => setEditingCard({...editingCard, buttonColor: e.target.value})}
                            className="w-full h-10 rounded-lg cursor-pointer border-2 border-gray-300 dark:border-gray-600"
                          />
                        </div>
                      </div>

                      {/* Image Preview */}
                      {imagePreview && (
                        <div>
                          <label className="block text-lg font-bold text-gray-900 dark:text-white mb-3">
                            Current Image
                          </label>
                          <img
                            src={imagePreview}
                            alt="Current card image"
                            className="max-h-48 rounded-xl shadow-lg border-2 border-teal-200 dark:border-teal-600"
                          />
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex gap-4 pt-6">
                        <motion.button
                          type="button"
                          onClick={() => setEditingCard(null)}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="flex-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300"
                        >
                          Cancel
                        </motion.button>
                        <motion.button
                          type="submit"
                          disabled={editLoading}
                          whileHover={{ scale: editLoading ? 1 : 1.02 }}
                          whileTap={{ scale: editLoading ? 1 : 0.98 }}
                          className="flex-1 bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          {editLoading ? (
                            <>
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                              />
                              Updating...
                            </>
                          ) : (
                            <>
                              <span>💾</span>
                              Update Card
                            </>
                          )}
                        </motion.button>
                      </div>
                    </form>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Create Card Modal */}
            <AnimatePresence>
              {showCreateModal && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-50 flex items-center justify-center p-4"
                >
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.6 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-gradient-to-br from-teal-900 via-black to-blue-900"
                    onClick={() => setShowCreateModal(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8, y: 50 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8, y: 50 }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    className="relative bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden"
                  >
                    {/* Decorative Header */}
                    <div className="relative h-48 bg-gradient-to-br from-teal-500 via-teal-600 to-blue-600 overflow-hidden">
                      {/* Animated Background Shapes */}
                      <motion.div
                        animate={{ 
                          rotate: [0, 360],
                          scale: [1, 1.2, 1]
                        }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full"
                      />
                      <motion.div
                        animate={{ 
                          rotate: [360, 0],
                          scale: [1, 1.3, 1]
                        }}
                        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                        className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/10 rounded-full"
                      />
                      <motion.div
                        animate={{ y: [0, -10, 0] }}
                        transition={{ duration: 3, repeat: Infinity }}
                        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center"
                      >
                        <div className="text-7xl mb-2">✨</div>
                        <h2 className="text-white text-2xl font-bold drop-shadow-lg">Create Magic</h2>
                      </motion.div>
                      
                      {/* Floating Card Icons */}
                      <motion.div
                        animate={{ y: [0, -15, 0], x: [0, 5, 0] }}
                        transition={{ duration: 4, repeat: Infinity, delay: 0.5 }}
                        className="absolute top-8 left-8 text-4xl opacity-60"
                      >
                        🎴
                      </motion.div>
                      <motion.div
                        animate={{ y: [0, -10, 0], x: [0, -5, 0] }}
                        transition={{ duration: 3.5, repeat: Infinity, delay: 1 }}
                        className="absolute top-12 right-12 text-3xl opacity-60"
                      >
                        💫
                      </motion.div>
                      <motion.div
                        animate={{ y: [0, -12, 0] }}
                        transition={{ duration: 3, repeat: Infinity, delay: 0.2 }}
                        className="absolute bottom-8 right-8 text-3xl opacity-60"
                      >
                        🎨
                      </motion.div>
                    </div>

                    {/* Content */}
                    <div className="p-8">
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 text-center">
                        Ready to Create Something Amazing?
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 text-center mb-6 leading-relaxed">
                        Design your own stunning digital card with custom colors, fonts, images, and more. Your creativity, your style!
                      </p>

                      {/* Features List */}
                      <div className="grid grid-cols-2 gap-3 mb-8">
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <span className="w-8 h-8 bg-teal-100 dark:bg-teal-900/50 rounded-lg flex items-center justify-center text-teal-600 dark:text-teal-400">🖼️</span>
                          <span>Custom Images</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <span className="w-8 h-8 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center text-blue-600 dark:text-blue-400">🎨</span>
                          <span>Beautiful Colors</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <span className="w-8 h-8 bg-purple-100 dark:bg-purple-900/50 rounded-lg flex items-center justify-center text-purple-600 dark:text-purple-400">✍️</span>
                          <span>Custom Fonts</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <span className="w-8 h-8 bg-amber-100 dark:bg-amber-900/50 rounded-lg flex items-center justify-center text-amber-600 dark:text-amber-400">📱</span>
                          <span>QR Code Sharing</span>
                        </div>
                      </div>

                      {/* Buttons */}
                      <div className="flex gap-4">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setShowCreateModal(false)}
                          className="flex-1 py-3 px-6 rounded-xl border-2 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300"
                        >
                          Maybe Later
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(13, 148, 136, 0.3)" }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => window.location.href = '/create'}
                          className="flex-1 py-3 px-6 rounded-xl bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-bold shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
                        >
                          <span>🚀</span>
                          Let's Create!
                        </motion.button>
                      </div>
                    </div>

                    {/* Close Button */}
                    <button
                      onClick={() => setShowCreateModal(false)}
                      className="absolute top-4 right-4 w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-all duration-300"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
              {deleteModalCard && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-50 flex items-center justify-center p-4"
                >
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.4 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black"
                    onClick={() => setDeleteModalCard(null)}
                  />
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-6 z-10"
                  >
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Delete Card</h3>
                      <motion.button
                        whileHover={{ scale: 1.1, rotate: 90 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setDeleteModalCard(null)}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl"
                      >
                        ✕
                      </motion.button>
                    </div>

                    <div className="text-center mb-8">
                      <motion.div
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4"
                      >
                        <span className="text-3xl text-red-600 dark:text-red-400">⚠️</span>
                      </motion.div>
                      <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                        Are you sure?
                      </h4>
                      <p className="text-gray-600 dark:text-gray-400 text-lg">
                        You are about to delete the card <strong className="text-red-600 dark:text-red-400">"{deleteModalCard.title}"</strong>. This action cannot be undone.
                      </p>
                    </div>

                    <div className="flex gap-4">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setDeleteModalCard(null)}
                        className="flex-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300"
                      >
                        Cancel
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleDeleteCard(deleteModalCard._id)}
                        className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
                      >
                        <span>🗑️</span>
                        Delete Card
                      </motion.button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Preview Panel */}
            <div className="lg:col-span-1">
              <div className="sticky top-8">
                <AnimatePresence mode="wait">
                  {selectedCard ? (
                    <motion.div
                      key="preview"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <PreviewCard 
                        card={selectedCard} 
                        showQR={true}
                      />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="placeholder"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-lg p-8 text-center border border-teal-200/50 dark:border-teal-700/50"
                    >
                      <motion.div
                        animate={{ y: [0, -10, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="text-6xl mb-4"
                      >
                        👆
                      </motion.div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                        Select a Card
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 text-lg">
                        Click on any card to preview and access sharing options
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        )}

        {/* QR Code Modal */}
        <AnimatePresence>
          {showQRModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black"
                onClick={() => setShowQRModal(null)}
              />
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 max-w-md w-full"
              >
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    Download QR Code
                  </h3>
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowQRModal(null)}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl"
                  >
                    ✕
                  </motion.button>
                </div>

                <div ref={qrRef} className="flex justify-center bg-white p-6 rounded-xl mb-6 border border-teal-200 dark:border-teal-700">
                  <QRCodeCanvas
                    value={`${window.location.origin}/card/${showQRModal && cards.find(c => c._id === showQRModal)?.shortCode}`}
                    size={200}
                    level="H"
                    includeMargin
                    bgColor={isDark ? "#1f2937" : "#ffffff"}
                    fgColor="#000000"
                  />
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => downloadQRCode(cards.find(c => c._id === showQRModal))}
                  className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 mb-3 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download QR Code
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowQRModal(null)}
                  className="w-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-semibold py-2 px-4 rounded-xl transition-all duration-300"
                >
                  Close
                </motion.button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Dashboard;