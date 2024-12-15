// welcome message
exports.message = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            background: linear-gradient(120deg, #f6d365, #fda085);
            color: #333;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
        }
        .container {
            text-align: center;
            margin: 15px;
            padding: 20px;
            background: #ffffffaa;
            border-radius: 10px;
            box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
        }
        h1 {
            font-size: 2.5rem;
            margin-bottom: 10px;
            color: #444;
        
        p {
            font-size: 1rem;
            color: #555;
        
        /* Tablet devices */
        @media (max-width: 768px) {
            h1 {
                font-size: 2rem;
            
            p {
                font-size: 0.9rem;
            }
        
        /* Mobile devices */
        @media (max-width: 480px) {
            h1 {
                font-size: 1.5rem;
                margin-bottom: 8px;
            
            p {
                font-size: 0.8rem;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Welcome to the CYS Backend Application</h1>
        <p>Welcome to the backend application. This page is served from your Node.js server!</p>
    </div>
</body>
</html>`;

exports.otpHtmlTemplate = (otp) => {
    return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Password Reset OTP</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    margin: 0;
                    padding: 0;
                    background-color: #f4f4f9;
                    color: #333;
                }
                .container {
                    max-width: 600px;
                    margin: 20px auto;
                    background-color: #ffffff;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                    border-radius: 8px;
                    overflow: hidden;
                }
                .header {
                    background-color: #007bff;
                    color: #ffffff;
                    padding: 20px;
                    text-align: center;
                }
                .header h1 {
                    margin: 0;
                    font-size: 24px;
                }
                .content {
                    padding: 20px;
                    line-height: 1.6;
                }
                .content h2 {
                    margin: 0 0 10px;
                    font-size: 20px;
                    color: #007bff;
                }
                .content p {
                    margin: 0 0 15px;
                }
                .otp {
                    display: inline-block;
                    background-color: #f8f9fa;
                    padding: 10px 20px;
                    border-radius: 5px;
                    font-size: 18px;
                    font-weight: bold;
                    letter-spacing: 1.5px;
                    color: #333;
                    border: 1px solid #ddd;
                }
                .footer {
                    text-align: center;
                    padding: 20px;
                    font-size: 12px;
                    color: #666;
                    background-color: #f8f9fa;
                    border-top: 1px solid #ddd;
                }
                .footer a {
                    color: #007bff;
                    text-decoration: none;
                }
                .footer a:hover {
                    text-decoration: underline;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>CYS App</h1>
                </div>
                <div class="content">
                    <h2>Password Reset OTP</h2>
                    <p>Hi there,</p>
                    <p>We received a request to reset the password for your CYS account. Please use the OTP below to reset your password. This OTP is valid for <strong>10 minutes</strong>.</p>
                    <p class="otp">${otp}</p>
                    <p>If you did not request a password reset, please ignore this email or contact our support team for assistance.</p>
                    <p>Thank you,<br>The CYS App Team</p>
                </div>
                <div class="footer">
                    <p>Need help? <a href="mailto:support@cysapp.com">Contact Support</a></p>
                    <p>&copy; 2024 CYS App. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>`;
};