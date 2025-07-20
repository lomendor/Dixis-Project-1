<?php

namespace App\Services\Security;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;

class SecurityMonitoringService
{
    /**
     * Monitor and analyze security threats
     */
    public function analyzeSecurityThreats(): array
    {
        return [
            'brute_force_attempts' => $this->detectBruteForceAttempts(),
            'suspicious_ips' => $this->detectSuspiciousIPs(),
            'api_abuse' => $this->detectApiAbuse(),
            'sql_injection_attempts' => $this->detectSqlInjectionAttempts(),
            'xss_attempts' => $this->detectXssAttempts(),
            'ddos_patterns' => $this->detectDdosPatterns(),
            'security_score' => $this->calculateSecurityScore()
        ];
    }

    /**
     * Detect brute force login attempts
     */
    private function detectBruteForceAttempts(): array
    {
        $timeWindow = 3600; // 1 hour
        $threshold = 10; // 10 failed attempts
        
        $attempts = Cache::get('failed_login_attempts', []);
        $now = time();
        
        // Clean old attempts
        $attempts = array_filter($attempts, function($attempt) use ($now, $timeWindow) {
            return ($now - $attempt['timestamp']) < $timeWindow;
        });

        // Group by IP
        $ipAttempts = [];
        foreach ($attempts as $attempt) {
            $ip = $attempt['ip'];
            if (!isset($ipAttempts[$ip])) {
                $ipAttempts[$ip] = 0;
            }
            $ipAttempts[$ip]++;
        }

        // Find IPs exceeding threshold
        $suspiciousIps = array_filter($ipAttempts, function($count) use ($threshold) {
            return $count >= $threshold;
        });

        return [
            'total_attempts' => count($attempts),
            'suspicious_ips' => $suspiciousIps,
            'blocked_ips' => $this->getBlockedIps(),
            'recommendations' => $this->getBruteForceRecommendations($suspiciousIps)
        ];
    }

    /**
     * Detect suspicious IP addresses
     */
    private function detectSuspiciousIPs(): array
    {
        $suspiciousIps = [];
        $timeWindow = 3600; // 1 hour
        
        // Check for high request volume from single IPs
        $highVolumeIps = Cache::get('high_volume_ips', []);
        
        // Check for IPs with high error rates
        $highErrorIps = Cache::get('high_error_ips', []);
        
        // Check against known malicious IP databases
        $knownMaliciousIps = $this->checkMaliciousIpDatabases(array_merge(
            array_keys($highVolumeIps),
            array_keys($highErrorIps)
        ));

        return [
            'high_volume_ips' => $highVolumeIps,
            'high_error_ips' => $highErrorIps,
            'known_malicious_ips' => $knownMaliciousIps,
            'geolocation_anomalies' => $this->detectGeolocationAnomalies(),
            'recommendations' => $this->getSuspiciousIpRecommendations()
        ];
    }

    /**
     * Detect API abuse patterns
     */
    private function detectApiAbuse(): array
    {
        $apiAbuse = [];
        
        // Check for excessive API key usage
        $excessiveApiKeys = $this->findExcessiveApiKeyUsage();
        
        // Check for unusual endpoint access patterns
        $unusualPatterns = $this->detectUnusualAccessPatterns();
        
        // Check for scraping behavior
        $scrapingBehavior = $this->detectScrapingBehavior();

        return [
            'excessive_api_key_usage' => $excessiveApiKeys,
            'unusual_access_patterns' => $unusualPatterns,
            'scraping_behavior' => $scrapingBehavior,
            'rate_limit_violations' => $this->getRateLimitViolations(),
            'recommendations' => $this->getApiAbuseRecommendations()
        ];
    }

    /**
     * Detect SQL injection attempts
     */
    private function detectSqlInjectionAttempts(): array
    {
        $sqlPatterns = [
            'union\s+select',
            'drop\s+table',
            'delete\s+from',
            'insert\s+into',
            'update\s+set',
            '1=1',
            '1\s*=\s*1',
            'or\s+1\s*=\s*1',
            'and\s+1\s*=\s*1',
            'exec\s*\(',
            'script\s*>',
            'javascript:',
            'vbscript:',
            'onload\s*=',
            'onerror\s*='
        ];

        $attempts = Cache::get('sql_injection_attempts', []);
        $recentAttempts = array_filter($attempts, function($attempt) {
            return (time() - $attempt['timestamp']) < 3600; // Last hour
        });

        return [
            'total_attempts' => count($recentAttempts),
            'unique_ips' => count(array_unique(array_column($recentAttempts, 'ip'))),
            'patterns_detected' => array_count_values(array_column($recentAttempts, 'pattern')),
            'blocked_attempts' => count(array_filter($recentAttempts, function($attempt) {
                return $attempt['blocked'] ?? false;
            })),
            'recommendations' => $this->getSqlInjectionRecommendations()
        ];
    }

    /**
     * Detect XSS attempts
     */
    private function detectXssAttempts(): array
    {
        $xssPatterns = [
            '<script',
            'javascript:',
            'vbscript:',
            'onload=',
            'onerror=',
            'onclick=',
            'onmouseover=',
            'eval\(',
            'document.cookie',
            'document.write'
        ];

        $attempts = Cache::get('xss_attempts', []);
        $recentAttempts = array_filter($attempts, function($attempt) {
            return (time() - $attempt['timestamp']) < 3600; // Last hour
        });

        return [
            'total_attempts' => count($recentAttempts),
            'unique_ips' => count(array_unique(array_column($recentAttempts, 'ip'))),
            'patterns_detected' => array_count_values(array_column($recentAttempts, 'pattern')),
            'blocked_attempts' => count(array_filter($recentAttempts, function($attempt) {
                return $attempt['blocked'] ?? false;
            })),
            'recommendations' => $this->getXssRecommendations()
        ];
    }

    /**
     * Detect DDoS patterns
     */
    private function detectDdosPatterns(): array
    {
        $timeWindow = 300; // 5 minutes
        $requestThreshold = 1000; // requests per 5 minutes
        
        $requestCounts = Cache::get('request_counts_per_ip', []);
        $now = time();
        
        // Clean old data
        foreach ($requestCounts as $ip => $data) {
            $requestCounts[$ip] = array_filter($data, function($timestamp) use ($now, $timeWindow) {
                return ($now - $timestamp) < $timeWindow;
            });
            
            if (empty($requestCounts[$ip])) {
                unset($requestCounts[$ip]);
            }
        }

        // Find IPs exceeding threshold
        $ddosIps = [];
        foreach ($requestCounts as $ip => $timestamps) {
            if (count($timestamps) > $requestThreshold) {
                $ddosIps[$ip] = count($timestamps);
            }
        }

        return [
            'potential_ddos_ips' => $ddosIps,
            'total_requests_last_5min' => array_sum(array_map('count', $requestCounts)),
            'unique_ips_last_5min' => count($requestCounts),
            'average_requests_per_ip' => count($requestCounts) > 0 ? 
                array_sum(array_map('count', $requestCounts)) / count($requestCounts) : 0,
            'recommendations' => $this->getDdosRecommendations($ddosIps)
        ];
    }

    /**
     * Calculate overall security score
     */
    private function calculateSecurityScore(): array
    {
        $score = 100; // Start with perfect score
        $factors = [];

        // Deduct points for security issues
        $bruteForce = $this->detectBruteForceAttempts();
        if (count($bruteForce['suspicious_ips']) > 0) {
            $deduction = min(20, count($bruteForce['suspicious_ips']) * 5);
            $score -= $deduction;
            $factors[] = "Brute force attempts detected (-{$deduction})";
        }

        $sqlInjection = $this->detectSqlInjectionAttempts();
        if ($sqlInjection['total_attempts'] > 0) {
            $deduction = min(15, $sqlInjection['total_attempts']);
            $score -= $deduction;
            $factors[] = "SQL injection attempts (-{$deduction})";
        }

        $xss = $this->detectXssAttempts();
        if ($xss['total_attempts'] > 0) {
            $deduction = min(10, $xss['total_attempts']);
            $score -= $deduction;
            $factors[] = "XSS attempts (-{$deduction})";
        }

        $ddos = $this->detectDdosPatterns();
        if (count($ddos['potential_ddos_ips']) > 0) {
            $deduction = min(25, count($ddos['potential_ddos_ips']) * 10);
            $score -= $deduction;
            $factors[] = "Potential DDoS activity (-{$deduction})";
        }

        return [
            'score' => max(0, $score),
            'grade' => $this->getSecurityGrade($score),
            'factors' => $factors,
            'recommendations' => $this->getSecurityScoreRecommendations($score)
        ];
    }

    /**
     * Record security event
     */
    public function recordSecurityEvent(string $type, array $data): void
    {
        $event = [
            'type' => $type,
            'data' => $data,
            'timestamp' => time(),
            'ip' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'user_id' => auth()->id()
        ];

        // Store in cache for real-time monitoring
        $cacheKey = "security_events:{$type}";
        $events = Cache::get($cacheKey, []);
        $events[] = $event;
        
        // Keep only last 1000 events
        if (count($events) > 1000) {
            $events = array_slice($events, -1000);
        }
        
        Cache::put($cacheKey, $events, 3600);

        // Log for permanent storage
        Log::channel('security')->warning("Security event: {$type}", $event);
    }

    /**
     * Get security recommendations
     */
    public function getSecurityRecommendations(): array
    {
        $threats = $this->analyzeSecurityThreats();
        $recommendations = [];

        if (count($threats['brute_force_attempts']['suspicious_ips']) > 0) {
            $recommendations[] = [
                'priority' => 'high',
                'type' => 'brute_force',
                'message' => 'Block suspicious IPs attempting brute force attacks',
                'action' => 'Implement IP blocking for repeated failed login attempts'
            ];
        }

        if ($threats['sql_injection_attempts']['total_attempts'] > 0) {
            $recommendations[] = [
                'priority' => 'critical',
                'type' => 'sql_injection',
                'message' => 'SQL injection attempts detected',
                'action' => 'Review and strengthen input validation and parameterized queries'
            ];
        }

        if (count($threats['ddos_patterns']['potential_ddos_ips']) > 0) {
            $recommendations[] = [
                'priority' => 'high',
                'type' => 'ddos',
                'message' => 'Potential DDoS activity detected',
                'action' => 'Implement rate limiting and consider CDN protection'
            ];
        }

        return $recommendations;
    }

    // Helper methods for specific detection logic
    private function getBlockedIps(): array
    {
        return Cache::get('blocked_ips', []);
    }

    private function getBruteForceRecommendations(array $suspiciousIps): array
    {
        $recommendations = [];
        
        if (count($suspiciousIps) > 0) {
            $recommendations[] = 'Implement CAPTCHA after 3 failed attempts';
            $recommendations[] = 'Block IPs with more than 10 failed attempts';
            $recommendations[] = 'Enable two-factor authentication';
        }

        return $recommendations;
    }

    private function checkMaliciousIpDatabases(array $ips): array
    {
        // In production, integrate with threat intelligence APIs
        return [];
    }

    private function detectGeolocationAnomalies(): array
    {
        // Implement geolocation-based anomaly detection
        return [];
    }

    private function getSuspiciousIpRecommendations(): array
    {
        return [
            'Monitor high-volume IPs for potential abuse',
            'Implement geolocation-based access controls',
            'Use threat intelligence feeds for known malicious IPs'
        ];
    }

    private function findExcessiveApiKeyUsage(): array
    {
        return Cache::get('excessive_api_key_usage', []);
    }

    private function detectUnusualAccessPatterns(): array
    {
        return Cache::get('unusual_access_patterns', []);
    }

    private function detectScrapingBehavior(): array
    {
        return Cache::get('scraping_behavior', []);
    }

    private function getRateLimitViolations(): array
    {
        return Cache::get('rate_limit_violations', []);
    }

    private function getApiAbuseRecommendations(): array
    {
        return [
            'Implement stricter rate limiting for suspicious patterns',
            'Monitor API key usage patterns',
            'Add CAPTCHA for suspected bot traffic'
        ];
    }

    private function getSqlInjectionRecommendations(): array
    {
        return [
            'Use parameterized queries exclusively',
            'Implement input validation and sanitization',
            'Enable SQL injection detection at WAF level'
        ];
    }

    private function getXssRecommendations(): array
    {
        return [
            'Implement Content Security Policy (CSP)',
            'Sanitize all user inputs',
            'Use output encoding for dynamic content'
        ];
    }

    private function getDdosRecommendations(array $ddosIps): array
    {
        $recommendations = [];
        
        if (count($ddosIps) > 0) {
            $recommendations[] = 'Implement rate limiting at network level';
            $recommendations[] = 'Consider using a CDN with DDoS protection';
            $recommendations[] = 'Block high-volume IPs temporarily';
        }

        return $recommendations;
    }

    private function getSecurityGrade(int $score): string
    {
        if ($score >= 90) return 'A';
        if ($score >= 80) return 'B';
        if ($score >= 70) return 'C';
        if ($score >= 60) return 'D';
        return 'F';
    }

    private function getSecurityScoreRecommendations(int $score): array
    {
        if ($score < 70) {
            return [
                'Immediate action required to address security threats',
                'Review and strengthen all security measures',
                'Consider implementing additional monitoring tools'
            ];
        } elseif ($score < 85) {
            return [
                'Good security posture with room for improvement',
                'Address identified security issues',
                'Continue monitoring for new threats'
            ];
        } else {
            return [
                'Excellent security posture',
                'Maintain current security measures',
                'Continue proactive monitoring'
            ];
        }
    }
}