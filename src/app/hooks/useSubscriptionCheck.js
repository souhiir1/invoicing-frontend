'use client';
import { useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';

export default function useSubscriptionCheck() {
  const user = useSelector((state) => state.user.user);
  const token = useSelector((state) => state.user.token);
  const router = useRouter();

  useEffect(() => {
   
    if (!user) return;
    const checkSub = async () => {
      
      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/subscription/status`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("res status",res)
        
        if (res.data.isBlocked) {
          router.push('/subscribe');
        }
      } catch (err) {
        console.error(err);
      }
    };
    checkSub();
  }, [user]);
}
