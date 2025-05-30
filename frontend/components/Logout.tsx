'use client';

import { useRouter } from 'next/navigation';

export default function Logout() {
    const router = useRouter();

    const handleLogout = () => {
        localStorage.removeItem('token');
        router.push('/login');
    };
    
    return (
        <button
            onClick={handleLogout}
            className="fixed left-14 px-4 py-2 bg-blue-600 text-white rounded hover:bg-red-700"
        >
            Déconnexion
        </button>
    );
}
