<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Setting;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Validator;

class SettingsController extends Controller
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
        $settings = $request->all();

        foreach ($settings as $key => $value) {
            $setting = Setting::where('key', $key)->first();

            if ($setting) {
                // Validate the value based on the setting type
                $validator = $this->validateSettingValue($setting, $value);

                if ($validator->fails()) {
                    return response()->json([
                        'message' => "Invalid value for setting '{$key}': " . $validator->errors()->first(),
                    ], 422);
                }

                // Update the setting
                $setting->value = $value;
                $setting->save();

                // Clear cache for this setting
                Cache::forget("setting.{$key}");
            }
        }

        return response()->json([
            'message' => 'Settings updated successfully',
            'settings' => Setting::all()->pluck('value', 'key'),
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

        // Validate the value based on the setting type
        $validator = $this->validateSettingValue((object)$validated, $validated['value']);

        if ($validator->fails()) {
            return response()->json([
                'message' => "Invalid value for setting '{$validated['key']}': " . $validator->errors()->first(),
            ], 422);
        }

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

    /**
     * Validate a setting value based on its type.
     *
     * @param object $setting
     * @param mixed $value
     * @return \Illuminate\Contracts\Validation\Validator
     */
    private function validateSettingValue($setting, $value)
    {
        $rules = [];

        switch ($setting->type) {
            case 'string':
                $rules['value'] = 'string';
                break;
            case 'integer':
                $rules['value'] = 'integer';
                break;
            case 'float':
                $rules['value'] = 'numeric';
                break;
            case 'boolean':
                $rules['value'] = 'boolean';
                break;
            case 'array':
                $rules['value'] = 'array';
                break;
            case 'json':
                $rules['value'] = 'json';
                break;
        }

        return Validator::make(['value' => $value], $rules);
    }
}
