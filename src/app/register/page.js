'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FiUser, FiMail, FiLock, FiArrowRight } from 'react-icons/fi';
import styles from './page.module.css';
import Link from 'next/link';

export default function RegisterPage() {
  const [full_name, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch(`${baseUrl}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ full_name, email, password }),
      });

      const data = await res.json();

      if (data.id) {
        router.push('/login');
      } else {
        setError(data.error || 'Erreur lors de l\'inscription');
      }
    } catch (err) {
      console.error(err);
      setError('Erreur serveur. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      <motion.form 
        onSubmit={handleRegister} 
        className={styles.formBox}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h2 className={styles.title}>Créer un compte</h2>
        <p className={styles.subtitle}>Commencez votre essai gratuit de 7 jours</p>

        <div className={styles.inputGroup}>
          <div className={styles.inputContainer}>
            <FiUser className={styles.inputIcon} />
            <input
              type="text"
              placeholder="Nom complet"
              value={full_name}
              onChange={(e) => setFullName(e.target.value)}
              className={styles.input}
              required
            />
          </div>

          <div className={styles.inputContainer}>
            <FiMail className={styles.inputIcon} />
            <input
              type="email"
              placeholder="Adresse email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={styles.input}
              required
            />
          </div>

          <div className={styles.inputContainer}>
            <FiLock className={styles.inputIcon} />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.input}
              required
              minLength={8}
            />
            <button 
              type="button" 
              className={styles.passwordToggle}
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? 'Cacher' : 'Afficher'}
            </button>
          </div>
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
            <>
              S'inscrire <FiArrowRight className={styles.buttonIcon} />
            </>
          )}
        </motion.button>

        <div className={styles.links}>
          <p className={styles.loginPrompt}>
            Vous avez déjà un compte ?{' '}
            <Link href="/login" className={styles.link}>
              Connectez-vous ici
            </Link>
          </p>
          <p className={styles.trialText}>
            Votre essai gratuit inclut toutes les fonctionnalités premium.
          </p>
        </div>
      </motion.form>
    </div>
  );
}