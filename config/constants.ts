export const description =
  "A static site generator for creating HPC documentation sites";

const isProduction = process.env.NODE_ENV === "production";
export const assetPrefix = isProduction ? "/hpc-book" : "";
