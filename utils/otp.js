const User = require('../models/User');

// **Generate OTP**
exports.generateOTP = (
    length = 6,
    options = { numeric: true, alphabets: false, specialChars: false }
) => {
    let characters = '';

    // Dynamically choose character sets based on options
    if (options.numeric) characters += '0123456789';
    if (options.alphabets) characters += 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    if (options.specialChars) characters += '!@#$%^&*()_+-={}[]|:;<>,.?';

    // Fallback to numeric-only OTP if no valid option is provided
    if (characters === '') {
        characters = '0123456789'; // default to numeric
    };

    let otp = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        otp += characters[randomIndex];
    };

    return otp;
};

// generate rondon phone number
exports.generateRandomPhoneNumber = async () => {
    let newNumber, isUnique = false;

    while (!isUnique) {
        newNumber = `${Math.floor(Math.random() * 9) + 1}${Math.floor(100000000 + Math.random() * 900000000)}`;
        isUnique = !(await User.exists({ mobile: newNumber })); // Check uniqueness in the database
    };

    return newNumber;
};