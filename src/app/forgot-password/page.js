'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiMail, FiArrowLeft } from 'react-icons/fi';
import styles from './page.module.css';
import Link from 'next/link';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  const handleReset = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch(`${baseUrl}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (data.success) {
        setMessage('Un email de réinitialisation a été envoyé.');
      } else {
        setError(data.error || "Aucun compte trouvé avec cet email.");
      }
    } catch (err) {
      console.error(err);
      setError('Erreur serveur. Réessayez plus tard.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      <motion.form 
        onSubmit={handleReset} 
        className={styles.formBox}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className={styles.header}>
          <Link href="/login" className={styles.backButton}>
            <FiArrowLeft size={20} />
          </Link>
          <h2 className={styles.title}>Mot de passe oublié</h2>
          <p className={styles.subtitle}>Entrez votre email pour recevoir un lien de réinitialisation</p>
        </div>

        <div className={styles.inputContainer}>
          <FiMail className={styles.inputIcon} />
          <input
            type="email"
            placeholder="Votre adresse email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={styles.input}
            required
          />
        </div>

        {error && (
          <motion.p 
            className={styles.error}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
          >
            {error}
          </motion.p>
        )}

        {message && (
          <motion.p 
            className={styles.success}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
          >
            {message}
          </motion.p>
        )}

        <motion.button 
          type="submit" 
          className={styles.button}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          disabled={isLoading}
        >
          {isLoading ? (
            <span className={styles.spinner}></span>
          ) : (
            'Envoyer le lien'
          )}
        </motion.button>

        <div className={styles.links}>
          <Link href="/login" className={styles.link}>
            <FiArrowLeft className={styles.linkIcon} />
            Retour à la connexion
          </Link>
        </div>
      </motion.form>
    </div>
  );
}