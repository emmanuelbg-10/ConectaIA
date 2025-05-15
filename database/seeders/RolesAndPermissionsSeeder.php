<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\PermissionRegistrar;

class RolesAndPermissionsSeeder extends Seeder
{
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        // Crear permisos
        Permission::create(['name' => 'crear publicaciones']);
        Permission::create(['name' => 'editar propias publicaciones']);
        Permission::create(['name' => 'editar todas las publicaciones']);
        Permission::create(['name' => 'eliminar propias publicaciones']);
        Permission::create(['name' => 'eliminar todas las publicaciones']);
        Permission::create(['name' => 'ver panel admin']);
        Permission::create(['name' => 'gestionar usuarios']);
        Permission::create(['name' => 'gestionar roles']);
        Permission::firstOrCreate(['name' => 'ver panel gestion usuarios']);
        Permission::firstOrCreate(['name' => 'editar usuarios']); // Solo admin
        Permission::firstOrCreate(['name' => 'banear usuarios']); // Admin y Moderador
        Permission::firstOrCreate(['name' => 'desbanear usuarios']); // Admin y Moderador
        // ... más permisos según tu app

        // Crear roles
        $userRole = Role::create(['name' => 'usuario']);
        $userRole->givePermissionTo([
            'crear publicaciones',
            'editar propias publicaciones',
            'eliminar propias publicaciones',
        ]);

        $moderatorRole = Role::create(['name' => 'moderador']);
            $moderatorRole->givePermissionTo([
                'crear publicaciones',
                'editar propias publicaciones',
                'eliminar propias publicaciones',
                'eliminar todas las publicaciones',
                 'ver panel gestion usuarios',
                 'banear usuarios',
                 'desbanear usuarios',
            ]);

        $adminRole = Role::create(['name' => 'administrador']);
        // Los administradores suelen tener todos los permisos
        $adminRole->givePermissionTo(Permission::all()); 


    }
}