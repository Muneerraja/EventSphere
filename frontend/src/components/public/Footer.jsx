import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Calendar,
  Home,
  Info,
  Mail,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Search,
} from "lucide-react";

const Footer = () => {
  const footerLinks = [
    { path: "/", label: "Home", icon: Home },
    { path: "/about", label: "About", icon: Info },
    { path: "/expos", label: "Expos", icon: Calendar },
    { path: "/exhibitors", label: "Exhibitors", icon: Search },
    { path: "/contact", label: "Contact", icon: Mail },
  ];

  const socialLinks = [
    { icon: Facebook, href: "#", label: "Facebook" },
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Instagram, href: "#", label: "Instagram" },
    { icon: Linkedin, href: "#", label: "LinkedIn" },
  ];

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent mb-4">
              EventSphere
            </h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              Revolutionizing expo management with seamless organization,
              powerful analytics, and engaging experiences for organizers,
              exhibitors, and attendees.
            </p>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-center"
          >
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {footerLinks.map((link) => {
                const IconComponent = link.icon;
                return (
                  <li key={link.path} className="justify-center">
                    <Link
                      to={link.path}
                      className="flex items-center justify-center space-x-2 text-gray-300 hover:text-blue-400 transition-colors text-sm"
                    >
                      <IconComponent size={16} />
                      <span>{link.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </motion.div>

          {/* Contact & Social */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-center"
          >
            <h4 className="text-lg font-semibold mb-4">Connect With Us</h4>
            <div className="space-y-4">
              <div className="text-gray-300 text-sm">
                <p>Email: info@eventsphere.com</p>
                <p>Phone: +1 (555) 123-4567</p>
              </div>
              <div className="flex justify-center space-x-4">
                {socialLinks.map((social) => {
                  const IconComponent = social.icon;
                  return (
                    <motion.a
                      key={social.label}
                      href={social.href}
                      className="text-gray-400 hover:text-blue-400 transition-colors"
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                      aria-label={social.label}
                    >
                      <IconComponent size={20} />
                    </motion.a>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400 text-sm"
        >
          <p>
            &copy; {currentYear} EventSphere. All rights reserved. | Crafting
            Exceptional Event Experiences
          </p>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;
