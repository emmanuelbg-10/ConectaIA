<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request)
    {
        $user = $request->user();
    
        $friends = collect();
    
        if ($user) {
            $friends = \App\Models\User::whereIn('id', function($query) use ($user) {
                    $query->select('receiver_id')
                        ->from('friendships')
                        ->where('sender_id', $user->id)
                        ->where('status', 'accepted');
                })
                ->orWhereIn('id', function($query) use ($user) {
                    $query->select('sender_id')
                        ->from('friendships')
                        ->where('receiver_id', $user->id)
                        ->where('status', 'accepted');
                })
                ->get(['id', 'name', 'avatarURL']);
        }
    
        return array_merge(parent::share($request), [
            'auth'    => ['user' => $user],
            'friends' => $friends,
        ]);
    }
    
}