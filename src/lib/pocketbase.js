import PocketBase from 'pocketbase';

export const pb = new PocketBase('http://127.0.0.1:8090');

pb.autoCancellation(false);  // ← Esta línea elimina el autocancelled

// Opcional: cargar token guardado al iniciar la app
if (typeof window !== 'undefined') {
  const token = localStorage.getItem('pb_token');
  const user = localStorage.getItem('pb_user');
  if (token && user) {
    pb.authStore.save(token, JSON.parse(user));
  }
}

// Guardar automáticamente al hacer login/logout
pb.authStore.onChange(() => {
  if (pb.authStore.isValid) {
    localStorage.setItem('pb_token', pb.authStore.token);
    localStorage.setItem('pb_user', JSON.stringify(pb.authStore.model));
  } else {
    localStorage.removeItem('pb_token');
    localStorage.removeItem('pb_user');
  }
});