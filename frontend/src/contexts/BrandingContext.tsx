import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { serverURL, appName as defaultAppName, appLogo as defaultAppLogo } from '@/constants';

interface BrandingContextType {
    appName: string;
    appLogo: string;
    isLoading: boolean;
}

const BrandingContext = createContext<BrandingContextType | undefined>(undefined);

export const BrandingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [appName, setAppName] = useState(defaultAppName);
    const [appLogo, setAppLogo] = useState(defaultAppLogo);
    const [isLoading, setIsLoading] = useState(true);

    const fetchBranding = async () => {
        try {
            // We can use the settings endpoint or a public endpoint if available.
            // For now, let's use the settings endpoint (assuming it's accessible or handled)
            // Or better, we can fetch from a new public route if we want to avoid auth issues.
            // However, the admin stats also has it.
            const res = await axios.get(`${serverURL}/api/settings`);
            if (res.data) {
                setAppName(res.data.websiteName || defaultAppName);
                const logo = res.data.websiteLogo || defaultAppLogo;
                if (logo.startsWith('/uploads/')) {
                    setAppLogo(`${serverURL}${logo}`);
                } else {
                    setAppLogo(logo);
                }
            }
        } catch (error) {
            console.error('Failed to fetch branding:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchBranding();
    }, []);

    return (
        <BrandingContext.Provider value={{ appName, appLogo, isLoading }}>
            {children}
        </BrandingContext.Provider>
    );
};

export const useBranding = () => {
    const context = useContext(BrandingContext);
    if (context === undefined) {
        throw new Error('useBranding must be used within a BrandingProvider');
    }
    return context;
};
