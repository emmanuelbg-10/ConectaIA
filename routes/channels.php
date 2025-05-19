<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('chat.{userId}', function () {
    return true;
});
