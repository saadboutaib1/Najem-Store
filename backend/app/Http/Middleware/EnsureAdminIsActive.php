<?php

namespace App\Http\Middleware;

use App\Models\Admin;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureAdminIsActive
{
    public function handle(Request $request, Closure $next): Response
    {
        $admin = $request->user();

        if (!$admin instanceof Admin) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated.',
            ], 401);
        }

        if (!$admin->isActive()) {
            return response()->json([
                'success' => false,
                'message' => 'Admin account is inactive.',
            ], 403);
        }

        return $next($request);
    }
}
