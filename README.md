# CBS Gotham Express RSVP Web App (Serverless Supabase)

A beautifully styled, mobile-friendly, Columbia Blue and NYC Subway-themed RSVP web application for the CBS Delhi Houseparty.

This codebase operates as a **pure serverless frontend**, connecting directly from the client's browser to your Supabase Cloud Database. No servers (like Flask/Python) are required to run or host this application.

---

## 🚀 Features

- **Direct Cloud Integration**: Connects directly to Supabase from the browser using the official client library loaded via CDN.
- **Commuter Local Sandbox**: If Supabase keys are not configured, the site operates in **Sandbox Mode** using the browser's `LocalStorage`. This lets you double-click `index.html` to run, register, and modify tickets completely locally immediately!
- **Commuter Tickets Lookup**: Guests can query their WhatsApp numbers to pull and edit their RSVPs.
- **Dynamic +1 Details**: Smooth CSS collapsible drawers capturing guest preferences.

---

## 🛠️ Getting Started

### 1. Configure Supabase Cloud Database

1. Create a free project on [Supabase](https://supabase.com).
2. Inside your project dashboard, navigate to the **SQL Editor** tab.
3. Paste the following query to initialize the schema:

```sql
create table guests (
    phone_number text primary key,
    name text not null,
    status text not null,
    has_plus_one boolean not null default false,
    plus_one_name text,
    dietary_pref text not null,
    plus_one_dietary text,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table guests enable row level security;

-- Open read/write policies for the form API
create policy "Allow public read and write" 
on guests for all 
using (true) 
with check (true);
```

4. Go to **Project Settings** -> **API** and copy your **Project URL** and **Anon Key** (Anon public key).

---

### 2. Connect Your App
Open **`static/js/main.js`** and paste your credentials at the top of the file:
```javascript
const SUPABASE_URL = "https://your-project-id.supabase.co";
const SUPABASE_KEY = "your-anon-public-key";
```

Double click `index.html` on your computer, and you're ready!

---

## 🌐 Deploy to Lovable, Vercel, or Netlify
Because this is a static site:
1. Push this code to a **GitHub Repository**.
2. Go to **Lovable.dev**, **Vercel.com**, or **Netlify.com**.
3. Import the GitHub repository and click **Deploy**. It will deploy instantly for free!
