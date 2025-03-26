// This file ensures the not-found page is rendered statically without Supabase
export const runtime = 'nodejs'; // force nodejs runtime instead of edge runtime
export const dynamic = 'force-static'; // force static rendering
export const dynamicParams = false; // Only prerendered parameters are valid
export const revalidate = false; // disable revalidation
export const fetchCache = 'force-cache'; // force using cache for all fetches 