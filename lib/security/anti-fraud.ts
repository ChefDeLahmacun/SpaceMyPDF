// Simple Anti-Fraud Detection - ONLY catch obvious fake emails
// No complex analysis, just disposable email blocking

export interface FraudScore {
  score: number; // 0-100 (higher = more suspicious)
  reasons: string[];
  isFraud: boolean;
}

export class AntiFraudService {
  // Disposable email domains (common ones)
  private static disposableDomains = [
    '10minutemail.com', 'tempmail.org', 'guerrillamail.com',
    'mailinator.com', 'throwaway.email', 'temp-mail.org',
    'getnada.com', 'maildrop.cc', 'yopmail.com', 'sharklasers.com',
    'guerrillamail.biz', 'guerrillamail.de', 'guerrillamail.info',
    'guerrillamail.net', 'guerrillamail.org', 'pokemail.net',
    'spam4.me', 'bccto.me', 'chacuo.net', 'dispostable.com',
    'mailnesia.com', 'meltmail.com', 'mohmal.com', 'mytrashmail.com',
    'nada.email', 'nada.ltd', 'nada.pro', 'bdnets.com'
  ];

  // Analyze user registration - ONLY check for disposable emails
  static analyzeUser(userData: {
    email: string;
    ip: string;
    userAgent: string;
    referralCode?: string;
    timestamp: Date;
  }): FraudScore {
    const reasons: string[] = [];
    let score = 0;

    // ONLY check for obvious fake emails - nothing else
    const emailScore = this.analyzeEmail(userData.email);
    score += emailScore.score;
    reasons.push(...emailScore.reasons);

    return {
      score: Math.min(score, 100),
      reasons: reasons.filter(r => r.length > 0),
      isFraud: score >= 50 // Only block obvious fake emails
    };
  }

  // Email analysis - ONLY catch obvious fake emails
  private static analyzeEmail(email: string): { score: number; reasons: string[] } {
    const reasons: string[] = [];
    let score = 0;

    const domain = email.split('@')[1]?.toLowerCase();

    // ONLY block known disposable email domains
    if (this.disposableDomains.includes(domain)) {
      score += 50; // High score for disposable emails
      reasons.push('Disposable email domain detected');
    }

    // That's it! Only check for disposable emails
    return { score, reasons };
  }

  // Get fraud prevention recommendations
  static getFraudPreventionRecommendations(score: number): string[] {
    const recommendations: string[] = [];

    if (score >= 50) {
      recommendations.push('Block this registration');
      recommendations.push('Disposable email detected');
    } else {
      recommendations.push('Allow registration');
      recommendations.push('Standard verification');
    }

    return recommendations;
  }
}