import { assetPrefix, description } from "../config/constants";

export function Head() {
  const title = "HPC Book";
  return (
    <>
      <meta name="msapplication-TileColor" content="#fff" />
      <meta httpEquiv="Content-Language" content="en" />
      <meta name="description" content={description} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta name="apple-mobile-web-app-title" content={title} />
      {/* <link
        rel="icon"
        type="image/x-icon"
        href={`${assetPrefix}/favicon.ico`}
      /> */}

      <link rel="icon" href={`${assetPrefix}/favicon-dark.svg`} type="image/svg+xml" />
      <link rel="icon" href={`${assetPrefix}/favicon-dark.png`} type="image/png" />
    </>
  );
}
