<?php

namespace App\Http\Controllers\Central;

use App\Http\Controllers\Controller;
use App\Models\Central\RegistrationRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class RegistrationRequestController extends Controller
{
    private function authorizeSuperAdmin(): void
    {
        if (! Auth::guard('central')->user()?->isSuperAdmin()) {
            abort(403, 'Only super admins can manage registration requests.');
        }
    }

    public function index(Request $request)
    {
        $this->authorizeSuperAdmin();

        $query = RegistrationRequest::with('plan:id,name')->latest();

        if ($status = $request->get('status')) {
            $query->where('status', $status);
        }

        if ($search = $request->get('q')) {
            $query->where(function ($q) use ($search) {
                $q->where('library_name', 'like', "%{$search}%")
                  ->orWhere('contact_name', 'like', "%{$search}%")
                  ->orWhere('contact_email', 'like', "%{$search}%")
                  ->orWhere('telegram', 'like', "%{$search}%");
            });
        }

        return Inertia::render('Central/RegistrationRequests/Index', [
            'requests' => $query->paginate(25)->withQueryString(),
            'filters'  => $request->only(['q', 'status']),
            'counts'   => [
                'pending' => RegistrationRequest::where('status', RegistrationRequest::STATUS_PENDING)->count(),
            ],
        ]);
    }

    public function show(string $id)
    {
        $this->authorizeSuperAdmin();

        $req = RegistrationRequest::with('plan:id,name,price_usd', 'reviewedBy:id,name')->findOrFail($id);

        return Inertia::render('Central/RegistrationRequests/Show', [
            'request' => $req,
        ]);
    }

    public function updateStatus(Request $request, string $id)
    {
        $this->authorizeSuperAdmin();

        $validated = $request->validate([
            'status'      => ['required', 'in:pending,reviewed,approved,rejected'],
            'admin_notes' => ['nullable', 'string', 'max:2000'],
        ]);

        $req = RegistrationRequest::findOrFail($id);
        $req->update([
            'status'         => $validated['status'],
            'admin_notes'    => $validated['admin_notes'] ?? $req->admin_notes,
            'reviewed_by_id' => Auth::guard('central')->id(),
            'reviewed_at'    => now(),
        ]);

        return back()->with('success', 'Request updated.');
    }

    public function destroy(string $id)
    {
        $this->authorizeSuperAdmin();

        RegistrationRequest::findOrFail($id)->delete();

        return redirect()
            ->route('central.registration-requests.index')
            ->with('success', 'Request deleted.');
    }
}
