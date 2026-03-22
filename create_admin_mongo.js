// Script untuk create admin user via MongoDB
// Jalankan: mongosh < create_admin_mongo.js

// Gunakan database
db = db.getSiblingDB('autolive');

// Password: @Rs101185
// Hash ini adalah contoh, sebaiknya hash dari bcrypt dengan salt rounds 10
// Tapi untuk testing cepat, kita bisa insert dulu lalu update via API

// Cek apakah user sudah ada
const existingUser = db.users.findOne({ email: "rudysetiawan111@gmail.com" });

if (existingUser) {
    print("⚠️ User already exists!");
    print("Email: " + existingUser.email);
    print("Role: " + existingUser.role);
    print("Plan: " + existingUser.plan);
    
    // Update role ke admin jika belum
    if (existingUser.role !== "admin") {
        db.users.updateOne(
            { email: "rudysetiawan111@gmail.com" },
            { $set: { role: "admin", plan: "premium", updatedAt: new Date() } }
        );
        print("✅ User updated to admin!");
    }
} else {
    // Insert new admin user
    // NOTE: Password harus di-hash dengan bcrypt!
    // Untuk testing, bisa login dulu lalu sistem akan hash otomatis
    db.users.insertOne({
        email: "rudysetiawan111@gmail.com",
        password: "temporary_password_will_be_hashed_on_login", // Ini akan di-hash saat login
        name: "Rudy Setiawan",
        role: "admin",
        plan: "premium",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
    });
    print("✅ Admin user created!");
}

// Tampilkan semua admin
print("\n📋 All Admin Users:");
db.users.find({ role: "admin" }).forEach(user => {
    print(`  - ${user.email} (${user.name})`);
});
