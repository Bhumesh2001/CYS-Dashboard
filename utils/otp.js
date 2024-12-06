// **Generate OTP**
exports.generateOTP = (length = 6, options = { numeric: true, alphabets: false, specialChars: false }) => {
    let characters = '';

    // Dynamically choose character sets based on options
    if (options.numeric) characters += '0123456789';
    if (options.alphabets) characters += 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    if (options.specialChars) characters += '!@#$%^&*()_+-={}[]|:;<>,.?';

    // Fallback to numeric-only OTP if no valid option is provided
    if (characters === '') {
        characters = '0123456789'; // default to numeric
    }

    let otp = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        otp += characters[randomIndex];
    }

    return otp;
};
