import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { Button, Card } from '../components/UI';

const Home = () => {
  const { user } = useAuth();
  const [currentFeature, setCurrentFeature] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [featuresInView, setFeaturesInView] = useState(false);

  useEffect(() => {
    setIsVisible(true);

    // Auto-rotate features only if features section is not in view and not at the last feature
    const interval = setInterval(() => {
      if (!featuresInView) {
        setCurrentFeature((prev) => {
          // Stop at the last feature (index 5) instead of cycling
          return prev < 5 ? prev + 1 : prev;
        });
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [featuresInView]);

  // Counting animation component
  const CountingNumber = ({ target, duration = 2 }) => {
    const [count, setCount] = useState(0);
    const [isVisible, setIsVisible] = useState(false);

    const match = target.match(/^(\d+)(.*)$/);
    const numericTarget = match ? parseInt(match[1]) : 0;
    const suffix = match ? match[2] : '';

    useEffect(() => {
      if (isVisible) {
        const timer = setTimeout(() => {
          const increment = numericTarget / (duration * 60); // 60 FPS
          const interval = setInterval(() => {
            setCount(prev => {
              const next = prev + increment;
              if (next >= numericTarget) {
                clearInterval(interval);
                return numericTarget;
              }
              return next;
            });
          }, 1000 / 60);
          return () => clearInterval(interval);
        }, 200); // Small delay for better UX

        return () => clearTimeout(timer);
      }
    }, [isVisible, numericTarget, duration]);

    return (
      <motion.span
        initial={{ opacity: 0, scale: 0.5 }}
        whileInView={() => {
          setIsVisible(true);
          return {
            opacity: 1,
            scale: 1,
            transition: { duration: 0.5, ease: "easeOut" }
          };
        }}
        viewport={{ once: true, margin: "-50px" }}
      >
        {Math.floor(count)}{suffix}
      </motion.span>
    );
  };

  const features = [
    {
      icon: '✨',
      title: 'Easy to Use',
      desc: 'Create stunning cards in seconds with our intuitive drag-and-drop builder',
      color: 'from-teal-400 to-blue-500',
      bgColor: 'bg-gradient-to-br from-teal-50 to-blue-50'
    },
    {
      icon: '🎯',
      title: 'Smart QR Codes',
      desc: 'Dynamic QR codes with analytics to track your card performance',
      color: 'from-purple-400 to-pink-500',
      bgColor: 'bg-gradient-to-br from-purple-50 to-pink-50'
    },
    {
      icon: '🎨',
      title: 'Professional Design',
      desc: 'Premium templates designed specifically for specialty businesses',
      color: 'from-amber-400 to-orange-500',
      bgColor: 'bg-gradient-to-br from-amber-50 to-orange-50'
    },
    {
      icon: '📊',
      title: 'Real-time Analytics',
      desc: 'Track views, engagement, and customer interactions',
      color: 'from-green-400 to-teal-500',
      bgColor: 'bg-gradient-to-br from-green-50 to-teal-50'
    },
    {
      icon: '🚀',
      title: 'Instant Sharing',
      desc: 'Share your cards across all platforms with one click',
      color: 'from-red-400 to-rose-500',
      bgColor: 'bg-gradient-to-br from-red-50 to-rose-50'
    },
    {
      icon: '💫',
      title: 'Custom Branding',
      desc: 'Full customization with your colors, logos, and style',
      color: 'from-indigo-400 to-purple-500',
      bgColor: 'bg-gradient-to-br from-indigo-50 to-purple-50'
    }
  ];

  const stats = [
    { number: '10K+', label: 'Cards Created', icon: '🎴' },
    { number: '50K+', label: 'QR Scans', icon: '📱' },
    { number: '99%', label: 'Satisfaction', icon: '⭐' },
    { number: '24/7', label: 'Support', icon: '🛡️' }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        duration: 0.8
      }
    }
  };

  const itemVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: "easeOut"
      }
    }
  };

  const floatingVariants = {
    floating: {
      y: [-8, 8, -8],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const pulseVariants = {
    pulse: {
      scale: [1, 1.02, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const rotateVariants = {
    rotating: {
      rotate: [0, 5, -5, 0],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  return (
    <div className="bg-gradient-to-br from-teal-50 via-blue-50 to-cyan-50 dark:from-gray-900 dark:via-teal-950 dark:to-blue-900 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-teal-200/20 dark:bg-teal-600/10"
            style={{
              width: Math.random() * 100 + 50,
              height: Math.random() * 100 + 50,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              x: [0, Math.random() * 20 - 10, 0],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        ))}
      </div>

      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Main Logo/Badge with Image */}
            <motion.div
              variants={itemVariants}
            >
              <motion.div
                className="w-80 h-80 mx-auto flex items-center justify-center text-white relative overflow-hidden"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                {/* Replace with your actual logo image */}
                <img
                  src="/logo_btk.png"
                  alt="BTK Cards Logo"
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    // Fallback if image doesn't load
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                {/* Fallback text logo */}
                <div className="hidden text-6xl font-bold items-center justify-center bg-gradient-to-br from-teal-600 to-teal-700 rounded-3xl w-full h-full">
                  BTK
                </div>
              </motion.div>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-6 justify-center mb-20"
            >
              {user ? (
                <>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link to="/dashboard">
                      <Button size="xl" className="bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white px-12 py-6 text-lg font-bold rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300">
                        🚀 Go to Dashboard
                      </Button>
                    </Link>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link to="/create">
                      <Button variant="secondary" size="xl" className="border-2 border-teal-600 text-teal-600 dark:text-teal-400 dark:border-teal-400 hover:bg-teal-600 hover:text-white px-12 py-6 text-lg font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300">
                        ✨ Create New Card
                      </Button>
                    </Link>
                  </motion.div>
                </>
              ) : (
                <>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link to="/dashboard">
                      <Button size="xl" className="bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white px-12 py-6 text-lg font-bold rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300">
                        🎉 Get Started Free
                      </Button>
                    </Link>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link to="/login">
                      <Button variant="ghost" size="xl" className="border-2 border-teal-600 text-teal-600 dark:text-teal-400 hover:bg-teal-600 hover:text-white px-12 py-6 text-lg font-bold rounded-2xl transition-all duration-300">
                        🔐 Sign In
                      </Button>
                    </Link>
                  </motion.div>
                </>
              )}
            </motion.div>

            {/* Stats Section with Fixed Animations */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-24"
            >
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className="text-center p-6 rounded-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-teal-200/50 dark:border-teal-700/50 shadow-lg"
                  whileHover={{ 
                    scale: 1.05, 
                    y: -5,
                    transition: { type: "spring", stiffness: 400, damping: 10 }
                  }}
                >
                  <motion.div
                    className="text-5xl mb-4"
                    variants={floatingVariants}
                    animate="floating"
                  >
                    {stat.icon}
                  </motion.div>
                  <motion.div
                    className="text-4xl font-bold text-teal-700 dark:text-teal-300 mb-2"
                    initial={{ opacity: 0, scale: 0.5 }}
                    whileInView={{ 
                      opacity: 1, 
                      scale: 1,
                      transition: { 
                        delay: index * 0.2 + 0.5,
                        duration: 0.6,
                        ease: "easeOut"
                      }
                    }}
                    viewport={{ once: true }}
                  >
                    <CountingNumber
                      target={stat.number}
                      duration={2}
                    />
                  </motion.div>
                  <motion.div 
                    className="text-base text-gray-600 dark:text-gray-400 font-medium"
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ 
                      opacity: 1, 
                      y: 0,
                      transition: { 
                        delay: index * 0.2 + 0.8,
                        duration: 0.4 
                      }
                    }}
                    viewport={{ once: true }}
                  >
                    {stat.label}
                  </motion.div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="w-6 h-10 border-2 border-teal-600 dark:border-teal-400 rounded-full flex justify-center">
            <motion.div
              className="w-1 h-3 bg-teal-600 dark:bg-teal-400 rounded-full mt-2"
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
        </motion.div>
      </section>

      {/* Features Section with Adjusted Spacing */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={() => {
              setFeaturesInView(true);
              return { opacity: 1, y: 0 };
            }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl font-bold text-teal-900 dark:text-black mb-6">
              Why Choose <span className="text-amber-600 dark:text-amber-400">BTK Cards</span>?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-700 max-w-3xl mx-auto">
              Discover the powerful features that make BTK Cards the perfect solution for your digital presence
            </p>
          </motion.div>

          {/* Featured Feature Showcase */}
          <div className="mb-20">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentFeature}
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 1.1, y: -20 }}
                transition={{ duration: 0.5 }}
                className={`rounded-3xl p-8 ${features[currentFeature].bgColor} dark:bg-gray-800 shadow-2xl border border-teal-200 dark:border-teal-700`}
              >
                <div className="flex flex-col lg:flex-row items-center gap-8">
                  <motion.div
                    className="flex-1 text-center lg:text-left"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <motion.div
                      className="text-6xl mb-6"
                      variants={rotateVariants}
                      animate="rotating"
                    >
                      {features[currentFeature].icon}
                    </motion.div>
                    <h3 className="text-4xl font-bold text-gray-900 dark:text-black mb-4">
                      {features[currentFeature].title}
                    </h3>
                    <p className="text-xl text-gray-600 dark:text-gray-700 mb-6">
                      {features[currentFeature].desc}
                    </p>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Link to={user ? "/create" : "/register"}>
                        <Button size="lg" className={`bg-gradient-to-r ${features[currentFeature].color} text-white font-bold rounded-xl px-8 py-4`}>
                          Try It Now
                        </Button>
                      </Link>
                    </motion.div>
                  </motion.div>
                  <motion.div
                    className="flex-1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <div className="bg-white dark:bg-gray-700 rounded-2xl p-6 shadow-xl border border-teal-100 dark:border-teal-600">
                      <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                          <motion.div
                            key={i}
                            className="h-4 rounded-full bg-gradient-to-r from-teal-200 to-blue-200 dark:from-teal-600 dark:to-blue-600"
                            initial={{ width: 0 }}
                            animate={{ width: "100%" }}
                            transition={{ delay: i * 0.1 + 0.6 }}
                          />
                        ))}
                      </div>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* All Features Grid */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ 
                  scale: 1.05, 
                  y: -10,
                  transition: { type: "spring", stiffness: 300 }
                }}
                className={`rounded-2xl p-6 ${feature.bgColor} dark:bg-gray-800 shadow-lg hover:shadow-2xl border border-teal-100 dark:border-teal-700 cursor-pointer transition-all duration-300 backdrop-blur-sm`}
                onClick={() => setCurrentFeature(idx)}
              >
                <motion.div
                  className="text-4xl mb-4"
                  variants={rotateVariants}
                  animate="rotating"
                  whileHover={{ scale: 1.3 }}
                >
                  {feature.icon}
                </motion.div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-black mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-700">
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Final CTA Section with Adjusted Spacing */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 relative">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center relative"
        >
          {/* Background Glow */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-teal-600 to-teal-700 dark:from-teal-700 dark:to-teal-800 rounded-3xl blur-xl opacity-20"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 4, repeat: Infinity }}
          />
          
          <div className="relative bg-gradient-to-br from-teal-600 via-teal-700 to-teal-800 dark:from-teal-700 dark:via-teal-800 dark:to-teal-900 rounded-3xl p-12 shadow-2xl border border-teal-400/20">
            <motion.h2
              className="text-5xl font-bold text-white mb-6"
              variants={floatingVariants}
              animate="floating"
            >
              Ready to Create Magic with{' '}
              <span className="text-amber-300">BITIKA</span>?
            </motion.h2>
            
            <motion.p
              className="text-xl text-teal-100 mb-8"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Join thousands of creators building stunning digital experiences with BTK Cards
            </motion.p>

            {!user && (
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link to="/register">
                  <Button 
                    size="xl" 
                    className="bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-teal-900 font-bold px-12 py-6 text-lg rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300"
                  >
                    🚀 Start Creating Free
                  </Button>
                </Link>
              </motion.div>
            )}
            
            {/* Floating elements */}
            <motion.div
              className="absolute -top-4 -left-4 text-4xl"
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              ⭐
            </motion.div>
            <motion.div
              className="absolute -bottom-4 -right-4 text-4xl"
              animate={{ rotate: [360, 0] }}
              transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            >
              ✨
            </motion.div>
          </div>
        </motion.div>
      </section>
    </div>
  );
};

export default Home;