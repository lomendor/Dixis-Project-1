<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail; // Uncommented
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens; // Import HasApiTokens trait
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Auth\MustVerifyEmail as MustVerifyEmailTrait; // Import trait with alias
use Illuminate\Support\Facades\Log; // Ensure Log facade is imported
use Spatie\Permission\Traits\HasRoles; // Import HasRoles trait

class User extends Authenticatable implements MustVerifyEmail // Implemented interface
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, HasApiTokens, MustVerifyEmailTrait, HasRoles; // Added HasRoles trait

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'phone', // Add phone
        'role',  // Add role
        'is_active', // Add is_active
        'stripe_customer_id', // Stripe customer reference
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be appended to the model's array form.
     *
     * @var array<int, string>
     */
    // protected $appends = [
    //     'role', // Role is now directly in the table, no need to append
    // ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_active' => 'boolean',
        ];
    }

    /**
     * Get the producer profile associated with the user.
     */
    public function producer(): HasOne
    {
        return $this->hasOne(Producer::class);
    }

    /**
     * Get the business profile associated with the user.
     */
    public function business(): HasOne
    {
        return $this->hasOne(Business::class);
    }

    /**
     * Get the addresses associated with the user.
     */
    public function addresses(): HasMany
    {
        return $this->hasMany(Address::class);
    }

    /**
     * Get the orders placed by the user.
     */
    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    /**
     * Get the business profile for the user.
     */
    public function businessProfile()
    {
        return $this->hasOne(BusinessUser::class);
    }

    /**
     * Check if user has business profile
     */
    public function hasBusinessProfile(): bool
    {
        return $this->businessProfile()->exists();
    }

    /**
     * Check if user is a business user
     */
    public function isBusinessUser(): bool
    {
        return $this->hasBusinessProfile() &&
               $this->businessProfile->status === 'active' &&
               $this->businessProfile->verification_status === 'verified';
    }

    /**
     * Get the adoptions for the user.
     */
    public function adoptions(): HasMany
    {
        return $this->hasMany(Adoption::class);
    }

    /**
     * Get the active adoptions for the user.
     */
    public function activeAdoptions()
    {
        return $this->adoptions()->where('status', 'active');
    }

    // Accessor for 'role' is removed as the 'role' column exists in the database table
    // and will be returned directly.

    /**
     * Get the reviews created by the user.
     */
    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }

    /**
     * Get the wishlist items for the user.
     */
    public function wishlist(): HasMany
    {
        return $this->hasMany(Wishlist::class);
    }

    /**
     * Get the products created by the user (for producers).
     */
    public function products(): HasMany
    {
        return $this->hasMany(Product::class, 'producer_id');
    }
}
