<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Stancl\Tenancy\Middleware\InitializeTenancyByDomain;

class InitializeTenancy extends InitializeTenancyByDomain
{
    // Extends stancl's domain middleware.
    // Override resolveIdentifier() for subdomain extraction if needed.
}
