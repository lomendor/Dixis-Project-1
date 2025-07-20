<?php

namespace App\Models\Security;

use App\Models\User;
use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class ApiKey extends Model
{
    use HasFactory, BelongsToTenant;

    protected $fillable = [
        'tenant_id',
        'user_id',
        'name',
        'key_hash',
        'permissions',
        'is_active',
        'rate_limit_per_minute',
        'rate_limit_per_hour',
        'rate_limit_per_day',
        'expires_at',
        'last_used_at',
        'created_by'
    ];

    protected $casts = [
        'permissions' => 'array',
        'is_active' => 'boolean',
        'rate_limit_per_minute' => 'integer',
        'rate_limit_per_hour' => 'integer',
        'rate_limit_per_day' => 'integer',
        'expires_at' => 'datetime',
        'last_used_at' => 'datetime'
    ];

    protected $hidden = [
        'key_hash'
    ];

    // Default permissions
    const PERMISSION_READ = 'read';
    const PERMISSION_WRITE = 'write';
    const PERMISSION_DELETE = 'delete';
    const PERMISSION_ADMIN = 'admin';

    // Permission groups
    const PERMISSION_GROUPS = [
        'basic' => [self::PERMISSION_READ],
        'standard' => [self::PERMISSION_READ, self::PERMISSION_WRITE],
        'full' => [self::PERMISSION_READ, self::PERMISSION_WRITE, self::PERMISSION_DELETE],
        'admin' => [self::PERMISSION_READ, self::PERMISSION_WRITE, self::PERMISSION_DELETE, self::PERMISSION_ADMIN]
    ];

    /**
     * Get the user that owns the API key
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the usage logs for this API key
     */
    public function usageLogs(): HasMany
    {
        return $this->hasMany(ApiKeyUsageLog::class);
    }

    /**
     * Generate a new API key
     */
    public static function generateKey(): string
    {
        return 'dixis_' . Str::random(40);
    }

    /**
     * Create a new API key
     */
    public static function createKey(array $data): array
    {
        $key = self::generateKey();
        $keyHash = hash('sha256', $key);

        $apiKey = self::create([
            'user_id' => $data['user_id'],
            'name' => $data['name'],
            'key_hash' => $keyHash,
            'permissions' => $data['permissions'] ?? ['read'],
            'is_active' => $data['is_active'] ?? true,
            'rate_limit_per_minute' => $data['rate_limit_per_minute'] ?? 60,
            'rate_limit_per_hour' => $data['rate_limit_per_hour'] ?? 1000,
            'rate_limit_per_day' => $data['rate_limit_per_day'] ?? 10000,
            'expires_at' => $data['expires_at'] ?? null,
            'created_by' => auth()->id()
        ]);

        return [
            'api_key' => $apiKey,
            'key' => $key // Only returned once during creation
        ];
    }

    /**
     * Check if API key has permission
     */
    public function hasPermission(string $permission): bool
    {
        if (!$this->is_active) {
            return false;
        }

        if ($this->expires_at && $this->expires_at->isPast()) {
            return false;
        }

        return in_array($permission, $this->permissions ?? []);
    }

    /**
     * Check if API key has any of the given permissions
     */
    public function hasAnyPermission(array $permissions): bool
    {
        foreach ($permissions as $permission) {
            if ($this->hasPermission($permission)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Check if API key has all of the given permissions
     */
    public function hasAllPermissions(array $permissions): bool
    {
        foreach ($permissions as $permission) {
            if (!$this->hasPermission($permission)) {
                return false;
            }
        }

        return true;
    }

    /**
     * Update last used timestamp
     */
    public function updateLastUsed(): void
    {
        $this->update(['last_used_at' => now()]);
    }

    /**
     * Deactivate API key
     */
    public function deactivate(): void
    {
        $this->update(['is_active' => false]);
    }

    /**
     * Activate API key
     */
    public function activate(): void
    {
        $this->update(['is_active' => true]);
    }

    /**
     * Check if API key is expired
     */
    public function isExpired(): bool
    {
        return $this->expires_at && $this->expires_at->isPast();
    }

    /**
     * Get usage statistics for this API key
     */
    public function getUsageStats(int $days = 30): array
    {
        $startDate = now()->subDays($days);

        return [
            'total_requests' => $this->usageLogs()
                ->where('created_at', '>=', $startDate)
                ->count(),
            'requests_by_day' => $this->usageLogs()
                ->where('created_at', '>=', $startDate)
                ->selectRaw('DATE(created_at) as date, COUNT(*) as count')
                ->groupBy('date')
                ->orderBy('date')
                ->get()
                ->pluck('count', 'date'),
            'requests_by_endpoint' => $this->usageLogs()
                ->where('created_at', '>=', $startDate)
                ->selectRaw('endpoint, COUNT(*) as count')
                ->groupBy('endpoint')
                ->orderByDesc('count')
                ->limit(10)
                ->get()
                ->pluck('count', 'endpoint'),
            'error_rate' => $this->usageLogs()
                ->where('created_at', '>=', $startDate)
                ->selectRaw('
                    COUNT(*) as total,
                    SUM(CASE WHEN status_code >= 400 THEN 1 ELSE 0 END) as errors
                ')
                ->first()
        ];
    }

    /**
     * Scope for active keys
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true)
                    ->where(function ($q) {
                        $q->whereNull('expires_at')
                          ->orWhere('expires_at', '>', now());
                    });
    }

    /**
     * Scope for expired keys
     */
    public function scopeExpired($query)
    {
        return $query->where('expires_at', '<=', now());
    }

    /**
     * Get permissions in Greek
     */
    public function getPermissionsInGreekAttribute(): array
    {
        $greekPermissions = [
            self::PERMISSION_READ => 'Ανάγνωση',
            self::PERMISSION_WRITE => 'Εγγραφή',
            self::PERMISSION_DELETE => 'Διαγραφή',
            self::PERMISSION_ADMIN => 'Διαχείριση'
        ];

        return array_map(function($permission) use ($greekPermissions) {
            return $greekPermissions[$permission] ?? $permission;
        }, $this->permissions ?? []);
    }

    /**
     * Boot method for model events
     */
    protected static function boot()
    {
        parent::boot();
        
        static::creating(function ($apiKey) {
            if (!$apiKey->rate_limit_per_minute) {
                $apiKey->rate_limit_per_minute = 60;
            }
            if (!$apiKey->rate_limit_per_hour) {
                $apiKey->rate_limit_per_hour = 1000;
            }
            if (!$apiKey->rate_limit_per_day) {
                $apiKey->rate_limit_per_day = 10000;
            }
        });
    }
}