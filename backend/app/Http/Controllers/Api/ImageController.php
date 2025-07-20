<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class ImageController extends Controller
{
    /**
     * Display the specified image.
     *
     * @param  string  $path
     * @return \Illuminate\Http\Response
     */
    public function show($path)
    {
        // Replace hyphens with slashes to get the original path
        $path = str_replace('-', '/', $path);

        // Log the requested path for debugging
        Log::info('Image requested: ' . $path);

        // Check if the file exists in public disk
        if (Storage::disk('public')->exists($path)) {
            // Get the file content
            $file = Storage::disk('public')->get($path);

            // Get the file mime type
            $mimeType = Storage::disk('public')->mimeType($path);

            // Return the file with the appropriate mime type
            return response($file, 200)->header('Content-Type', $mimeType);
        }

        // If not found in public disk, check if it exists in local disk
        if (Storage::disk('local')->exists($path)) {
            // Get the file content
            $file = Storage::disk('local')->get($path);

            // Get the file mime type
            $mimeType = Storage::disk('local')->mimeType($path);

            // Return the file with the appropriate mime type
            return response($file, 200)->header('Content-Type', $mimeType);
        }

        // If the path doesn't include a directory, try to find it in product_images
        if (!str_contains($path, '/')) {
            $productImagesPath = 'product_images/' . $path;

            if (Storage::disk('public')->exists($productImagesPath)) {
                // Get the file content
                $file = Storage::disk('public')->get($productImagesPath);

                // Get the file mime type
                $mimeType = Storage::disk('public')->mimeType($productImagesPath);

                // Return the file with the appropriate mime type
                return response($file, 200)->header('Content-Type', $mimeType);
            }
        }

        // Log that the image was not found
        Log::warning('Image not found: ' . $path);

        // Return a placeholder image or a 404 response
        return response()->json(['message' => 'Image not found'], 404);
    }
}
