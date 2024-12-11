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
                }

                p {
                    font-size: 1rem;
                    color: #555;
                }

                /* Tablet devices */
                @media (max-width: 768px) {
                    h1 {
                        font-size: 2rem;
                    }

                    p {
                        font-size: 0.9rem;
                    }
                }

                /* Mobile devices */
                @media (max-width: 480px) {
                    h1 {
                        font-size: 1.5rem;
                        margin-bottom: 8px;
                    }

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
