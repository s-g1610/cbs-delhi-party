import os
import logging
from supabase import create_client, Client
from dotenv import load_dotenv

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load local environment parameters
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

# Check if active credentials are set
has_supabase = (
    SUPABASE_URL 
    and SUPABASE_KEY 
    and "your-project" not in SUPABASE_URL 
    and "your-anon" not in SUPABASE_KEY
)

supabase_client = None
if has_supabase:
    try:
        supabase_client = create_client(SUPABASE_URL, SUPABASE_KEY)
        logger.info("Successfully connected to Supabase Cloud Database.")
    except Exception as e:
        logger.error(f"Error initializing Supabase client: {e}")
else:
    logger.warning("Supabase credentials missing or placeholders detected! Defaulting to local sandbox mode.")

# In-Memory Sandbox Mock Database for local testing before config
_sandbox_db = {}

def get_guest(phone_number):
    """Retrieves a guest profile from Supabase, or sandbox database if offline."""
    if supabase_client:
        try:
            response = supabase_client.table('guests').select('*').eq('phone_number', phone_number).execute()
            if response.data and len(response.data) > 0:
                # Return standard dict
                return response.data[0]
            return None
        except Exception as e:
            logger.error(f"Supabase fetch error: {e}")
            raise e
    else:
        # Sandbox Fallback
        logger.info(f"[SANDBOX] Fetching guest profile for: {phone_number}")
        return _sandbox_db.get(phone_number)

def save_guest(data):
    """Saves or updates a guest profile in Supabase, or sandbox database if offline."""
    if supabase_client:
        try:
            # Format payload for Postgres matching database schema
            payload = {
                'phone_number': data['phone_number'],
                'name': data['name'],
                'status': data['status'],
                'has_plus_one': bool(data.get('has_plus_one')),
                'plus_one_name': data.get('plus_one_name') or None,
                'dietary_pref': data['dietary_pref'],
                'plus_one_dietary': data.get('plus_one_dietary') or None
            }
            response = supabase_client.table('guests').upsert(payload).execute()
            logger.info(f"Supabase upsert success: {response.data}")
            return response.data
        except Exception as e:
            logger.error(f"Supabase upsert error: {e}")
            raise e
    else:
        # Sandbox Fallback
        logger.info(f"[SANDBOX] Saving guest profile: {data}")
        _sandbox_db[data['phone_number']] = {
            'phone_number': data['phone_number'],
            'name': data['name'],
            'status': data['status'],
            'has_plus_one': bool(data.get('has_plus_one')),
            'plus_one_name': data.get('plus_one_name') or None,
            'dietary_pref': data['dietary_pref'],
            'plus_one_dietary': data.get('plus_one_dietary') or None
        }
        return _sandbox_db[data['phone_number']]
