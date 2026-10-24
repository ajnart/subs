# Protect one Collection with an Installation PIN

Subs serves one private Collection across devices, not separate user accounts. Authentication is enabled by default: an Operator setup token from the environment or a generated server-log token authorizes first-use PIN setup, the PIN is hashed server-side, and opaque HttpOnly sessions protect subsequent access with brute-force controls and same-origin mutation checks.

This avoids public first-visitor takeover without adding account registration or an external identity provider. The Operator may explicitly set DISABLE_AUTH=true for a trusted environment; that mode exposes the Collection, while data exports still exclude credentials and sessions and PIN values never enter logs.
