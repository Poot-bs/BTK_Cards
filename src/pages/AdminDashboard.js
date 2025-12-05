import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { adminAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [cards, setCards] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [editingCard, setEditingCard] = useState(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, cardsRes, usersRes] = await Promise.all([
        adminAPI.getStats(),
        adminAPI.getAllCards(),
        adminAPI.getAllUsers()
      ]);

      setStats(statsRes.data.stats);
      setCards(cardsRes.data.cards);
      setUsers(usersRes.data.users);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const openEdit = (card) => {
    setEditingCard({ ...card });
    setImagePreview(card.imageUrl || '');
    setEditError('');
  };

  const closeEdit = () => {
    setEditingCard(null);
    setImagePreview('');
    setEditError('');
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditingCard(prev => ({ ...prev, [name]: value }));
  };

  const handleEditImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
      setEditingCard(prev => ({ ...prev, _newImageFile: file }));
    }
  };

  const submitEdit = async (e) => {
    e.preventDefault();
    if (!editingCard) return;
    setEditLoading(true);
    setEditError('');
    try {
      const formData = new FormData();
      formData.append('title', editingCard.title || '');
      formData.append('content', editingCard.content || '');
      formData.append('backgroundColor', editingCard.backgroundColor || '#ffffff');
      formData.append('textColor', editingCard.textColor || '#000000');
      formData.append('buttonColor', editingCard.buttonColor || '#3b82f6');
      if (editingCard._newImageFile) {
        formData.append('image', editingCard._newImageFile);
      }

      const res = await adminAPI.updateCard(editingCard._id, formData);
      const updatedCard = res.data.card || res.data;

      // Update local cards list
      setCards(prev => prev.map(c => (c._id === updatedCard._id ? updatedCard : c)));
      closeEdit();
    } catch (error) {
      console.error('Error updating card (admin):', error);
      setEditError(error.response?.data?.message || error.message || 'Error updating card');
    } finally {
      setEditLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Manage platform content and users
          </p>
        </motion.div>

        {/* Stats Overview */}
        {activeTab === 'overview' && stats && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
          >
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <span className="text-2xl">📊</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Total Cards</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.totalCards}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-lg">
                  <span className="text-2xl">👥</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.totalUsers}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <span className="text-2xl">👀</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Total Views</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.totalViews}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-8">
          <div className="border-b">
            <nav className="flex -mb-px">
              {['overview', 'cards', 'users'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 px-6 text-sm font-medium border-b-2 ${
                    activeTab === tab
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'cards' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">All Cards</h3>
                {cards.map((card) => (
                  <div
                    key={card._id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      {card.imageUrl && (
                        <img
                          src={card.imageUrl}
                          alt={card.title}
                          className="w-12 h-12 object-cover rounded"
                        />
                      )}
                      <div>
                        <h4 className="font-medium">{card.title}</h4>
                        <p className="text-sm text-gray-600">
                          By {card.createdBy?.username} • {card.views} views
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-sm text-gray-500">
                        {new Date(card.createdAt).toLocaleDateString()}
                      </div>
                      <button
                        onClick={() => openEdit(card)}
                        className="text-sm px-3 py-1 bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200"
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'users' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">All Users</h3>
                {users.map((user) => (
                  <div
                    key={user._id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div>
                      <h4 className="font-medium">{user.username}</h4>
                      <p className="text-sm text-gray-600">{user.email}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          user.role === 'admin'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {user.role}
                      </span>
                      <span className="text-sm text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        {/* Edit Modal */}
        {editingCard && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black opacity-40" onClick={closeEdit}></div>
            <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl p-6 z-10">
              <h3 className="text-lg font-semibold mb-4">Edit Card</h3>
              {editError && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm mb-4">
                  {editError}
                </div>
              )}
              <form onSubmit={submitEdit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Title</label>
                  <input name="title" value={editingCard.title || ''} onChange={handleEditChange} className="w-full px-3 py-2 border rounded" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Content</label>
                  <textarea name="content" value={editingCard.content || ''} onChange={handleEditChange} rows={4} className="w-full px-3 py-2 border rounded" />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Background</label>
                    <input name="backgroundColor" type="color" value={editingCard.backgroundColor || '#ffffff'} onChange={handleEditChange} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Text</label>
                    <input name="textColor" type="color" value={editingCard.textColor || '#000000'} onChange={handleEditChange} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Button</label>
                    <input name="buttonColor" type="color" value={editingCard.buttonColor || '#3b82f6'} onChange={handleEditChange} />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Image</label>
                  <input type="file" accept="image/*" onChange={handleEditImage} />
                  {imagePreview && (
                    <img src={imagePreview} alt="preview" className="mt-2 w-32 h-32 object-cover rounded" />
                  )}
                </div>

                <div className="flex justify-end gap-3">
                  <button type="button" onClick={closeEdit} className="px-4 py-2 bg-gray-100 rounded">Cancel</button>
                  <button type="submit" disabled={editLoading} className="px-4 py-2 bg-blue-600 text-white rounded">
                    {editLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;