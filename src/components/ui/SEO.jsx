const DEFAULT_TITLE = 'Scheduler App - Manage Your Appointments Efficiently';
const DEFAULT_DESCRIPTION =
  'Schedule and manage appointments, meetings, and events with our easy-to-use scheduling software. Perfect for businesses and individuals.';

export const PageSEO = ({ title, description, path = '' }) => {
  const url = `${window.location.origin}${path || window.location.pathname}`;
  const pageTitle = title || DEFAULT_TITLE;
  const pageDescription = description || DEFAULT_DESCRIPTION;
  const image = `${window.location.origin}/og-image.jpg`;

  return (
    <>
      <title>{pageTitle}</title>
      <meta name="description" content={pageDescription} />
      <link rel="canonical" href={url} />

      <meta property="og:type" content="website" />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={pageDescription} />
      <meta property="og:site_name" content="Scheduler App" />
      <meta property="og:image" content={image} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content="Scheduler App" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@schedulerapp" />
      <meta name="twitter:creator" content="@schedulerapp" />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={pageDescription} />
      <meta name="twitter:image" content={image} />
    </>
  );
};
