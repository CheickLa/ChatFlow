'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Chat from '../components/Chat';
import { User } from '../lib/socket';

interface JWTPayload {
  username: string;
  sub: number;
  color: string;
  iat: number;
  exp: number;
}

export default function ChatPage() {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const router = useRouter();

  // S'assurer que le composant est monté côté client
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    // Attendre que le composant soit monté côté client
    if (!isMounted) {
      return;
    }

    // Récupérer le token depuis localStorage
    const storedToken = localStorage.getItem('token');
    
    if (!storedToken) {
      setIsLoading(false);
      router.push('/login');
      return;
    }

    // Décoder le token pour récupérer les infos utilisateur
    try {
      const payload: JWTPayload = JSON.parse(atob(storedToken.split('.')[1]));
      
      // Vérifier si le token n'est pas expiré
      if (payload.exp * 1000 < Date.now()) {
        localStorage.removeItem('token');
        setIsLoading(false);
        router.push('/login');
        return;
      }

      const userData: User = {
        userId: payload.sub,
        username: payload.username,
        color: payload.color
      };

      setUser(userData);
      setToken(storedToken);
      setIsLoading(false);
    } catch (error) {
      console.error('Token invalide:', error);
      localStorage.removeItem('token');
      setIsLoading(false);
      router.push('/login');
    }
  }, [isMounted, router]);

  if (!isMounted || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Chargement...</div>
      </div>
    );
  }

  if (!user || !token) {
    return null;
  }

  return <Chat token={token} user={user} />;
}