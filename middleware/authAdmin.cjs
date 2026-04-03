const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin.cjs');

exports.protectAdmin = async (req, res, next) => {
    try {
        let token;

        // Debug: Log all headers
        console.log('🔍 Auth Check - Headers received:', {
            authorization: req.headers.authorization ? 'Present' : 'Missing',
            'x-system-key': req.headers['x-system-key'] ? 'Present' : 'Missing'
        });

        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
            console.log('✅ Token found in Authorization header');
        }

        if (!token) {
            console.log('❌ No token provided in request');
            return res.status(401).json({
                success: false,
                error: 'Not authorized to access this route',
                details: 'No token provided. Please include Authorization header with Bearer token.'
            });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('✅ Token verified successfully. Admin ID:', decoded.id);

        // Find admin user
        const currentAdmin = await Admin.findById(decoded.id).select('-password');

        if (!currentAdmin) {
            console.log('❌ Admin user not found in database. ID:', decoded.id);
            return res.status(401).json({
                success: false,
                error: 'Admin no longer exists'
            });
        }

        if (!currentAdmin.isActive) {
            console.log('❌ Admin is inactive. ID:', decoded.id);
            return res.status(401).json({
                success: false,
                error: 'Admin account is inactive'
            });
        }

        console.log('✅ Auth successful for admin:', currentAdmin.email);
        req.admin = currentAdmin;
        next();
    } catch (err) {
        console.error('❌ Auth Error:', {
            name: err.name,
            message: err.message,
            code: err.code
        });

        // Provide specific error messages
        if (err.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                error: 'Invalid token',
                details: 'The provided token is invalid or malformed.'
            });
        }

        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                error: 'Token expired',
                details: 'Please login again to get a new token.'
            });
        }

        res.status(401).json({
            success: false,
            error: 'Not authorized to access this route',
            details: err.message
        });
    }
};

exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!req.admin) {
            return res.status(401).json({
                success: false,
                error: 'Admin not authenticated'
            });
        }

        if (!roles.includes(req.admin.role)) {
            console.log('❌ Permission denied. Required roles:', roles, 'User role:', req.admin.role);
            return res.status(403).json({
                success: false,
                error: 'You do not have permission to perform this action'
            });
        }
        console.log('✅ Permission granted for role:', req.admin.role);
        next();
    };
};