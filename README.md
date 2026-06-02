# CBS Gotham Express RSVP Web App (Supabase Edition)

A beautifully styled, mobile-friendly, Columbia Blue and NYC Subway-themed RSVP web application for the CBS Delhi Houseparty.

---

## 🚀 Features

- **Supabase Cloud Database**: Stores response payloads securely on the cloud.
- **Commuter Fallback Sandbox**: Connects to an in-memory database if Supabase credentials are not supplied, allowing developers to play with all UI inputs locally immediately.
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

4. Go to **Project Settings** -> **API** and copy your **Project URL** and **Anon Key**.

---

### 2. Local Setup & Installation

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
2. Open `.env` and fill in your copied credentials:
   ```env
   SUPABASE_URL=https://your-project-id.supabase.co
   SUPABASE_KEY=your-anon-public-key
   ```
3. Install dependencies:
   ```bash
   pip3 install -r requirements.txt
   ```
4. Run the Flask Server:
   ```bash
   python3 app.py
   ```
5. View in browser: Open [http://127.0.0.1:5000](http://127.0.0.1:5000)

---

## 📁 Repository Structure
- `app.py`: Flask application server containing API endpoints.
- `database.py`: Connector utilizing the official `supabase` python SDK (with sandbox fallback).
- `templates/index.html`: Fully custom HTML commuter UI.
- `static/css/style.css`: HSL design system theme.
- `static/js/main.js`: Form submission and lookup controller.
