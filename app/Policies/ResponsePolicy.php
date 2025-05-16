<?php

namespace App\Policies;

use App\Models\Response;
use App\Models\User;

class ResponsePolicy
{
    public function update(User $user, Response $response)
    {
        return $user->id === $response->user_id;
    }

    public function delete(User $user, Response $response)
    {
        return $user->id === $response->user_id;
    }
}