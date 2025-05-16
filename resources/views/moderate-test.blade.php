{{-- filepath: c:\laragon\www\ConectaIA\resources\views\moderate-test.blade.php --}}
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Prueba Moderación Gemini</title>
    <meta name="csrf-token" content="{{ csrf_token() }}">
</head>
<body>
    <h1>Prueba de Moderación con Gemini</h1>
    <form id="moderateForm">
        <input type="text" id="texto" name="texto" placeholder="Escribe algo..." style="width:300px;">
        <button type="submit">Enviar</button>
    </form>
    <div id="resultado" style="margin-top:20px; font-weight:bold;"></div>

    <script>
        document.getElementById('moderateForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            const texto = document.getElementById('texto').value;
            document.getElementById('resultado').innerText = "Validando...";
            try {
                const res = await fetch('moderate-text', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
                        'X-Requested-With': 'XMLHttpRequest'
                    },
                    body: JSON.stringify({ text: texto })
                });
                const data = await res.json();
                document.getElementById('resultado').innerText = data.allowed
                    ? "✅ Permitido: " + (data.message || '')
                    : "❌ Bloqueado: " + (data.message || '');
            } catch (err) {
                document.getElementById('resultado').innerText = "Error al validar: " + err;
            }
        });
    </script>
</body>
</html>