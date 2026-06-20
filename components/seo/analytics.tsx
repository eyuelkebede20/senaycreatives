import Script from "next/script";

// Opt-in analytics. Renders nothing unless an env var is set, so it's safe to
// ship now and turn on later by setting the var in the host env + redeploying.
//   • Plausible (privacy-friendly): NEXT_PUBLIC_PLAUSIBLE_DOMAIN=senaycreatives.com
//   • Google Analytics 4:           NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
export function Analytics() {
  const plausible = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;
  const ga = process.env.NEXT_PUBLIC_GA_ID;

  return (
    <>
      {plausible && (
        <Script defer data-domain={plausible} src="https://plausible.io/js/script.js" strategy="afterInteractive" />
      )}
      {ga && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${ga}`} strategy="afterInteractive" />
          <Script id="ga-init" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${ga}');`}
          </Script>
        </>
      )}
    </>
  );
}
