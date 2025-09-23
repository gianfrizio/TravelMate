'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Check, AlertCircle } from 'lucide-react';

const Newsletter = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (email: string): string => {
    if (!email) {
      return 'L\'email è obbligatoria';
    }
    
    if (email.length < 5) {
      return 'L\'email deve contenere almeno 5 caratteri';
    }
    
    if (!email.includes('@')) {
      return 'L\'email deve contenere il simbolo @';
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return 'Inserisci un\'email valida (esempio: nome@dominio.com)';
    }
    
    return '';
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    
    if (error && value) {
      const validationError = validateEmail(value);
      if (!validationError) {
        setError('');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validateEmail(email);
    if (validationError) {
      setError(validationError);
      return;
    }
    
    setError('');
    setIsLoading(true);
    
    // Simula una chiamata API
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsSubmitted(true);
      setEmail('');
    } catch (err) {
      setError('Si è verificato un errore. Riprova più tardi.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
          className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4"
        >
          <Check className="w-8 h-8 text-white" />
        </motion.div>
        <h3 className="text-lg font-semibold mb-2">Iscrizione completata!</h3>
        <p className="text-gray-400 mb-4">
          Ti abbiamo inviato un'email di conferma. Controlla la tua inbox.
        </p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsSubmitted(false)}
          className="text-primary-400 hover:text-primary-300 transition-colors"
        >
          Iscriviti di nuovo
        </motion.button>
      </motion.div>
    );
  }

  return (
    <div>
      <h3 className="text-lg font-semibold mb-2">Resta aggiornato</h3>
      <p className="text-gray-400 mb-4">
        Ricevi le ultime offerte e consigli di viaggio direttamente nella tua inbox.
      </p>
      
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="relative">
          <div className="flex space-x-2">
            <div className="flex-1">
              <input
                type="email"
                value={email}
                onChange={handleEmailChange}
                placeholder="La tua email..."
                className={`w-full px-4 py-2 bg-gray-800 border rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors ${
                  error 
                    ? 'border-red-500 focus:ring-red-500/20' 
                    : 'border-gray-700 focus:border-primary-500 focus:ring-primary-500/20'
                }`}
              />
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center space-x-2 mt-2 text-red-400 text-sm"
                >
                  <AlertCircle className="w-4 h-4" />
                  <span>{error}</span>
                </motion.div>
              )}
            </div>
            
            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: isLoading ? 1 : 1.05 }}
              whileTap={{ scale: isLoading ? 1 : 0.95 }}
              className={`px-6 py-2 rounded-md transition-all duration-200 flex items-center space-x-2 ${
                isLoading
                  ? 'bg-gray-600 cursor-not-allowed'
                  : 'bg-primary-600 hover:bg-primary-700'
              } text-white`}
            >
              {isLoading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                />
              ) : (
                <Mail className="w-4 h-4" />
              )}
              <span>{isLoading ? 'Invio...' : 'Iscriviti'}</span>
            </motion.button>
          </div>
        </div>
      </form>
      
      <p className="text-xs text-gray-500 mt-2">
        Nessun spam, solo contenuti di qualità. Puoi disiscriverti in qualsiasi momento.
      </p>
    </div>
  );
};

export default Newsletter;