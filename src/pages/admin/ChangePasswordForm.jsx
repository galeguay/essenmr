import { useState } from "react";
import { supabase } from "../../lib/supabase";

export default function ChangePasswordForm() {
    const [password, setPassword] = useState("");
    const [password2, setPassword2] = useState("");
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState(null);

    async function handleChangePassword(e) {
        e.preventDefault();
        setMsg(null);

        if (password.length < 6) {
            setMsg("La contraseña debe tener al menos 6 caracteres.");
            return;
        }

        if (password !== password2) {
            setMsg("Las contraseñas no coinciden.");
            return;
        }

        setLoading(true);

        const { error } = await supabase.auth.updateUser({
            password: password
        });

        setLoading(false);

        if (error) {
            setMsg("Error: " + error.message);
        } else {
            setMsg("Contraseña actualizada correctamente.");
            setPassword("");
            setPassword2("");
        }
    }

    return (
        <div className="max-w-md p-6 mx-auto shadow bg-base-200 rounded-xl">
            <h2 className="mb-4 text-2xl font-bold">Cambiar contraseña</h2>

            {msg && <div className="mb-4 alert alert-info">{msg}</div>}

            <form onSubmit={handleChangePassword} className="space-y-4">
                <label className="w-full form-control">
                    <span className="label-text">Nueva contraseña</span>
                    <input
                        type="password"
                        className="w-full input input-bordered"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </label>

                <label className="w-full form-control">
                    <span className="label-text">Repetir contraseña</span>
                    <input
                        type="password"
                        className="w-full input input-bordered"
                        value={password2}
                        onChange={(e) => setPassword2(e.target.value)}
                    />
                </label>

                <button
                    type="submit"
                    className="w-full btn btn-primary"
                    disabled={loading}
                >
                    {loading ? "Actualizando..." : "Cambiar contraseña"}
                </button>
            </form>
        </div>
    );
}
