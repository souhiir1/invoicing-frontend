'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { setUser } from '../redux/userSlice';
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight } from 'react-icons/fi';
import { motion } from 'framer-motion';
import styles from './page.module.css';
import Link from 'next/link';
 
export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();
  const router = useRouter();
const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (data.token) {
        dispatch(setUser({ user: data.user, token: data.token }));
        router.push('/dashboard');
      } else {
        setError(data.error || 'Email ou mot de passe incorrect');
      }
    } catch (err) {
      console.error(err);
      setError("Erreur lors de la tentative de connexion");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      {/* Left side - Welcome section */}
      <div className={styles.welcomeSection}>
        <motion.div 
          className={styles.welcomeContent}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className={styles.welcomeTitle}>Welcome back!</h1>
         <p className={styles.welcomeText}>
  Nous sommes ravis de vous revoir ! Connectez-vous pour accéder à votre tableau de bord personnalisé et continuer à gérer vos projets en freelance.
</p>

          <div className={styles.decorativeShape}></div>
        </motion.div>
      </div>

      {/* Right side - Login form */}
      <div className={styles.formSection}>
        <motion.form 
          onSubmit={handleLogin} 
          className={styles.formBox}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className={styles.title}>Connexion</h2>
          <p className={styles.subtitle}>Accédez à votre espace personnel</p>

          <div className={styles.inputGroup}>
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
              />
              <button 
                type="button" 
                className={styles.passwordToggle}
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </div>

          {error && (
            <motion.p 
              className={styles.error}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              {error}
            </motion.p>
          )}

          <div className={styles.actionGroup}>
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
                  Se connecter <FiArrowRight className={styles.buttonIcon} />
                </>
              )}
            </motion.button>

            <div className={styles.links}>
              <div className={styles.registerPrompt}>
                <span>Vous n'avez pas encore de compte ? </span>
                <Link href="/register" className={styles.link}>
                  Inscrivez-vous maintenant
                </Link>
                <span> et profitez de 7 jours d'essai gratuit.</span>
              </div>
              <div className={styles.forgotPassword}>
                <Link href="/forgot-password" className={styles.linkSecondary}>
                  Mot de passe oublié ?
                </Link>
              </div>
            </div>
          </div>
        </motion.form>
      </div>
    </div>
  );
}