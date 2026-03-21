const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/autolive');

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  name: String,
  phoneNumber: String,
  role: String,
  plan: String,
  isEmailVerified: Boolean
});

const User = mongoose.model('User', userSchema);

const createAdmins = async () => {
  try {
    const password = '@Rs101185';
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const admins = [
      {
        email: 'rudysetiawan111@gmail.com',
        name: 'Rudy Setiawan',
        phoneNumber: '+6281234567890',
        role: 'admin',
        plan: 'premium',
        isEmailVerified: true,
        password: hashedPassword
      },
      {
        email: 'marga.jaya.bird.shop@gmail.com',
        name: 'Marga Jaya Bird Shop',
        phoneNumber: '+6281234567891',
        role: 'admin',
        plan: 'pro',
        isEmailVerified: true,
        password: hashedPassword
      },
      {
        email: 'autolive1.0.0@gmail.com',
        name: 'AutoLive Admin',
        phoneNumber: '+6281234567892',
        role: 'admin',
        plan: 'free',
        isEmailVerified: true,
        password: hashedPassword
      }
    ];
    
    // Delete existing users
    await User.deleteMany({});
    console.log('🗑️  Existing users deleted');
    
    // Create new users
    for (const admin of admins) {
      const user = new User(admin);
      await user.save();
      console.log(`✅ Created: ${admin.email} (${admin.plan})`);
    }
    
    console.log('\n🎉 Admin users created successfully!');
    console.log('🔑 Password: @Rs101185');
    
    // List all users
    const users = await User.find({}, { email: 1, role: 1, plan: 1 });
    console.log('\n📋 Users in database:');
    users.forEach(u => {
      console.log(`   - ${u.email} | Role: ${u.role} | Plan: ${u.plan}`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
};

createAdmins();
