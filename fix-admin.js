const mongoose = require('mongoose');

// MongoDB connection string - replace with your actual connection string
const MONGODB_URI = 'mongodb+srv://mayanksundriyal97:<db_password>@cluster0.zkizm3e.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

// User schema
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  phone: String,
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String,
  },
  createdAt: Date,
  updatedAt: Date,
});

const User = mongoose.model('User', userSchema);

async function fixAdminRole() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Replace 'your-email@example.com' with your actual email
    const yourEmail = 'your-email@example.com'; // CHANGE THIS TO YOUR EMAIL

    // First, add role field to all users who don't have it
    const usersWithoutRole = await User.find({ role: { $exists: false } });
    console.log(`Found ${usersWithoutRole.length} users without role field`);

    if (usersWithoutRole.length > 0) {
      const result = await User.updateMany(
        { role: { $exists: false } },
        { $set: { role: 'user' } }
      );
      console.log(`Updated ${result.modifiedCount} users with role field`);
    }

    // Now make your specific user an admin
    const user = await User.findOne({ email: yourEmail });
    
    if (!user) {
      console.log(`User with email ${yourEmail} not found`);
      return;
    }

    user.role = 'admin';
    await user.save();
    
    console.log(`Successfully made ${yourEmail} an admin!`);
    console.log('User details:', {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the fix
fixAdminRole(); 