"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import Script from "next/script";
import * as fpixel from "../lib/fpixel";
import { captureUTMParams } from "../lib/utmNavigation";

const FacebookPixel = () => {
  const [loaded, setLoaded] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Capture UTMs on every page view/route change
    captureUTMParams();

    if (!loaded) return;
    fpixel.pageview();
  }, [pathname, searchParams, loaded]);

  return (
    <div>
      <Script
        id="fb-pixel"
        src="https://connect.facebook.net/en_US/fbevents.js"
        strategy="afterInteractive"
        onLoad={() => {
          setLoaded(true);
        }}
      />
      <Script id="fb-pixel-init" strategy="afterInteractive">
        {`
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '${fpixel.FB_PIXEL_ID || "PIXEL_ID_NOT_SET"}');
          fbq('track', 'PageView');
        `}
      </Script>
    </div>
  );
};

export default FacebookPixel;
