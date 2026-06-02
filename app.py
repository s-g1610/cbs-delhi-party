from flask import Flask, render_template, request, jsonify
from dotenv import load_dotenv
import database

# Load dotenv configuration
load_dotenv()

app = Flask(__name__)

@app.route('/')
def home():
    """Serves the main registration web page."""
    return render_template('index.html')

@app.route('/api/rsvp/<phone>', methods=['GET'])
def get_rsvp(phone):
    """Fetches an existing RSVP by phone number."""
    clean_phone = phone.strip()
    try:
        guest = database.get_guest(clean_phone)
        if guest:
            return jsonify({
                'success': True,
                'guest': guest
            })
        return jsonify({
            'success': False,
            'message': 'No registration found for this phone number.'
        }), 404
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Server error fetching RSVP: {str(e)}'
        }), 500

@app.route('/api/rsvp', methods=['POST'])
def save_rsvp():
    """Saves or updates an RSVP."""
    data = request.get_json()
    if not data:
        return jsonify({'success': False, 'message': 'Invalid payload.'}), 400
        
    phone = data.get('phone_number')
    name = data.get('name')
    status = data.get('status')
    dietary = data.get('dietary_pref')
    
    if not phone or not name or not status or not dietary:
        return jsonify({'success': False, 'message': 'Required fields are missing.'}), 400
        
    # Format and clean data
    guest_data = {
        'phone_number': phone.strip(),
        'name': name.strip(),
        'status': status.strip(),
        'has_plus_one': bool(data.get('has_plus_one')),
        'plus_one_name': data.get('plus_one_name', '').strip() if data.get('has_plus_one') else None,
        'dietary_pref': dietary.strip(),
        'plus_one_dietary': data.get('plus_one_dietary', '').strip() if data.get('has_plus_one') else None
    }
    
    try:
        database.save_guest(guest_data)
        return jsonify({
            'success': True,
            'message': 'RSVP successfully saved!'
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error saving RSVP: {str(e)}'
        }), 500

if __name__ == '__main__':
    # Start app on localhost port 5000
    app.run(debug=True, host='127.0.0.1', port=5000)
