<?php
return [
  'cloud_url' => env('CLOUDINARY_URL'), // si quieres seguir usando la URL
  'cloud' => [
      'cloud_name' => env('CLOUDINARY_CLOUD_NAME'),
      'api_key'    => env('CLOUDINARY_API_KEY'),
      'api_secret' => env('CLOUDINARY_API_SECRET'),
  ],
];
