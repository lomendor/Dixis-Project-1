<?php

namespace App\Traits;

use App\Models\Tenant;
use App\Http\Middleware\TenantMiddleware;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Builder;

trait BelongsToTenant
{
    /**
     * Boot the trait
     */
    protected static function bootBelongsToTenant()
    {
        // Automatically set tenant_id when creating
        static::creating(function ($model) {
            if (!$model->tenant_id && has_tenant_context()) {
                $model->tenant_id = current_tenant()->id;
            }
        });

        // Automatically scope queries to current tenant
        static::addGlobalScope('tenant', function (Builder $builder) {
            if (has_tenant_context()) {
                $builder->where($builder->getModel()->getTable() . '.tenant_id', current_tenant()->id);
            }
        });
    }

    /**
     * Get the tenant that owns this model
     */
    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    /**
     * Scope query to specific tenant
     */
    public function scopeForTenant(Builder $query, Tenant $tenant): Builder
    {
        return $query->where('tenant_id', $tenant->id);
    }

    /**
     * Scope query to current tenant
     */
    public function scopeForCurrentTenant(Builder $query): Builder
    {
        if (has_tenant_context()) {
            return $query->where('tenant_id', current_tenant()->id);
        }
        
        return $query;
    }

    /**
     * Scope query without tenant filtering (admin access)
     */
    public function scopeWithoutTenantScope(Builder $query): Builder
    {
        return $query->withoutGlobalScope('tenant');
    }

    /**
     * Check if model belongs to current tenant
     */
    public function belongsToCurrentTenant(): bool
    {
        if (!has_tenant_context()) {
            return true; // No tenant context, allow access
        }
        
        return $this->tenant_id === current_tenant()->id;
    }

    /**
     * Check if model belongs to specific tenant
     */
    public function belongsToTenant(Tenant $tenant): bool
    {
        return $this->tenant_id === $tenant->id;
    }

    /**
     * Get tenant ID attribute
     */
    public function getTenantIdAttribute($value)
    {
        return $value;
    }

    /**
     * Set tenant ID attribute
     */
    public function setTenantIdAttribute($value)
    {
        $this->attributes['tenant_id'] = $value;
    }

    /**
     * Ensure tenant_id is in fillable array
     */
    public function initializeBelongsToTenant()
    {
        if (!in_array('tenant_id', $this->fillable)) {
            $this->fillable[] = 'tenant_id';
        }
    }
}
