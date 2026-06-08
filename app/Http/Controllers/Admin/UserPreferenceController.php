<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class UserPreferenceController extends Controller
{
    /**
     * Update user's preferred language
     */
    public function updateLanguage(Request $request)
    {
        $validated = $request->validate([
            'language' => ['required', 'in:en,km'],
        ]);

        $user = Auth::user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not authenticated',
            ], 401);
        }

        $user->update(['preferred_language' => $validated['language']]);

        return response()->json([
            'success' => true,
            'language' => $validated['language'],
        ]);
    }
}
