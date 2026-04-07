import { Navigate, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react'; 

interface RequireUnAuthProps {
    children: ReactNode; 
}

export const RequireUnAuth = ({ children }: RequireUnAuthProps) => {
    const location = useLocation();
    
    const token = localStorage.getItem('token');

    if(token){
        return <Navigate to='/editor' state={{from: location}} replace />;
    }

    return children;
};