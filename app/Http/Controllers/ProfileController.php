<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Class related to the profile of a user.
 * 
 * This controller handles the editing, updating and deletion of a user's
 * account. It uses Inertia.js for the rendering in the frontend, and Spatie's
 * Laravel Permission package for role management.
 */
class ProfileController extends Controller
{
    /**
     * Display the user's profile form.
     * 
     * Retrieves a user's info and displays it using Inertia.js, 
     * so that the user is presented with a page showing only their information.
     * 
     * @param \Illuminate\Http\Request $request
     * The incoming HTTP request.
     * 
     * @return \Inertia\Response
     * Returns an Inertia response, rendering the 'Profile/Edit' view with
     * that user's specific data.
     */
    public function edit(Request $request): Response
    {
        return Inertia::render('Settings/Edit', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => session('status'),
        ]);
    }

    /**
     * Update the user's profile information.
     * 
     * Validates the incoming data, and then updates the user's information.
     * 
     * @param \App\Http\Requests\ProfileUpdateRequest $request
     * The HTTP request for validating the new user's data.
     * 
     * @return \Illuminate\Http\RedirectResponse
     * Redirects to the 'profile.edit' page to show the new data.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $request->user()->fill($request->validated());

        if ($request->user()->isDirty('email')) {
            $request->user()->email_verified_at = null;
        }

        $request->user()->save();

        return Redirect::route('settings.edit');
    }

    /**
     * Delete the user's account.
     * 
     * This method allows a user to delete their account. For security reasons,
     * it requests their password and the logs them out before deleting then to
     * invalidate their token in the database, just so that it cannot be used without
     * the account.
     * 
     * @param \Illuminate\Http\Request $request
     * The HTTP request.
     * 
     * @return \Illuminate\Http\RedirectResponse
     * Returns the user to the root directory, which in this case is the login/register
     * page.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return Redirect::to('/');
    }
}
