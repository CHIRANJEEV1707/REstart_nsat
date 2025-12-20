import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

interface AuthButtonProps {
    className?: string;
    children?: React.ReactNode;
}

/**
 * Smart authentication button that:
 * - Checks if user is logged in
 * - Redirects to /dashboard if authenticated
 * - Redirects to /auth/login if not authenticated
 * - Uses client-side navigation (no page reload)
 */
export default function AuthButton({
    className = "px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg hover:bg-indigo-700 transition-all",
    children = "Go to Login"
}: AuthButtonProps) {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    const handleClick = () => {
        if (isLoading) return;

        if (user) {
            router.push('/dashboard');
        } else {
            router.push('/auth/login');
        }
    };

    return (
        <button
            onClick={handleClick}
            disabled={isLoading}
            className={className}
        >
            {isLoading ? 'Checking...' : children}
        </button>
    );
}
