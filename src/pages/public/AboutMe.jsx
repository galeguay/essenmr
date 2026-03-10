
import { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from "react-router-dom";
import { supabase } from '../../lib/supabase';
import BtnLink from '../../components/public/BtnLink';

export default function AboutMe() {


    return (
        <div className="px-4 py-50">
            <div className="mx-auto max-w-7xl flex flex-col items-center">
                <div class="text-center mb-12 text-2xl max-w-[500px]">
                    Soy María Rosa, emprendedora oficial Essen EIE 106891, radicada en Mar del Plata
                    ¡Contactame por cualquier consulta!
                </div>
                <div className="flex flex-col items-center gap-4">

                    <BtnLink href="tel:+5492235012258">
                        <i className="bi bi-telephone-fill"></i> Llamar (+54 9 223 501-2258)
                    </BtnLink>

                    <BtnLink href="https://wa.me/5492235012258">
                        <i className="bi bi-whatsapp"></i> Enviar Whatsapp
                    </BtnLink>

                    <BtnLink href="https://g.co/kgs/NuUKntR">
                        <i className="bi bi-google"></i> Perfil Google
                    </BtnLink>

                </div>
            </div>
        </div>
    )


}