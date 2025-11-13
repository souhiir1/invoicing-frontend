'use client';
import { useState } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { FiCheck, FiZap, FiStar, FiShield, FiHelpCircle } from 'react-icons/fi';
import styles from './page.module.css';

export default function SubscribePage() {
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const user = useSelector((state) => state.user.user);
const token = useSelector((state) => state.user.token);
const handleSubscribe = async (type) => {
  setLoading(true);
  setSelectedPlan(type);
  try {
 
    const createRes = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/api/subscription/create-payment`,
      { type },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const { localPaymentId } = createRes.data;
    if (!localPaymentId) {
      alert("Erreur: impossible de créer le paiement.");
      return;
    }


    const initRes = await axios.post(
  `${process.env.NEXT_PUBLIC_API_URL}/api/subscription/initiate`,
  {
    localPaymentId,
    email: user.email,
    phone: user.phone,
  },
  {
    headers: { Authorization: `Bearer ${token}` },
  }
);


    const { payment_url } = initRes.data;
    if (payment_url) {
      window.location.href = payment_url;
    } else {
      alert("Erreur: lien de paiement introuvable.");
    }

  } catch (err) {
    console.error(err);
    alert("Erreur lors du paiement.");
  } finally {
    setLoading(false);
    setSelectedPlan(null);
  }
};


  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.header}>
          <div className={styles.trialEnded}>
            <FiZap />
            {`Période d'essai terminée`}
          </div>
          <h1 className={styles.title}>Choisissez Votre Abonnement</h1>
          <p className={styles.subtitle}>
            Continuez à profiter de toutes les fonctionnalités premium de votre application de facturation
          </p>
        </div>

        <div className={styles.plans}>
      
          <div className={styles.plan}>
            <h3 className={styles.planTitle}>Mensuel</h3>
            <div className={styles.planPrice}>15 TND</div>
            <div className={styles.planPeriod}>par mois</div>
            
            <ul className={styles.planFeatures}>
              <li className={styles.planFeature}>
                <FiCheck className={styles.featureIcon} />
                Facturation illimitée
              </li>
              <li className={styles.planFeature}>
                <FiCheck className={styles.featureIcon} />
                Clients illimités
              </li>
              <li className={styles.planFeature}>
                <FiCheck className={styles.featureIcon} />
                Projets illimités
              </li>
              <li className={styles.planFeature}>
                <FiCheck className={styles.featureIcon} />
                Support prioritaire
              </li>
            </ul>

            <button 
              onClick={() => handleSubscribe('monthly')} 
              disabled={loading}
              className={`${styles.subscribeButton} ${styles.monthly}`}
            >
              {loading && selectedPlan === 'monthly' ? (
                <>
                  <div className={styles.loadingSpinner}></div>
                  Traitement...
                </>
              ) : (
                'Choisir Mensuel'
              )}
            </button>
          </div>

      
          <div className={`${styles.plan} ${styles.popular}`}>
            <h3 className={styles.planTitle}>Accès à Vie</h3>
            <div className={styles.planPrice}>150 TND</div>
            <div className={styles.planPeriod}>paiement unique</div>
            
            <ul className={styles.planFeatures}>
              <li className={styles.planFeature}>
                <FiCheck className={styles.featureIcon} />
                Toutes les fonctionnalités mensuelles
              </li>
              <li className={styles.planFeature}>
                <FiCheck className={styles.featureIcon} />
                Accès à vie
              </li>
              <li className={styles.planFeature}>
                <FiCheck className={styles.featureIcon} />
                Mises à jour gratuites
              </li>
              <li className={styles.planFeature}>
                <FiCheck className={styles.featureIcon} />
                Support premium
              </li>
            </ul>

            <button 
              onClick={() => handleSubscribe('lifetime')} 
              disabled={loading}
              className={`${styles.subscribeButton} ${styles.lifetime}`}
            >
              {loading && selectedPlan === 'lifetime' ? (
                <>
                  <div className={styles.loadingSpinner}></div>
                  Traitement...
                </>
              ) : (
                <>
                  <FiStar />
                  Meilleure Offre
                </>
              )}
            </button>
          </div>
        </div>

        <div className={styles.benefits}>
          <div className={styles.benefit}>
            <FiShield className={styles.benefitIcon} />
            <h4 className={styles.benefitTitle}>Sécurisé</h4>
            <p className={styles.benefitDescription}>Paiements 100% sécurisés avec cryptage SSL</p>
          </div>
          <div className={styles.benefit}>
            <FiZap className={styles.benefitIcon} />
            <h4 className={styles.benefitTitle}>Immédiat</h4>
            <p className={styles.benefitDescription}>Activation instantanée après paiement</p>
          </div>
          <div className={styles.benefit}>
            <FiHelpCircle className={styles.benefitIcon} />
            <h4 className={styles.benefitTitle}>Support</h4>
            <p className={styles.benefitDescription}>Assistance dédiée 7j/7</p>
          </div>
        </div>

        <div className={styles.footer}>
          <div className={styles.guarantee}>
            <FiShield />
            Garantie satisfait ou remboursé 30 jours
          </div>
          <p className={styles.support}>
            Des questions ? <a href="contact@inovasphere.tech">Contactez notre support</a>
          </p>
        </div>
      </div>
    </div>
  );
}