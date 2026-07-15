import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import ReactGA from 'react-ga4';

const TRACKING_ID = "G-KJW81GTBST"; 

export default function GoogleAnalytics() {
  const location = useLocation();

  useEffect(() => {
    if (!ReactGA.isInitialized) {
      ReactGA.initialize(TRACKING_ID);
    }
    
    ReactGA.send({ 
      hitType: "pageview", 
      page: location.pathname + location.search 
    });
  }, [location]);

  return null;
}