import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.NEXTAUTH_SECRET || 'your-fallback-secret-key';

export interface JWTPayload {
  userId: string;
  email: string;
  subscriptionStatus: string;
  iat?: number;
  exp?: number;
}

export class JWTUtils {
  // Generate a JWT token
  static generateToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
    return jwt.sign(payload, JWT_SECRET, {
      expiresIn: '90d', // Token expires in 90 days (3 months)
      issuer: 'spacemypdf',
      audience: 'spacemypdf-users'
    });
  }

  // Verify a JWT token
  static verifyToken(token: string): JWTPayload | null {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
      return decoded;
    } catch (error) {
      console.error('JWT verification error:', error);
      return null;
    }
  }

  // Generate a refresh token
  static generateRefreshToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
    return jwt.sign(payload, JWT_SECRET, {
      expiresIn: '180d', // Refresh token expires in 180 days (6 months)
      issuer: 'spacemypdf',
      audience: 'spacemypdf-users'
    });
  }

  // Generate an email verification token
  static generateEmailVerificationToken(email: string): string {
    return jwt.sign(
      { email, type: 'email_verification' },
      JWT_SECRET,
      { expiresIn: '24h' } // Email verification expires in 24 hours
    );
  }

  // Generate a password reset token
  static generatePasswordResetToken(email: string): string {
    return jwt.sign(
      { email, type: 'password_reset' },
      JWT_SECRET,
      { expiresIn: '1h' } // Password reset expires in 1 hour
    );
  }

  // Generate a phone verification token
  static generatePhoneVerificationToken(phone: string): string {
    return jwt.sign(
      { phone, type: 'phone_verification' },
      JWT_SECRET,
      { expiresIn: '10m' } // Phone verification expires in 10 minutes
    );
  }

  // Verify email verification token
  static verifyEmailVerificationToken(token: string): { email: string } | null {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      if (decoded.type === 'email_verification') {
        return { email: decoded.email };
      }
      return null;
    } catch (error) {
      console.error('Email verification token error:', error);
      return null;
    }
  }

  // Verify password reset token
  static verifyPasswordResetToken(token: string): { email: string } | null {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      if (decoded.type === 'password_reset') {
        return { email: decoded.email };
      }
      return null;
    } catch (error) {
      console.error('Password reset token error:', error);
      return null;
    }
  }

  // Verify phone verification token
  static verifyPhoneVerificationToken(token: string): { phone: string } | null {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      if (decoded.type === 'phone_verification') {
        return { phone: decoded.phone };
      }
      return null;
    } catch (error) {
      console.error('Phone verification token error:', error);
      return null;
    }
  }

  // Extract token from Authorization header
  static extractTokenFromHeader(authHeader: string | null): string | null {
    if (!authHeader) return null;
    
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return null;
    }
    
    return parts[1];
  }

  // Check if token is expired
  static isTokenExpired(token: string): boolean {
    try {
      const decoded = jwt.decode(token) as any;
      if (!decoded || !decoded.exp) return true;
      
      const currentTime = Math.floor(Date.now() / 1000);
      return decoded.exp < currentTime;
    } catch (error) {
      return true;
    }
  }
}
