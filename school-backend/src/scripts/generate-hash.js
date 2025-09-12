import 'dotenv/config';
import bcrypt from 'bcryptjs';

async function generatePasswordHash() {
  try {
    const password = 'admin123';
    const saltRounds = 12;
    
    console.log('Generating bcrypt hash for password:', password);
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    console.log('\n✅ Generated Hash:');
    console.log(hashedPassword);
    
    console.log('\n📋 SQL to update admin password:');
    console.log(`UPDATE users SET password = '${hashedPassword}' WHERE email = 'admin@school.com';`);
    
    // Test the hash
    const isValid = await bcrypt.compare(password, hashedPassword);
    console.log('\n🔍 Hash validation test:', isValid ? '✅ PASS' : '❌ FAIL');
    
  } catch (error) {
    console.error('Error generating hash:', error);
  }
}

generatePasswordHash();