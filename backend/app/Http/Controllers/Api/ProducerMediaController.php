<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Producer;
use App\Models\ProducerMedia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class ProducerMediaController extends Controller
{
    /**
     * Display a listing of the producer's media.
     *
     * @param int $producerId
     * @return \Illuminate\Http\JsonResponse
     */
    public function index($producerId)
    {
        $media = ProducerMedia::where('producer_id', $producerId)
            ->orderBy('order')
            ->get();
            
        return response()->json(['data' => $media]);
    }
    
    /**
     * Upload new media for a producer.
     *
     * @param Request $request
     * @param int $producerId
     * @return \Illuminate\Http\JsonResponse
     */
    public function upload(Request $request, $producerId)
    {
        $validator = Validator::make($request->all(), [
            'files' => 'required|array',
            'files.*' => 'file|mimes:jpeg,png,jpg,gif,mp4,webm,ogg|max:10240',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string'
        ]);
        
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }
        
        $producer = Producer::findOrFail($producerId);
        
        // Check if user has permission to upload for this producer
        if (auth()->user()->cannot('update', $producer)) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }
        
        $uploadedMedia = [];
        
        foreach ($request->file('files') as $file) {
            $path = $file->store('producers/' . $producerId . '/media', 'public');
            
            $type = str_starts_with($file->getMimeType(), 'video') ? 'video' : 'image';
            
            // Get the highest order number and add 1
            $order = ProducerMedia::where('producer_id', $producerId)
                ->max('order') + 1;
            
            $media = ProducerMedia::create([
                'producer_id' => $producerId,
                'type' => $type,
                'file_path' => $path,
                'title' => $request->title,
                'description' => $request->description,
                'order' => $order
            ]);
            
            $uploadedMedia[] = $media;
        }
        
        return response()->json([
            'success' => true,
            'data' => $uploadedMedia
        ]);
    }
    
    /**
     * Update a media item.
     *
     * @param Request $request
     * @param int $producerId
     * @param int $mediaId
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, $producerId, $mediaId)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'description' => 'nullable|string'
        ]);
        
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }
        
        $media = ProducerMedia::where('producer_id', $producerId)
            ->where('id', $mediaId)
            ->firstOrFail();
        
        // Check if user has permission to update this media
        if (auth()->user()->cannot('update', $media->producer)) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }
        
        $media->update([
            'title' => $request->title,
            'description' => $request->description
        ]);
        
        return response()->json([
            'success' => true,
            'data' => $media
        ]);
    }
    
    /**
     * Delete a media item.
     *
     * @param int $producerId
     * @param int $mediaId
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy($producerId, $mediaId)
    {
        $media = ProducerMedia::where('producer_id', $producerId)
            ->where('id', $mediaId)
            ->firstOrFail();
        
        // Check if user has permission to delete this media
        if (auth()->user()->cannot('update', $media->producer)) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }
        
        // Delete the file from storage
        Storage::disk('public')->delete($media->file_path);
        
        $media->delete();
        
        return response()->json([
            'success' => true,
            'message' => 'Media deleted successfully'
        ]);
    }
    
    /**
     * Reorder media items.
     *
     * @param Request $request
     * @param int $producerId
     * @return \Illuminate\Http\JsonResponse
     */
    public function reorder(Request $request, $producerId)
    {
        $validator = Validator::make($request->all(), [
            'items' => 'required|array',
            'items.*.id' => 'required|integer|exists:producer_media,id',
            'items.*.order' => 'required|integer|min:0'
        ]);
        
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }
        
        $producer = Producer::findOrFail($producerId);
        
        // Check if user has permission to reorder media for this producer
        if (auth()->user()->cannot('update', $producer)) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }
        
        foreach ($request->items as $item) {
            ProducerMedia::where('id', $item['id'])
                ->where('producer_id', $producerId)
                ->update(['order' => $item['order']]);
        }
        
        return response()->json([
            'success' => true,
            'message' => 'Media order updated successfully'
        ]);
    }
}