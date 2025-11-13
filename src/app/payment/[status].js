'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useSelector } from 'react-redux';
import styles from '../subscribe/page.module.css'; 

export default function PaymentStatusPage({ params }) {
  const { status } = params; 
  const user = useSelector((state) => state.user.user);
  const token = useSelector((state) => state.user.token);
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSubscription = async () => {
      if (status === 'success' && user) {
        try {
       
          const res = await axios.get(
            `${process.env.NEXT_PUBLIC_API_URL}/api/subscription/status`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          if (!res.data.isBlocked) {
        
            router.push('/dashboard');
          }
        } catch (err) {
          console.error(err);
        }
      }
      setLoading(false);
    };

    checkSubscription();
  }, [status, user]);

  if (loading) return <p style={{ textAlign: 'center', marginTop: '2rem' }}>Vérification en cours...</p>;

  return (
    <div className={styles.container}>
      <div className={styles.content} style={{ maxWidth: '500px' }}>
        {status === 'success' ? (
          <>
            <h1 className={styles.title}>Paiement réussi !</h1>
            <p>Merci pour votre abonnement. Vous pouvez maintenant profiter de toutes les fonctionnalités premium.</p>
            <button className={styles.subscribeButton} onClick={() => router.push('/dashboard')}>
              Aller au Dashboard
            </button>
          </>
        ) : (
          <>
            <h1 className={styles.title}>Paiement échoué</h1>
            <p>Une erreur est survenue lors du paiement. Veuillez réessayer.</p>
            <button className={styles.subscribeButton} onClick={() => router.push('/subscribe')}>
              Réessayer
            </button>
          </>
        )}
      </div>
    </div>
  );
}
