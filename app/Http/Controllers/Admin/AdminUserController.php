<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;

class AdminUserController extends Controller
{
    public function index(Request $request)
    {
        // Obtener usuarios, incluyendo los baneados (soft-deleted)
        $users = User::withTrashed()
            ->with('roles') // Cargar roles para mostrar en la tabla
            ->orderBy('name')
            ->paginate(15)
            ->withQueryString(); // Para que la paginación funcione con filtros si los añades

        return Inertia::render('Admin/Users/index', [
            'users' => $users,
            'allRoles' => Role::pluck('name')->toArray(), // Para el formulario de edición
            'authUser' => auth()->user(), // Enviar el usuario autenticado directamente
            'auth' => [ // Para pasar permisos al frontend
                'can' => [
                    'edit_users' => $request->user()->can('editar usuarios'),
                    'ban_users' => $request->user()->can('banear usuarios'),
                    'unban_users' => $request->user()->can('desbanear usuarios'),
                ]
            ]
        ]);
    }

    public function update(Request $request, User $user) // User se inyecta gracias a Route Model Binding
    {
        // Validación (puedes mover esto a un FormRequest)
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100', Rule::unique('users')->ignore($user->id)],
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'roles' => ['sometimes', 'array'],
            'roles.*' => ['string', Rule::exists('roles', 'name')], // Asegura que los roles existen
            'password' => ['nullable', 'string', 'min:8', 'confirmed'],
        ]);

        $user->name = $validated['name'];
        $user->email = $validated['email'];

        if (!empty($validated['password'])) {
            $user->password = Hash::make($validated['password']);
        }

        if ($request->has('roles')) {
             // No permitir que un admin se quite a sí mismo el rol de admin si es el único
            if ($user->id === $request->user()->id && !in_array('administrador', $validated['roles']) && $user->hasRole('administrador')) {
                $adminRole = Role::findByName('administrador');
                $adminsCount = User::role($adminRole)->count();
                if ($adminsCount <= 1) {
                    return Redirect::back()->with('error', 'No puedes quitar el único rol de administrador.');
                }
            }
            $user->syncRoles($validated['roles']);
        }

        $user->save();

        return Redirect::route('admin.users.index')->with('success', 'Usuario actualizado correctamente.');
    }

    public function ban(Request $request, User $user)
    {
        // No permitir banearse a sí mismo
        if ($user->id === $request->user()->id) {
            return Redirect::route('admin.users.index')->with('error', 'No puedes banearte a ti mismo.');
        }
        // No permitir banear al único administrador
        if ($user->hasRole('administrador')) {
            $adminRole = Role::findByName('administrador');
            $adminsCount = User::role($adminRole)->count();
             // Si el usuario a banear es admin Y es el único O si es admin y no está soft-deleted (ya está baneado)
            if ($adminsCount <= 1 && !$user->trashed()) {
                 return Redirect::route('admin.users.index')->with('error', 'No puedes banear al único administrador.');
            }
        }
            // Soft delete de todas sus publicaciones
        $user->publications()->delete();

        $user->delete(); // Soft delete


        // Soft delete de todas sus respuestas
        $user->responses()->delete();

        return Redirect::route('admin.users.index')->with('success', 'Usuario baneado correctamente.');
    }

    public function restore($user)
    {

        $user = User::withTrashed()->findOrFail($user);
        $user->restore(); // Simplemente llama a restore() en el modelo encontrado

        // Restaura todas sus publicaciones soft-deleted
        $user->publications()->withTrashed()->restore();

        return Redirect::route('admin.users.index')->with('success', 'Usuario restaurado correctamente.');
    }
}