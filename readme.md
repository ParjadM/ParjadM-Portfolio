Start both client and server:
cd 'C:\Users\Parjad\Desktop\Portfolio\parjadm'; npm run dev



Terminal A (server)
cd 'C:\Users\Parjad\Desktop\Portfolio\parjadm\server'
set PORT=5174
npm run dev


Terminal B (client):
cd 'C:\Users\Parjad\Desktop\Portfolio\parjadm'
npm run dev:client

Email (Contact Form) setup:

Create a `.env` file in `server/` with:

```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=YOUR_GMAIL_ADDRESS
SMTP_PASS=YOUR_GMAIL_APP_PASSWORD
TO_EMAIL=minooeip@gmail.com
APP_NAME=Parjad Portfolio
```

Note: For Gmail, enable 2‑Step Verification and create an App Password, then use it for `SMTP_PASS`.