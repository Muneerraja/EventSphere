import { motion } from 'framer-motion';
import { Users, Target, Lightbulb, Shield, TrendingUp, Globe } from 'lucide-react';
import { useSettings } from '../../contexts/SettingsContext';

const About = () => {
  const { settings } = useSettings();

  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const stagger = {
    animate: {
      transition: { staggerChildren: 0.2 }
    }
  };

  const values = [
    {
      icon: Users,
      title: 'User-Centric Approach',
      description: 'Every feature is designed with our users in mind - organizers, exhibitors, and attendees.'
    },
    {
      icon: Target,
      title: 'Innovation Focus',
      description: 'We continuously evolve our platform to incorporate the latest technology and best practices.'
    },
    {
      icon: Lightbulb,
      title: 'Knowledge Sharing',
      description: 'Fostering communities and enabling learning through interactive expo experiences.'
    },
    {
      icon: Shield,
      title: 'Trust & Security',
      description: 'Industry-standard security practices ensuring safe and reliable event management.'
    },
    {
      icon: TrendingUp,
      title: 'Growth Mindset',
      description: 'Supporting the expansion and success of events through comprehensive analytics.'
    },
    {
      icon: Globe,
      title: 'Global Reach',
      description: 'Connecting event professionals worldwide through our innovative platform.'
    }
  ];

  const stats = [
    { number: '10K+', label: 'Events Hosted' },
    { number: '50K+', label: 'Happy Users' },
    { number: '100+', label: 'Countries Served' },
    { number: '99.9%', label: 'Uptime Guarantee' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-green-50 py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              About{' '}
              <span className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                {settings.general?.siteName || 'EventSphere'}
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              {settings.general?.siteDescription || 'Professional event management platform for organizers, exhibitors, and attendees.'}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center"
          >
            <motion.div variants={fadeInUp}>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Our Mission
              </h2>
              <div className="space-y-6 text-gray-600 text-lg leading-relaxed">
                <p>
                  EventSphere was created to address the challenges faced by traditional expo management systems.
                  We recognized that the industry needed a modern, comprehensive solution that could handle the
                  complexities of large-scale event organization while maintaining simplicity and accessibility.
                </p>
                <p>
                  Our mission is to empower event organizers, exhibitors, and attendees with cutting-edge technology
                  that fosters successful connections, drives engagement, and delivers measurable results.
                </p>
                <p>
                  Through continuous innovation and user-centric design, we aim to set new standards for event
                  management excellence in the digital era.
                </p>
              </div>
            </motion.div>
            <motion.div
              variants={fadeInUp}
              className="bg-gradient-to-br from-blue-100 to-green-100 p-8 rounded-xl"
            >
              <h3 className="text-2xl font-semibold text-gray-900 mb-6">Key Objectives</h3>
              <ul className="space-y-4">
                <li className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Provide seamless integration between event stakeholders</span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Enable real-time communication and collaboration</span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Deliver comprehensive analytics for informed decision-making</span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Ensure security and privacy compliance at all levels</span>
                </li>
              </ul>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              By the Numbers
            </h2>
            <p className="text-xl text-gray-300">
              Our impact on the event industry
            </p>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="initial"
            animate="animate"
            className="grid grid-cols-1 md:grid-cols-4 gap-8"
          >
            {stats.map((stat) => (
              <motion.div
                key={stat.label}
                variants={fadeInUp}
                className="text-center"
              >
                <div className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-300 text-lg">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Core Values
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              The principles that guide everything we do and shape our platform's development
            </p>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="initial"
            animate="animate"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {values.map((value) => {
              const IconComponent = value.icon;
              return (
                <motion.div
                  key={value.title}
                  variants={fadeInUp}
                  whileHover={{ y: -5 }}
                  className="bg-gray-50 p-8 rounded-xl text-center hover:shadow-lg transition-shadow"
                >
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6 mx-auto">
                    <IconComponent className="text-blue-600" size={32} />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    {value.title}
                  </h3>
                  <p className="text-gray-600">
                    {value.description}
                  </p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            className="text-center"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Our Journey
            </h2>
            <p className="text-xl text-gray-600 mb-16 max-w-4xl mx-auto leading-relaxed">
              Founded by event industry veterans who understood the need for better technology in event management,
              EventSphere began as a vision to transform the way events are organized and experienced. Today, we're
              proud to be the trusted platform for thousands of event professionals worldwide.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <motion.div
                variants={fadeInUp}
                className="bg-white p-8 rounded-xl shadow-lg"
              >
                <div className="text-3xl font-bold text-blue-600 mb-2">2019</div>
                <div className="text-gray-600">Founded with a vision</div>
              </motion.div>
              <motion.div
                variants={fadeInUp}
                className="bg-white p-8 rounded-xl shadow-lg"
              >
                <div className="text-3xl font-bold text-green-600 mb-2">2022</div>
                <div className="text-gray-600">Launched platform MVP</div>
              </motion.div>
              <motion.div
                variants={fadeInUp}
                className="bg-white p-8 rounded-xl shadow-lg"
              >
                <div className="text-3xl font-bold text-blue-600 mb-2">2025</div>
                <div className="text-gray-600">Leading event technology</div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default About;
