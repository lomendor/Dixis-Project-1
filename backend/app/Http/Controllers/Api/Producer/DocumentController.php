<?php

namespace App\Http\Controllers\Api\Producer;

use App\Http\Controllers\Controller;
use App\Models\ProducerDocument;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;

class DocumentController extends Controller
{
    /**
     * Display a listing of producer documents
     *
     * @return JsonResponse
     */
    public function index(): JsonResponse
    {
        $producer = auth()->user()->producer;
        
        if (!$producer) {
            return response()->json(['message' => 'Δεν βρέθηκε ο παραγωγός'], 404);
        }

        $documents = ProducerDocument::where('producer_id', $producer->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($documents);
    }

    /**
     * Store a newly created document
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function store(Request $request): JsonResponse
    {
        $producer = auth()->user()->producer;
        
        if (!$producer) {
            return response()->json(['message' => 'Δεν βρέθηκε ο παραγωγός'], 404);
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'type' => 'required|in:certificate,license,permit,invoice,contract,other',
            'document' => 'required|file|mimes:pdf,doc,docx,jpg,jpeg,png|max:10240', // 10MB max
            'expiry_date' => 'nullable|date|after:today',
            'is_public' => 'boolean'
        ]);

        // Store document file
        $path = $request->file('document')->store('producers/documents/' . $producer->id, 'private');
        
        // Get file details
        $file = $request->file('document');
        $originalName = $file->getClientOriginalName();
        $mimeType = $file->getMimeType();
        $size = $file->getSize();

        // Create document record
        $document = ProducerDocument::create([
            'producer_id' => $producer->id,
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'type' => $validated['type'],
            'file_path' => $path,
            'file_name' => $originalName,
            'file_type' => $mimeType,
            'file_size' => $size,
            'expiry_date' => $validated['expiry_date'] ?? null,
            'is_public' => $validated['is_public'] ?? false,
            'uploaded_by' => auth()->id()
        ]);

        return response()->json([
            'message' => 'Το έγγραφο ανέβηκε επιτυχώς',
            'document' => $document
        ], 201);
    }

    /**
     * Display the specified document
     *
     * @param int $id
     * @return JsonResponse
     */
    public function show(int $id): JsonResponse
    {
        $producer = auth()->user()->producer;
        
        if (!$producer) {
            return response()->json(['message' => 'Δεν βρέθηκε ο παραγωγός'], 404);
        }

        $document = ProducerDocument::where('producer_id', $producer->id)
            ->where('id', $id)
            ->firstOrFail();

        return response()->json($document);
    }

    /**
     * Download document file
     *
     * @param int $id
     * @return \Symfony\Component\HttpFoundation\BinaryFileResponse
     */
    public function download(int $id)
    {
        $producer = auth()->user()->producer;
        
        if (!$producer) {
            return response()->json(['message' => 'Δεν βρέθηκε ο παραγωγός'], 404);
        }

        $document = ProducerDocument::where('producer_id', $producer->id)
            ->where('id', $id)
            ->firstOrFail();

        $path = Storage::disk('private')->path($document->file_path);

        if (!file_exists($path)) {
            return response()->json(['message' => 'Το αρχείο δεν βρέθηκε'], 404);
        }

        return response()->download($path, $document->file_name);
    }

    /**
     * Update the specified document
     *
     * @param Request $request
     * @param int $id
     * @return JsonResponse
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $producer = auth()->user()->producer;
        
        if (!$producer) {
            return response()->json(['message' => 'Δεν βρέθηκε ο παραγωγός'], 404);
        }

        $document = ProducerDocument::where('producer_id', $producer->id)
            ->where('id', $id)
            ->firstOrFail();

        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'type' => 'sometimes|required|in:certificate,license,permit,invoice,contract,other',
            'expiry_date' => 'nullable|date|after:today',
            'is_public' => 'boolean'
        ]);

        $document->update($validated);

        return response()->json([
            'message' => 'Το έγγραφο ενημερώθηκε επιτυχώς',
            'document' => $document
        ]);
    }

    /**
     * Remove the specified document
     *
     * @param int $id
     * @return JsonResponse
     */
    public function destroy(int $id): JsonResponse
    {
        $producer = auth()->user()->producer;
        
        if (!$producer) {
            return response()->json(['message' => 'Δεν βρέθηκε ο παραγωγός'], 404);
        }

        $document = ProducerDocument::where('producer_id', $producer->id)
            ->where('id', $id)
            ->firstOrFail();

        // Delete file from storage
        if (Storage::disk('private')->exists($document->file_path)) {
            Storage::disk('private')->delete($document->file_path);
        }

        // Delete database record
        $document->delete();

        return response()->json([
            'message' => 'Το έγγραφο διαγράφηκε επιτυχώς'
        ]);
    }

    /**
     * Get document statistics
     *
     * @return JsonResponse
     */
    public function statistics(): JsonResponse
    {
        $producer = auth()->user()->producer;
        
        if (!$producer) {
            return response()->json(['message' => 'Δεν βρέθηκε ο παραγωγός'], 404);
        }

        $stats = [
            'total_documents' => ProducerDocument::where('producer_id', $producer->id)->count(),
            'by_type' => ProducerDocument::where('producer_id', $producer->id)
                ->selectRaw('type, count(*) as count')
                ->groupBy('type')
                ->pluck('count', 'type'),
            'expiring_soon' => ProducerDocument::where('producer_id', $producer->id)
                ->whereNotNull('expiry_date')
                ->whereBetween('expiry_date', [now(), now()->addDays(30)])
                ->count(),
            'expired' => ProducerDocument::where('producer_id', $producer->id)
                ->whereNotNull('expiry_date')
                ->where('expiry_date', '<', now())
                ->count(),
            'total_size' => ProducerDocument::where('producer_id', $producer->id)
                ->sum('file_size')
        ];

        return response()->json($stats);
    }
}