<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rules\Password as PasswordRule; // Renamed alias
use Illuminate\Validation\Rule;
use App\Models\User;
use Illuminate\Foundation\Auth\EmailVerificationRequest;
use Illuminate\Auth\Events\Verified;
use Illuminate\Support\Facades\Password; // Added for password reset
use Illuminate\Auth\Events\PasswordReset; // Added for password reset event

class AuthController extends Controller
{
    /**
     * @OA\Post(
     *     path="/api/v1/register",
     *     operationId="register",
     *     tags={"Authentication"},
     *     summary="Register a new user",
     *     description="Register a new user account as consumer, producer, or business user",
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"name","email","password","password_confirmation","role"},
     *             @OA\Property(property="name", type="string", example="John Doe"),
     *             @OA\Property(property="email", type="string", format="email", example="john@example.com"),
     *             @OA\Property(property="password", type="string", format="password", example="password123"),
     *             @OA\Property(property="password_confirmation", type="string", format="password", example="password123"),
     *             @OA\Property(property="phone", type="string", example="+302101234567", nullable=true),
     *             @OA\Property(property="role", type="string", enum={"consumer", "producer", "business_user"}, example="consumer"),
     *             @OA\Property(property="business_name", type="string", example="My Farm", description="Required for producer role"),
     *             @OA\Property(property="tax_id", type="string", example="123456789", description="Required for producer role"),
     *             @OA\Property(property="address", type="string", example="123 Farm Road", description="Required for producer role"),
     *             @OA\Property(property="city", type="string", example="Athens", description="Required for producer role"),
     *             @OA\Property(property="region", type="string", example="Attica", description="Required for producer role"),
     *             @OA\Property(property="postal_code", type="string", example="10001", description="Required for producer role")
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="User registered successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Ο χρήστης δημιουργήθηκε επιτυχώς"),
     *             @OA\Property(property="user", ref="#/components/schemas/User"),
     *             @OA\Property(property="token", type="string", example="1|abcd1234...")
     *         )
     *     ),
     *     @OA\Response(
     *         response=422,
     *         description="Validation errors",
     *         @OA\JsonContent(ref="#/components/schemas/ValidationError")
     *     )
     * )
     */
    public function register(Request $request)
    {
        $validatedData = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => ['required', 'confirmed', PasswordRule::defaults()], // Use alias
            'phone' => 'nullable|string|max:20',
            'role' => ['required', Rule::in(['consumer', 'producer', 'business_user'])], // Allow consumer, producer, or business_user registration via API
        ]);

        $user = User::create([
            'name' => $validatedData['name'],
            'email' => $validatedData['email'],
            'password' => Hash::make($validatedData['password']),
            'phone' => $validatedData['phone'] ?? null,
            'role' => $validatedData['role'], // Keep the role column for backward compatibility
        ]);

        // Assign the appropriate role using Spatie Permission
        $user->assignRole($validatedData['role']);

        // Create Producer profile if role is producer
        if ($user->role === 'producer') {
            // Create a basic producer profile, marking it as unverified.
            // The producer will need to fill in details later.
            $user->producer()->create([
                'business_name' => $user->name . ' (Pending)', // Default name, producer should update
                'verified' => false,
                // Add other default fields if necessary, ensuring they match the model's fillable properties
            ]);
        }

        // Create Business profile if role is business_user
        if ($user->role === 'business_user') {
            // Create a basic business profile, marking it as unverified.
            // The business will need to fill in details later.
            $user->business()->create([
                'business_name' => $user->name . ' (Pending)', // Default name, business should update
                'verified' => false,
                // Add other default fields if necessary, ensuring they match the model's fillable properties
            ]);
        }

        // Send verification email
        $user->sendEmailVerificationNotification(); // Requires User model to use MustVerifyEmail contract/trait

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'token' => $token,
            'access_token' => $token, // Keep for backward compatibility
            'token_type' => 'Bearer',
            'user' => $user
        ], 201);
    }

    /**
     * @OA\Post(
     *     path="/api/v1/login",
     *     operationId="login",
     *     tags={"Authentication"},
     *     summary="Authenticate user",
     *     description="Login with email and password to get authentication token",
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"email","password"},
     *             @OA\Property(property="email", type="string", format="email", example="john@example.com"),
     *             @OA\Property(property="password", type="string", format="password", example="password123"),
     *             @OA\Property(property="remember", type="boolean", example=false, description="Remember login session")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Login successful",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Συνδεθήκατε επιτυχώς"),
     *             @OA\Property(property="user", ref="#/components/schemas/User"),
     *             @OA\Property(property="token", type="string", example="2|xyz9876..."),
     *             @OA\Property(property="token_type", type="string", example="Bearer")
     *         )
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Invalid credentials",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Τα στοιχεία σύνδεσης δεν είναι σωστά")
     *         )
     *     ),
     *     @OA\Response(
     *         response=422,
     *         description="Validation errors",
     *         @OA\JsonContent(ref="#/components/schemas/ValidationError")
     *     )
     * )
     */
    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => 'required|string|email',
            'password' => 'required|string',
        ]);

        if (!Auth::attempt($credentials)) {
            return response()->json(['message' => 'Invalid login credentials'], 401);
        }

        // Get the authenticated user instance
        $user = Auth::user();

        // Revoke old tokens before creating a new one (optional, good practice)
        // $user->tokens()->delete();
        $token = $user->createToken('auth_token')->plainTextToken;

        // Get user's roles and permissions
        $roles = $user->getRoleNames();
        $permissions = $user->getAllPermissions()->pluck('name');

        // Create a user object with roles and permissions
        $userData = $user->toArray();
        $userData['roles'] = $roles;
        $userData['permissions'] = $permissions;

        // Add the primary role for frontend compatibility
        $userData['role'] = $roles->first() ?? 'consumer'; // Default to consumer if no role is assigned

        // --- Debugging Log Added (Final Check) ---
        \Illuminate\Support\Facades\Log::debug('User object just before returning JSON in login:', ['user_data' => $userData]);
        // --- End Debugging Log ---

        return response()->json([
            'token' => $token,
            'access_token' => $token, // Keep for backward compatibility
            'token_type' => 'Bearer',
            'user' => $userData
        ]);
    }

    /**
     * Get the authenticated user's profile.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getProfile(Request $request)
    {
        $user = $request->user();

        // Get user's roles and permissions
        $roles = $user->getRoleNames();
        $permissions = $user->getAllPermissions()->pluck('name');

        // Create a user object with roles and permissions
        $userData = $user->toArray();
        $userData['roles'] = $roles;
        $userData['permissions'] = $permissions;
        $userData['role'] = $roles->first() ?? 'consumer';

        return response()->json($userData);
    }

    /**
     * Log the user out (Invalidate the token).
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function logout(Request $request)
    {
        // Check if the token is a TransientToken (used in tests)
        if ($request->user()->currentAccessToken() && method_exists($request->user()->currentAccessToken(), 'delete')) {
            $request->user()->currentAccessToken()->delete();
        }

        return response()->json(['message' => 'Successfully logged out']);
    }

    /**
     * Mark the authenticated user's email address as verified.
     *
     * @param  \Illuminate\Foundation\Auth\EmailVerificationRequest  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function verify(EmailVerificationRequest $request)
    {
        if ($request->user()->hasVerifiedEmail()) {
            // Consider redirecting to frontend or returning a specific status/message
            return response()->json(['message' => 'Email already verified.'], 200);
        }

        if ($request->user()->markEmailAsVerified()) {
            event(new Verified($request->user()));
        }

        // Consider redirecting to frontend or returning a specific status/message
        return response()->json(['message' => 'Email successfully verified.'], 200);
    }

    /**
     * Resend the email verification notification.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function resend(Request $request)
    {
        if ($request->user()->hasVerifiedEmail()) {
            return response()->json(['message' => 'Email already verified.'], 400); // Bad request if already verified
        }

        $request->user()->sendEmailVerificationNotification();

        return response()->json(['message' => 'Verification link sent!']);
    }

    /**
     * Handle a forgot password request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function forgotPassword(Request $request)
    {
        $request->validate(['email' => 'required|email']);

        // Send the password reset link
        $status = Password::sendResetLink($request->only('email'));

        return $status == Password::RESET_LINK_SENT
                    ? response()->json(['message' => 'Password reset link sent.'], 200)
                    : response()->json(['message' => 'Unable to send password reset link. Check email address.'], 400); // Or handle specific errors like user not found
    }

    /**
     * Handle a reset password request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function resetPassword(Request $request)
    {
        $request->validate([
            'token' => 'required',
            'email' => 'required|email',
            'password' => ['required', 'confirmed', PasswordRule::defaults()],
        ]);

        // Attempt to reset the password
        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function ($user, $password) {
                $user->forceFill([
                    'password' => Hash::make($password)
                ])->save();

                event(new PasswordReset($user));
            }
        );

        // Return the response based on the status
        return $status == Password::PASSWORD_RESET
                    ? response()->json(['message' => 'Password successfully reset.'], 200)
                    : response()->json(['message' => 'Password reset failed. Invalid token or email.'], 400); // Or handle specific errors
    }
}
