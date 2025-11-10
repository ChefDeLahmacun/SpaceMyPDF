// Anti-Fraud Detection System
// Prevents abuse through disposable emails, suspicious patterns, and duplicate phone numbers

import dns from 'dns';
import { promisify } from 'util';

const resolveMx = promisify(dns.resolveMx);

export interface FraudScore {
  score: number; // 0-100 (higher = more suspicious)
  reasons: string[];
  isFraud: boolean;
  warnings: string[]; // Non-blocking warnings
}

export interface PhoneCheckResult {
  isAllowed: boolean;
  isDuplicate: boolean;
  existingAccounts: number;
  reason?: string;
}

export interface EmailValidationResult {
  isValid: boolean;
  hasMxRecords: boolean;
  error?: string;
}

export class AntiFraudService {
  // Disposable email domains (expanded list - updated 2024)
  private static disposableDomains = [
    // Popular temp email services
    '10minutemail.com', 'tempmail.org', 'guerrillamail.com',
    'mailinator.com', 'throwaway.email', 'temp-mail.org',
    'getnada.com', 'maildrop.cc', 'yopmail.com', 'sharklasers.com',
    'guerrillamail.biz', 'guerrillamail.de', 'guerrillamail.info',
    'guerrillamail.net', 'guerrillamail.org', 'pokemail.net',
    'spam4.me', 'bccto.me', 'chacuo.net', 'dispostable.com',
    'mailnesia.com', 'meltmail.com', 'mohmal.com', 'mytrashmail.com',
    'nada.email', 'nada.ltd', 'nada.pro', 'bdnets.com',
    'temp-mail.io', 'fakeinbox.com', 'trashmail.com', 'tempmail.net',
    'minutemail.com', 'emailondeck.com', 'tempr.email', 'guerrillamailblock.com',
    'mailcatch.com', 'mailtemporaire.fr', 'spambox.us', 'throwawaymail.com',
    'tempemail.net', 'tempinbox.com', 'temporaryemail.net', 'trashmail.net',
    // Additional common disposable domains
    'grr.la', 'getairmail.com', 'harakirimail.com', 'mailexpire.com',
    'mailforspam.com', 'mailmoat.com', 'mintemail.com', 'mytempemail.com',
    'spamgourmet.com', 'spaml.de', 'tempail.com', 'tempsky.com',
    'thankyou2010.com', 'trashcanmail.com', 'trbvm.com', 'wegwerfemail.de',
    'zehnminutenmail.de', 'maildrop.cc', 'dropmail.me', 'fakemail.net',
    'mailsac.com', 'mailnator.com', 'inboxbear.com', 'burnermail.io',
    'guerrillamail.com', 'spambox.info', 'tempmail.de', 'trash-mail.com',
    'tmpeml.info', '10mail.org', '20email.eu', 'correotemporal.org'
  ];

  // Suspicious email patterns
  private static suspiciousPatterns = [
    /test\d+@/i,           // test1@, test123@
    /fake\d*@/i,           // fake@, fake123@
    /dummy\d*@/i,          // dummy@, dummy1@
    /temp\d*@/i,           // temp@, temp123@
    /disposable@/i,        // disposable@
    /throwaway@/i,         // throwaway@
    /\d{8,}@/,             // 8+ consecutive digits
    /^[a-z]{1,2}\d+@/i,    // a1@, ab123@ (short + numbers)
    /^([a-z])\1{2,}/i,     // aaa@, bbb@, ccc@ (3+ repeated chars)
    /^[a-z]{1,3}\.[a-z]{1,3}@[a-z]{1,3}\./i, // aaa.bbb@ccc. (short segments)
    /^[a-z]{3}@[a-z]{3}\./i,  // aaa@bbb. (3 letter combinations)
    /asdf|qwer|zxcv|hjkl/i,   // keyboard patterns
    /sample|example|demo/i,   // sample/demo emails
    /spam|junk|trash/i,       // spam-related words
  ];

  // Analyze user registration
  static analyzeUser(userData: {
    email: string;
    ip: string;
    userAgent: string;
    referralCode?: string;
    timestamp: Date;
  }): FraudScore {
    const reasons: string[] = [];
    const warnings: string[] = [];
    let score = 0;

    // Check email
    const emailScore = this.analyzeEmail(userData.email);
    score += emailScore.score;
    reasons.push(...emailScore.reasons);

    // Check user agent for automation
    const uaScore = this.analyzeUserAgent(userData.userAgent);
    score += uaScore.score;
    if (uaScore.reasons.length > 0) {
      warnings.push(...uaScore.reasons);
    }

    return {
      score: Math.min(score, 100),
      reasons: reasons.filter(r => r.length > 0),
      warnings: warnings.filter(w => w.length > 0),
      isFraud: score >= 50 // Block on high score
    };
  }

  // Email analysis
  private static analyzeEmail(email: string): { score: number; reasons: string[] } {
    const reasons: string[] = [];
    let score = 0;

    const domain = email.split('@')[1]?.toLowerCase();
    const localPart = email.split('@')[0]?.toLowerCase();

    // Check disposable email domains (HIGH PRIORITY - BLOCKING)
    if (this.disposableDomains.includes(domain)) {
      score += 50;
      reasons.push('Disposable email domain detected');
    }

    // Check suspicious patterns (MEDIUM PRIORITY - BLOCKING)
    for (const pattern of this.suspiciousPatterns) {
      if (pattern.test(email)) {
        score += 30;
        reasons.push('Suspicious email pattern detected');
        break;
      }
    }

    // Check for extremely short local parts (e.g., a@domain.com)
    if (localPart.length <= 2) {
      score += 15;
      reasons.push('Suspicious email format');
    }

    // Check for repeated character patterns (e.g., aaa, bbb, ccc)
    if (/([a-z])\1{2,}/i.test(localPart) || /([a-z])\1{2,}/i.test(domain.split('.')[0])) {
      score += 25;
      reasons.push('Repetitive character pattern in email');
    }

    // Check for nonsensical short domain names (e.g., ccc.com, aaa.org)
    const domainName = domain.split('.')[0];
    if (domainName && domainName.length <= 3 && /^[a-z]{1,3}$/i.test(domainName)) {
      // Whitelist of legitimate short domains
      const legitimateShort = ['ibm', 'ups', 'aol', 'att', 'msn', 'hp', 'sap', 'bmw', 'fox', 'cnn', 'bbc'];
      if (!legitimateShort.includes(domainName.toLowerCase())) {
        score += 20;
        reasons.push('Suspicious domain name');
      }
    }

    // Check for patterns like "a.b@c.com" (single/double char segments)
    const localSegments = localPart.split('.');
    const allShortSegments = localSegments.every(seg => seg.length <= 2);
    if (localSegments.length > 1 && allShortSegments) {
      score += 20;
      reasons.push('Suspicious email structure');
    }

    return { score, reasons };
  }

  // User agent analysis (non-blocking, just warnings)
  private static analyzeUserAgent(userAgent: string): { score: number; reasons: string[] } {
    const reasons: string[] = [];
    let score = 0;

    if (!userAgent || userAgent.length < 10) {
      reasons.push('Missing or suspicious user agent');
    }

    // Check for common automation tools (just log, don't block)
    const automationTools = ['bot', 'crawler', 'spider', 'scraper', 'curl', 'wget', 'python-requests'];
    const lowerUA = userAgent.toLowerCase();
    
    for (const tool of automationTools) {
      if (lowerUA.includes(tool)) {
        reasons.push('Automated tool detected in user agent');
        break;
      }
    }

    return { score, reasons };
  }

  // Check if phone number should get trial (NEW)
  static async checkPhoneForTrial(phone: string | undefined): Promise<PhoneCheckResult> {
    if (!phone) {
      // No phone = allow with trial
      return {
        isAllowed: true,
        isDuplicate: false,
        existingAccounts: 0
      };
    }

    try {
      // Need to import Database here to avoid circular dependency
      const { Database } = await import('@/lib/db/connection');
      
      // Check how many accounts exist with this phone number
      const result = await Database.queryOne(
        'SELECT COUNT(*) as count FROM users WHERE phone = $1',
        [phone]
      );

      const existingAccounts = parseInt(result.count) || 0;

      return {
        isAllowed: true, // Always allow registration
        isDuplicate: existingAccounts > 0,
        existingAccounts,
        reason: existingAccounts > 0 
          ? `Phone number already used by ${existingAccounts} account(s)` 
          : undefined
      };
    } catch (error) {
      console.error('Error checking phone number:', error);
      // On error, allow with trial (fail open)
      return {
        isAllowed: true,
        isDuplicate: false,
        existingAccounts: 0
      };
    }
  }

  // Check if referral should give bonus based on phone numbers (NEW)
  static async canGiveReferralBonus(referrerId: string, refereeId: string): Promise<{
    allowed: boolean;
    reason?: string;
  }> {
    try {
      const { Database } = await import('@/lib/db/connection');
      
      // Get phone numbers for both users
      const users = await Database.queryMany(
        'SELECT id, phone FROM users WHERE id = ANY($1::uuid[])',
        [[referrerId, refereeId]]
      );

      const referrer = users.find(u => u.id === referrerId);
      const referee = users.find(u => u.id === refereeId);

      // If either has no phone, allow bonus
      if (!referrer?.phone || !referee?.phone) {
        return { allowed: true };
      }

      // If phones match, block bonus
      if (referrer.phone === referee.phone) {
        return {
          allowed: false,
          reason: 'Referrer and referee have the same phone number'
        };
      }

      return { allowed: true };
    } catch (error) {
      console.error('Error checking referral phone numbers:', error);
      // On error, allow bonus (fail open)
      return { allowed: true };
    }
  }

  // Get fraud prevention recommendations
  static getFraudPreventionRecommendations(score: number): string[] {
    const recommendations: string[] = [];

    if (score >= 50) {
      recommendations.push('Block this registration');
      recommendations.push('High fraud risk detected');
    } else if (score >= 30) {
      recommendations.push('Allow with monitoring');
      recommendations.push('Medium fraud risk');
    } else {
      recommendations.push('Allow registration');
      recommendations.push('Low fraud risk');
    }

    return recommendations;
  }

  // Additional helper: Check for rapid account creation from same IP
  static async checkIPRateLimit(ip: string): Promise<{
    limited: boolean;
    recentAccounts: number;
    reason?: string;
  }> {
    try {
      const { Database } = await import('@/lib/db/connection');
      
      // Check accounts created from this IP in the last hour
      const result = await Database.queryOne(`
        SELECT COUNT(*) as count 
        FROM users 
        WHERE created_at > NOW() - INTERVAL '1 hour'
        AND id IN (
          SELECT user_id FROM user_analytics 
          WHERE last_ip = $1
        )
      `, [ip]);

      const recentAccounts = parseInt(result.count) || 0;

      // Allow up to 3 accounts per hour from same IP
      if (recentAccounts >= 3) {
        return {
          limited: true,
          recentAccounts,
          reason: 'Too many accounts created from this IP address'
        };
      }

      return {
        limited: false,
        recentAccounts
      };
    } catch (error) {
      console.error('Error checking IP rate limit:', error);
      // On error, don't limit (fail open)
      return {
        limited: false,
        recentAccounts: 0
      };
    }
  }

  // MX Record Validation - Verify domain can receive emails
  static async validateEmailDomain(email: string): Promise<EmailValidationResult> {
    try {
      const domain = email.split('@')[1]?.toLowerCase();
      
      if (!domain) {
        return {
          isValid: false,
          hasMxRecords: false,
          error: 'Invalid email format'
        };
      }

      // Try to resolve MX records for the domain
      try {
        const addresses = await resolveMx(domain);
        
        if (!addresses || addresses.length === 0) {
          return {
            isValid: false,
            hasMxRecords: false,
            error: 'Domain cannot receive emails (no MX records)'
          };
        }

        // Domain has valid MX records
        return {
          isValid: true,
          hasMxRecords: true
        };
      } catch (dnsError: any) {
        // DNS lookup failed - domain doesn't exist or has no MX records
        if (dnsError.code === 'ENOTFOUND' || dnsError.code === 'ENODATA') {
          return {
            isValid: false,
            hasMxRecords: false,
            error: 'Domain does not exist or cannot receive emails'
          };
        }

        // Other DNS errors - fail open (allow the email)
        console.warn('DNS lookup warning for', domain, ':', dnsError.message);
        return {
          isValid: true,
          hasMxRecords: false,
          error: 'Could not verify domain (allowed by default)'
        };
      }
    } catch (error) {
      console.error('Error validating email domain:', error);
      // On unexpected error, fail open (allow the email)
      return {
        isValid: true,
        hasMxRecords: false,
        error: 'Validation error (allowed by default)'
      };
    }
  }
}