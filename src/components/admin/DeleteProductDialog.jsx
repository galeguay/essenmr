import { useEffect, useRef, useState } from "react";
import { DELETE_PHRASE, isDeletePhraseValid } from "../../utils/deleteConfirmation";

export default function DeleteProductDialog({ open, productName, deleting, onCancel, onConfirm }) {
    const dialogRef = useRef(null);
    const inputRef = useRef(null);
    const [text, setText] = useState("");

    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;

        if (open && !dialog.open) {
            setText("");
            dialog.showModal();
            inputRef.current?.focus();
        } else if (!open && dialog.open) {
            dialog.close();
        }
    }, [open]);

    // Escape (evento nativo "cancel"): inactivo mientras se elimina
    const handleCancelEvent = (e) => {
        e.preventDefault();
        if (!deleting) onCancel();
    };

    const canConfirm = isDeletePhraseValid(text) && !deleting;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (canConfirm) onConfirm();
    };

    return (
        <dialog
            ref={dialogRef}
            onCancel={handleCancelEvent}
            className="modal modal-bottom sm:modal-middle"
            aria-labelledby="delete-product-title"
        >
            <form onSubmit={handleSubmit} className="modal-box max-h-[90dvh] overflow-y-auto">
                <h3 id="delete-product-title" className="text-lg font-bold text-gray-800">
                    Eliminar producto
                </h3>

                <p className="mt-3 text-gray-700 break-words">
                    Vas a eliminar <strong>{productName}</strong>.
                </p>

                <div role="alert" className="mt-4 alert alert-error alert-soft">
                    <i className="bi bi-exclamation-triangle-fill" aria-hidden="true"></i>
                    <span className="text-sm">
                        <strong>Esta acción es permanente e irreversible.</strong> También se borrarán
                        sus imágenes, su ficha y su video.
                    </span>
                </div>

                <label className="block mt-4">
                    <span className="block mb-1 text-sm text-gray-700">
                        Para confirmar, escribí «{DELETE_PHRASE}»
                    </span>
                    <input
                        ref={inputRef}
                        type="text"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        disabled={deleting}
                        autoComplete="off"
                        placeholder={DELETE_PHRASE}
                        className="w-full input"
                    />
                </label>

                <div className="flex flex-col-reverse gap-2 mt-6 sm:flex-row sm:justify-end">
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={deleting}
                        className="btn"
                    >
                        Cancelar
                    </button>
                    <button type="submit" disabled={!canConfirm} className="btn btn-error">
                        {deleting && <span className="loading loading-spinner loading-sm"></span>}
                        {deleting ? "Eliminando…" : "Eliminar"}
                    </button>
                </div>
            </form>

            {/* Clic fuera: inactivo mientras se elimina */}
            {!deleting && (
                <form method="dialog" className="modal-backdrop">
                    <button type="button" onClick={onCancel} aria-label="Cerrar">cerrar</button>
                </form>
            )}
        </dialog>
    );
}
