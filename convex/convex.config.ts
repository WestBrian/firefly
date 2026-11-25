import auth from "@convex-dev/auth/convex.config.js";
import authEmail from "@convex-dev/auth/components/email/convex.config.js";
import authPasskey from "@convex-dev/auth/components/passkey/convex.config.js";
import authPassword from "@convex-dev/auth/components/password/convex.config.js";
import authUsername from "@convex-dev/auth/components/username/convex.config.js";
import resend from "@convex-dev/resend/convex.config.js";
import { defineApp } from "convex/server";
import { v } from "convex/values";

const app = defineApp({
  env: {
    PASSKEY_RP_ID: v.optional(v.string()),
    PASSKEY_ORIGIN: v.optional(v.string()),
    SITE_URL: v.string(),
    RESEND_KEY: v.string(),
    SENDER_EMAIL: v.string(),
    SENDER_NAME: v.string(),
  },
});

app.use(auth);
app.use(authEmail);
app.use(authPasskey);
app.use(authPassword);
app.use(authUsername);
app.use(resend);

export default app;
