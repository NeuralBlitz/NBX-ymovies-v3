// Debug Firebase credentials
import { config } from 'dotenv';

config({ path: '.env.local' });

const credentialsBase64 = process.env.FIREBASE_ADMIN_CREDENTIALS;

console.log('Environment loaded from .env.local');
console.log('Credentials length:', credentialsBase64 ? credentialsBase64.length : 'undefined');

if (credentialsBase64) {
  try {
    console.log('First 100 chars:', credentialsBase64.substring(0, 100));
    console.log('Last 100 chars:', credentialsBase64.substring(credentialsBase64.length - 100));
    
    // Try to decode
    const decoded = Buffer.from(credentialsBase64, 'base64').toString();
    console.log('Decoded first 200 chars:', decoded.substring(0, 200));
    
    // Try to parse as JSON
    const parsed = JSON.parse(decoded);
    console.log('✅ Successfully parsed as JSON');
    console.log('Project ID:', parsed.project_id);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
} else {
  console.error('❌ No credentials found');
}
