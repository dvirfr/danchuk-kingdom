// Public Firebase web config: safe to ship. Security comes from Firestore rules.
export const firebaseConfig = {
  apiKey: 'AIzaSyD2Q0WBmADJ5AUyTD-gCAiUJVrSXlGI5os',
  authDomain: 'danchuk-kingdom.firebaseapp.com',
  projectId: 'danchuk-kingdom',
  storageBucket: 'danchuk-kingdom.firebasestorage.app',
  messagingSenderId: '411748131952',
  appId: '1:411748131952:web:db5f763a119c9542a380b5',
}

export const ADMIN_EMAIL = 'dvirfr1@gmail.com'
// TODO: replace with Dana's real Gmail (must match firestore.rules)
export const DANA_EMAIL = 'DANA_EMAIL@gmail.com'
export const FAMILY_EMAILS = [ADMIN_EMAIL, DANA_EMAIL].map((e) => e.toLowerCase())

// Launch moment: 25 Nov 2026, 00:00 Israel time (UTC+2)
export const LAUNCH_AT = new Date('2026-11-25T00:00:00+02:00')
