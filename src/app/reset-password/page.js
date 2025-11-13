'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FiLock, FiArrowLeft, FiCheckCircle } from 'react-icons/fi';
import styles from './page.module.css';
import Link from 'next/link';


export const dynamic = 'force-dynamic';
export const runtime = 'edge';
export default function ResetPassword() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;

  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient) {
      const t = searchParams.get('token');
      if (!t) {
        setError('Lien invalide ou expiré.');
      } else {
        setToken(t);
      }
    }
  }, [searchParams, isClient]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    if (newPassword !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch(`${baseUrl}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword }),
      });

      const data = await res.json();

      if (data.success) {
        setSuccess('Mot de passe mis à jour avec succès. Redirection vers la page de connexion...');
        setTimeout(() => router.push('/login'), 3000);
      } else {
        setError(data.error || 'Erreur lors de la mise à jour du mot de passe.');
      }
    } catch (err) {
      console.error(err);
      setError('Erreur serveur. Veuillez réessayer plus tard.');
    } finally {
      setIsLoading(false);
    }
  };

  // Don't render form until client-side
  if (!isClient) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.formBox}>
          <div className={styles.header}>
            <h2 className={styles.title}>Chargement...</h2>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <motion.form
        onSubmit={handleSubmit}
        className={styles.formBox}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className={styles.header}>
          <Link href="/login" className={styles.backButton}>
            <FiArrowLeft size={20} />
          </Link>
          <h2 className={styles.title}>Réinitialiser le mot de passe</h2>
          <p className={styles.subtitle}>Entrez votre nouveau mot de passe</p>
        </div>

        <div className={styles.inputContainer}>
          <FiLock className={styles.inputIcon} />
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Nouveau mot de passe"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className={styles.input}
            required
            minLength={8}
          />
          <button
            type="button"
            className={styles.passwordToggle}
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? 'Cacher' : 'Afficher'}
          </button>
        </div>

        <div className={styles.inputContainer}>
          <FiLock className={styles.inputIcon} />
          <input
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder="Confirmer le mot de passe"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={styles.input}
            required
          />
          <button
            type="button"
            className={styles.passwordToggle}
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
          >
            {showConfirmPassword ? 'Cacher' : 'Afficher'}
          </button>
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

        {success && (
          <motion.div
            className={styles.successContainer}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
          >
            <FiCheckCircle className={styles.successIcon} />
            <p className={styles.success}>{success}</p>
          </motion.div>
        )}

        <motion.button
          type="submit"
          className={styles.button}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          disabled={!token || isLoading}
        >
          {isLoading ? <span className={styles.spinner}></span> : 'Mettre à jour'}
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