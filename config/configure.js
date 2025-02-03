// helmet config
exports.helmetConfig = {
    directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
            "'self'",
            "https://cdn.jsdelivr.net",
            "https://cdnjs.cloudflare.com",  // Font Awesome CDN
        ],
        styleSrc: [
            "'self'",
            "https://cdn.jsdelivr.net",
            "https://cdnjs.cloudflare.com",  // Font Awesome Styles
            "'unsafe-inline'"
        ],
        fontSrc: [
            "'self'",
            "https://cdnjs.cloudflare.com",  // Font Awesome Fonts
            "https://cdn.jsdelivr.net",
            "data:"
        ],
        imgSrc: [
            "'self'",
            "https://cdnjs.cloudflare.com",
            "https://res.cloudinary.com",  // ✅ Cloudinary Allowed
            "data:"
        ], // Allow icons
        scriptSrcAttr: ["'unsafe-inline'"],
    },
};
