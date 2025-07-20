<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Setting;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Validator;

class SettingController extends Controller
{
    /**
     * Get all settings.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index()
    {
        $settings = Setting::all();
        return response()->json($settings);
    }

    /**
     * Get settings by group.
     *
     * @param string $group
     * @return \Illuminate\Http\JsonResponse
     */
    public function getByGroup($group)
    {
        $settings = Setting::where('group', $group)->get();
        return response()->json($settings);
    }

    /**
     * Update settings.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request)
    {
        $settings = $request->input('settings', []);

        foreach ($settings as $setting) {
            if (!isset($setting['key']) || !isset($setting['value'])) {
                continue;
            }

            $existingSetting = Setting::where('key', $setting['key'])->first();

            if ($existingSetting) {
                // Update the setting
                $existingSetting->value = $setting['value'];
                $existingSetting->save();

                // Clear cache for this setting
                Cache::forget("setting.{$setting['key']}");
            } else {
                // Create a new setting if it doesn't exist
                Setting::create([
                    'key' => $setting['key'],
                    'value' => $setting['value'],
                    'type' => $setting['type'] ?? 'string',
                    'group' => $setting['group'] ?? 'general',
                    'description' => $setting['description'] ?? null,
                ]);
            }
        }

        return response()->json([
            'message' => 'Settings updated successfully',
            'settings' => Setting::all(),
        ]);
    }

    /**
     * Create a new setting.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'key' => 'required|string|max:255|unique:settings',
            'value' => 'required',
            'type' => 'required|string|in:string,integer,float,boolean,array,json',
            'group' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        // Create the setting
        $setting = Setting::create($validated);

        return response()->json([
            'message' => 'Setting created successfully',
            'setting' => $setting,
        ], 201);
    }

    /**
     * Delete a setting.
     *
     * @param string $key
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy($key)
    {
        $setting = Setting::where('key', $key)->first();

        if (!$setting) {
            return response()->json([
                'message' => "Setting '{$key}' not found",
            ], 404);
        }

        $setting->delete();

        // Clear cache for this setting
        Cache::forget("setting.{$key}");

        return response()->json([
            'message' => "Setting '{$key}' deleted successfully",
        ]);
    }
}
