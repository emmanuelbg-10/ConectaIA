<?php

namespace App\Policies;

use App\Models\Response;
use App\Models\User;

/**
 * A policy for checking if a user owns a response.
 * 
 * This policy checks if a user can update or delete a
 * response in a publication by checking their ID in the database. If
 * it matches, in the frontend it will show the corresponding buttons for
 * said actions.
 */
class ResponsePolicy
{
    /**
     * The update policy.
     * 
     * This method checks if the User model owns the response to a
     * publication using the ID stored in the database, and returning
     * 'true' or 'false' if it's indeed the user or not.
     * 
     * @param \App\Models\User $user
     * The user that owns the response.
     * @param \App\Models\Response $response
     * The response model that the user owns.
     * 
     * @return boolean
     * Returns either true or false if it's the user that owns the response or not.
     */
    public function update(User $user, Response $response)
    {
        return $user->id === $response->user_id;
    }

    /**
     * The delete policy.
     * 
     * This method checks if the User model owns the response to a
     * publication using the ID stored in the database, and returning
     * 'true' or 'false' if it's indeed the user or not.
     * 
     * @param \App\Models\User $user
     * The user that owns the response.
     * @param \App\Models\Response $response
     * The response model that the user owns.
     * 
     * @return boolean
     * Returns either true or false if it's the user that owns the response or not.
     */
    public function delete(User $user, Response $response)
    {
        return $user->id === $response->user_id;
    }
}