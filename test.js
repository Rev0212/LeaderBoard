// Import bcrypt
const bcrypt = require('bcrypt');

// Simulate a Student Schema
const studentSchema = {
    password: '',
    async setPassword(plainPassword) {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(plainPassword, salt);
        console.log('Password Hashed and Stored:', this.password);
    },
    async comparePassword(password) {
        console.log('Stored Hashed Password:', this.password);
        console.log('Provided Password:', password);
        const isMatch = await bcrypt.compare(password, this.password);
        console.log('Password Match:', isMatch);
        return isMatch;
    }
};

// Testing the Schema
(async () => {
    // Set a password
    await studentSchema.setPassword('mySecurePassword123');

    // Compare passwords
    await studentSchema.comparePassword('mySecurePassword123'); // Should return true
})();
