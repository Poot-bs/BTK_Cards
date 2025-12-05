import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useToastContext } from '../components/UI/ToastProvider';

const Profile = () => {
  const { user, updateProfile, changePassword } = useAuth();
  const { addToast } = useToastContext();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    avatar: ''
  });
  const [avatarPreview, setAvatarPreview] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        email: user.email || '',
        avatar: user.avatar || ''
      });
      setAvatarPreview(user.avatar || '');
      setAvatarFile(null);
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        addToast('Image size must be less than 2MB', 'error');
        return;
      }

      const previewUrl = URL.createObjectURL(file);
      setAvatarPreview(previewUrl);
      setAvatarFile(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = new FormData();
      payload.append('username', formData.username);
      payload.append('email', formData.email);
      if (avatarFile) {
        payload.append('avatar', avatarFile);
      }

      const result = await updateProfile(payload);
      if (result.success) {
        addToast('Profile updated successfully!', 'success');
      } else {
        addToast(result.message, 'error');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      addToast('Error updating profile. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      addToast('New passwords do not match', 'error');
      return;
    }
    setPasswordLoading(true);

    try {
      const result = await changePassword(passwordData.currentPassword, passwordData.newPassword);
      if (result.success) {
        addToast('Password changed successfully!', 'success');
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        addToast(result.message, 'error');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      addToast('Error changing password. Please try again.', 'error');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handlePasswordInputChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const stats = [
    { label: 'Cards Created', value: user?.cardCount || 0, icon: '🎴' },
    { label: 'Total Views', value: user?.totalViews || 0, icon: '👁️' },
    { label: 'Member Since', value: new Date(user?.createdAt).toLocaleDateString() || 'N/A', icon: '📅' }
  ];

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 via-blue-50 to-cyan-50">
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Please log in</h2>
          <p className="text-gray-600">You need to be logged in to view your profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-blue-50 to-cyan-50 dark:from-gray-900 dark:via-teal-950 dark:to-blue-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-black bg-gradient-to-r from-teal-700 to-teal-900 dark:from-teal-400 dark:to-teal-600 bg-clip-text text-transparent mb-4">
            Your Profile
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Manage your account settings and view your statistics
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Info & Stats */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-teal-200/50 dark:border-teal-700/50 p-6"
            >
              {/* Avatar */}
              <div className="text-center mb-6">
                <div className="relative inline-block">
                  <img
                    src={avatarPreview || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username)}&background=1b5e4f&color=fff`}
                    alt="Profile"
                    className="w-32 h-32 rounded-full object-cover border-4 border-teal-200 dark:border-teal-600 mx-auto"
                  />
                  <label
                    htmlFor="avatar-upload"
                    className="absolute bottom-2 right-2 bg-teal-600 text-white p-2 rounded-full cursor-pointer hover:bg-teal-700 transition-colors"
                  >
                    <span className="text-sm">📷</span>
                    <input
                      type="file"
                      id="avatar-upload"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarChange}
                    />
                  </label>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-4">
                  {user.username}
                </h2>
                <p className="text-gray-600 dark:text-gray-400">{user.email}</p>
              </div>

              {/* Stats */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <span>📊</span>
                  Your Statistics
                </h3>
                {stats.map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-3 bg-teal-50 dark:bg-teal-900/30 rounded-lg border border-teal-200 dark:border-teal-700"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{stat.icon}</span>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {stat.label}
                      </span>
                    </div>
                    <span className="font-bold text-teal-700 dark:text-teal-300">
                      {stat.value}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Edit Form */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-teal-200/50 dark:border-teal-700/50 p-6"
            >
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <span>⚙️</span>
                Edit Profile
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Username */}
                <div>
                  <label className="block text-lg font-bold text-gray-900 dark:text-white mb-3">
                    <span className="flex items-center gap-2">
                      <span className="text-teal-600">👤</span>
                      Username
                    </span>
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white dark:bg-gray-700 border-2 border-teal-200 dark:border-teal-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-300 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    placeholder="Enter your username"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-lg font-bold text-gray-900 dark:text-white mb-3">
                    <span className="flex items-center gap-2">
                      <span className="text-amber-600">📧</span>
                      Email Address
                    </span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white dark:bg-gray-700 border-2 border-amber-200 dark:border-amber-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-300 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    placeholder="Enter your email"
                  />
                </div>

                {/* Password Section */}
                <div className="pt-6 border-t border-gray-200 dark:border-gray-600">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <span className="text-purple-600">🔒</span>
                    Change Password
                  </h3>
                  <div className="space-y-4">
                    <input
                      type="password"
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordInputChange}
                      placeholder="Current Password"
                      className="w-full px-4 py-3 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    />
                    <input
                      type="password"
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordInputChange}
                      placeholder="New Password"
                      className="w-full px-4 py-3 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    />
                    <input
                      type="password"
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordInputChange}
                      placeholder="Confirm New Password"
                      className="w-full px-4 py-3 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    />
                    <div className="mt-3">
                      <button
                        type="button"
                        onClick={handlePasswordChange}
                        disabled={passwordLoading}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-xl font-semibold disabled:opacity-50"
                      >
                        {passwordLoading ? (
                          <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="4" fill="none" strokeDasharray="31.4" strokeLinecap="round" />
                          </svg>
                        ) : null}
                        Change Password
                      </button>
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    Leave password fields empty to keep current password
                  </p>
                </div>

                {/* Submit Button */}
                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: loading ? 1 : 1.02 }}
                  whileTap={{ scale: loading ? 1 : 0.98 }}
                  className="w-full bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white py-4 px-6 rounded-xl font-bold text-lg shadow-2xl hover:shadow-3xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                >
                  {loading ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-6 h-6 border-2 border-white border-t-transparent rounded-full"
                      />
                      Updating Profile...
                    </>
                  ) : (
                    <>
                      <span>💾</span>
                      Save Changes
                      <span>💾</span>
                    </>
                  )}
                </motion.button>
              </form>

              {/* Account Actions */}
              <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-600">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <span className="text-red-600">⚠️</span>
                  Account Actions
                </h3>
                <div className="space-y-3">
                  <button className="w-full text-left p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold">Delete Account</div>
                        <div className="text-sm opacity-75">Permanently delete your account and all data</div>
                      </div>
                      <span>🗑️</span>
                    </div>
                  </button>
                  
                  <button className="w-full text-left p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold">Export Data</div>
                        <div className="text-sm opacity-75">Download all your cards and data</div>
                      </div>
                      <span>📥</span>
                    </div>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;