import { useState, useEffect, useRef, useCallback } from "react";

const C = {
    morado: "#7B61FF",
    moradoClaro: "#A084E8",
    moradoSplash: "#6C63FF",
    verde: "#009688",
    azulOscuro: "#1A1A2E",
    rojo: "#E53935",
    naranja: "#FF7043",
    gris: "#F5F5F5",
    blanco: "#FFFFFF",
    texto: "#555555",
};

const BACKEND_URL = "https://vishing-call-detection-server.onrender.com";

function emitirAlerta() {
    try {
        const ctx = new(window.AudioContext || window.webkitAudioContext)();

        for (let i = 0; i < 3; i++) {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.frequency.value = 1200;
            osc.type = "square";
            const inicio = ctx.currentTime + i * 0.35;
            gain.gain.setValueAtTime(0.6, inicio);
            gain.gain.exponentialRampToValueAtTime(0.001, inicio + 0.25);
            osc.start(inicio);
            osc.stop(inicio + 0.25);
        }

        if (navigator.vibrate) {
            navigator.vibrate([300, 150, 300]);
        }
    } catch (e) {
        console.log("Audio no disponible:", e);
    }
}

const isMobile = () => window.innerWidth < 768;

function useIsMobile() {
    const [mobile, setMobile] = useState(isMobile());
    useEffect(() => {
        const handler = () => setMobile(isMobile());
        window.addEventListener("resize", handler);
        return () => window.removeEventListener("resize", handler);
    }, []);
    return mobile;
}

function Waveform({ activo }) {
    const bars = 32;
    return ( <
        div style = {
            { display: "flex", alignItems: "center", justifyContent: "center", gap: 3, height: 80, padding: "0 16px" } } > {
            Array.from({ length: bars }).map((_, i) => ( <
                div key = { i }
                style = {
                    {
                        width: 4,
                        borderRadius: 4,
                        background: `linear-gradient(180deg, ${C.morado}, ${C.moradoClaro})`,
                        height: activo ? `${20 + Math.sin(i * 0.5) * 18 + Math.random() * 20}%` : "15%",
                        transition: activo ? `height ${0.1 + (i % 5) * 0.05}s ease` : "height 0.3s ease",
                        animation: activo ? `wave ${0.6 + (i % 7) * 0.1}s ease-in-out infinite alternate` : "none",
                        animationDelay: `${i * 0.03}s`,
                        opacity: activo ? 1 : 0.4,
                    }
                }
                />
            ))
        } <
        style > { `
        @keyframes wave { from{transform:scaleY(0.4)} to{transform:scaleY(1.2)} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes slideUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse { 0%,100%{box-shadow:0 0 0 0 rgba(123,97,255,0.4)} 50%{box-shadow:0 0 0 12px rgba(123,97,255,0)} }
        @keyframes spin { to{transform:rotate(360deg)} }
        * { box-sizing:border-box; margin:0; padding:0; }
        body { font-family:'DM Sans',sans-serif; }
      ` } < /style> <
        /div>
    );
}

function RiskGauge({ valor }) {
    const r = 44,
        circ = 2 * Math.PI * r;
    const offset = circ - (valor / 100) * circ;
    const color = valor < 40 ? C.verde : valor < 75 ? C.naranja : C.rojo;
    return ( <
        div style = {
            { position: "relative", width: 120, height: 120, margin: "0 auto" } } >
        <
        svg width = "120"
        height = "120"
        style = {
            { transform: "rotate(-90deg)" } } >
        <
        circle cx = "60"
        cy = "60"
        r = { r }
        fill = "none"
        stroke = "rgba(255,255,255,0.15)"
        strokeWidth = "10" / >
        <
        circle cx = "60"
        cy = "60"
        r = { r }
        fill = "none"
        stroke = { color }
        strokeWidth = "10"
        strokeDasharray = { circ }
        strokeDashoffset = { offset }
        strokeLinecap = "round"
        style = {
            { transition: "stroke-dashoffset 0.6s ease, stroke 0.4s ease" } }
        /> <
        /svg> <
        div style = {
            { position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" } } >
        <
        span style = {
            { fontSize: 24, fontWeight: 800, color, lineHeight: 1 } } > { valor } < /span> <
        span style = {
            { fontSize: 11, color: "rgba(255,255,255,0.6)" } } > % < /span> <
        /div> <
        /div>
    );
}

function SplashScreen({ onContinuar }) {
    return ( <
        div style = {
            {
                minHeight: "100vh",
                background: "linear-gradient(135deg,#1A1A2E 0%,#2D1B69 40%,#4A2085 70%,#6C3FC5 100%)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "60px 36px 48px",
                position: "relative",
                overflow: "hidden"
            }
        } >
        <
        div style = {
            { position: "absolute", top: -80, left: "50%", transform: "translateX(-50%)", width: 340, height: 340, borderRadius: "50%", background: "rgba(255,255,255,0.05)", pointerEvents: "none" } }
        /> <
        div style = {
            { position: "absolute", top: 40, right: -60, width: 200, height: 200, borderRadius: "50%", background: "rgba(255,255,255,0.04)", pointerEvents: "none" } }
        /> <
        div style = {
            { animation: "fadeIn 0.8s ease both", zIndex: 1 } } >
        <
        img src = "/logo.png"
        alt = "logo"
        style = {
            { width: 64, height: 64, borderRadius: 18, objectFit: "contain", marginBottom: 32 } }
        /> <
        h1 style = {
            { color: C.blanco, fontSize: "clamp(32px,8vw,48px)", fontWeight: 900, lineHeight: 1.1, letterSpacing: "-1px" } } >
        VISHING < br / > CALL < br / > DETECTION <
        /h1> <
        /div> <
        div style = {
            { animation: "slideUp 0.9s 0.2s ease both", zIndex: 1, width: "100%", maxWidth: 380 } } >
        <
        p style = {
            { color: "rgba(255,255,255,0.65)", fontSize: 15, lineHeight: 1.6, marginBottom: 16, textAlign: "center" } } >
        Analiza tus llamadas y detecta posibles < br / > fraudes telefónicos bancarios. <
        /p> <
        button onClick = { onContinuar }
        style = {
            {
                width: "100%",
                height: 56,
                borderRadius: 28,
                background: C.blanco,
                color: "#4A2085",
                border: "none",
                fontSize: 16,
                fontWeight: 700,
                cursor: "pointer",
                boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
                transition: "transform 0.15s"
            }
        }
        onMouseEnter = { e => e.target.style.transform = "scale(1.02)" }
        onMouseLeave = { e => e.target.style.transform = "scale(1)" } >
        Continuar <
        /button> <
        /div> <
        /div>
    );
}

function PanelPrincipalDesktop({ onNav, historialCount }) {
    const fecha = new Date().toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "short" }).toUpperCase();
    const cards = [
        { id: "monitoreo", label: "Aceptar monitoreo de llamadas", icon: "📞", count: historialCount, sub: `${historialCount} llamadas analizadas`, btn: "Iniciar monitoreo", color: "#7B61FF" },
        { id: "historial", label: "Ver Historial", icon: "📋", count: historialCount, sub: `${historialCount} llamadas almacenadas`, btn: "Ver registros", color: "#A084E8" },
        { id: "configuracion", label: "Configuración", icon: "⚙️", sub: "Ajustes de detección", btn: "Configurar", color: "#009688" },
    ];
    return ( <
        div style = {
            { padding: "40px 48px", animation: "fadeIn 0.4s ease both" } } >
        <
        p style = {
            { color: "rgba(255,255,255,0.45)", fontSize: 13, marginBottom: 4 } } > ☀{ fecha } < /p> <
        h1 style = {
            { color: C.blanco, fontSize: 36, fontWeight: 800, marginBottom: 8 } } > Panel Principal < /h1> <
        p style = {
            { color: "rgba(255,255,255,0.55)", fontSize: 15, marginBottom: 40 } } > Monitorea tus llamadas y detecta posibles fraudes en tiempo real. < /p> <
        div style = {
            { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 } } > {
            cards.map((c, i) => ( <
                    div key = { c.id }
                    onClick = {
                        () => onNav(c.id) }
                    style = {
                        {
                            background: "rgba(255,255,255,0.07)",
                            border: "1px solid rgba(255,255,255,0.12)",
                            borderRadius: 20,
                            padding: 28,
                            cursor: "pointer",
                            transition: "transform 0.15s, background 0.15s",
                            animation: `slideUp 0.4s ${i * 0.08}s ease both`
                        }
                    }
                    onMouseEnter = { e => { e.currentTarget.style.background = "rgba(255,255,255,0.12)";
                            e.currentTarget.style.transform = "translateY(-3px)"; } }
                    onMouseLeave = { e => { e.currentTarget.style.background = "rgba(255,255,255,0.07)";
                            e.currentTarget.style.transform = "translateY(0)"; } } >
                    <
                    div style = {
                        { fontSize: 32, marginBottom: 16 } } > { c.icon } < /div> <
                    p style = {
                        { color: C.blanco, fontWeight: 700, fontSize: 17, marginBottom: 8, lineHeight: 1.3 } } > { c.label } < /p> {
                        c.count !== undefined && < p style = {
                                { color: C.blanco, fontWeight: 800, fontSize: 28, marginBottom: 4 } } > { c.count } < /p>} <
                            p style = {
                                { color: "rgba(255,255,255,0.4)", fontSize: 13, marginBottom: 20 } } > { c.sub } < /p> <
                            div style = {
                                { background: c.color, color: C.blanco, borderRadius: 12, padding: "10px 18px", textAlign: "center", fontSize: 14, fontWeight: 600 } } > { c.btn }→ < /div> <
                            /div>
                    ))
            } <
            /div> <
            /div>
        );
    }

    function PanelPrincipalMovil({ onNav, historialCount }) {
        const fecha = new Date().toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "short" }).toUpperCase();
        const cards = [
            { id: "monitoreo", label: "Aceptar monitoreo de llamadas", icon: "📞", color: "#7B61FF", count: historialCount, sub: `${historialCount} llamadas analizadas`, btn: "Iniciar monitoreo" },
            { id: "historial", label: "Ver Historial", icon: "📋", color: "#A084E8", count: historialCount, sub: `${historialCount} llamadas almacenadas`, btn: "Ver registros" },
            { id: "configuracion", label: "Configuración", icon: "⚙️", color: "#009688", sub: "Ajustes de detección", btn: "Configurar" },
        ];
        return ( <
            div style = {
                { animation: "fadeIn 0.4s ease both" } } >
            <
            div style = {
                { padding: "24px 20px 8px" } } >
            <
            h2 style = {
                { fontSize: 22, fontWeight: 800, color: C.blanco, marginBottom: 4 } } > Panel Principal < /h2> <
            p style = {
                { fontSize: 12, color: "rgba(255,255,255,0.45)", marginBottom: 2 } } > ☀{ fecha } < /p> <
            p style = {
                { fontSize: 13, color: "rgba(255,255,255,0.6)" } } > Vishing Call Detection < /p> <
            /div> <
            div style = {
                { padding: "12px 16px 24px", display: "flex", flexDirection: "column", gap: 14 } } > {
                cards.map((c, i) => ( <
                        div key = { c.id }
                        onClick = {
                            () => onNav(c.id) }
                        style = {
                            {
                                background: "rgba(255,255,255,0.08)",
                                border: "1px solid rgba(255,255,255,0.15)",
                                borderRadius: 20,
                                padding: "20px 20px 18px",
                                cursor: "pointer",
                                position: "relative",
                                overflow: "hidden",
                                animation: `slideUp 0.4s ${i * 0.08}s ease both`
                            }
                        } >
                        <
                        div style = {
                            { position: "absolute", right: -16, top: -16, width: 80, height: 80, borderRadius: "50%", background: "rgba(255,255,255,0.06)" } }
                        /> <
                        span style = {
                            { position: "absolute", right: 16, top: 16, fontSize: 28, opacity: 0.85 } } > { c.icon } < /span> <
                        p style = {
                            { color: C.blanco, fontWeight: 700, fontSize: 16, marginBottom: 8, paddingRight: 48, lineHeight: 1.3 } } > { c.label } < /p> {
                            c.count !== undefined && < p style = {
                                    { color: C.blanco, fontWeight: 800, fontSize: 22, marginBottom: 2 } } > { c.count } < /p>} <
                                p style = {
                                    { color: "rgba(255,255,255,0.45)", fontSize: 11, marginBottom: 14 } } > { c.sub } < /p> <
                                div style = {
                                    { background: c.color, color: C.blanco, borderRadius: 10, padding: "8px 14px", display: "inline-block", fontSize: 13, fontWeight: 600 } } > { c.btn }→ < /div> <
                                /div>
                        ))
                } <
                /div> <
                /div>
            );
        }

        function Monitoreo({ onGuardar, mobile }) {
            const [grabando, setGrabando] = useState(false);
            const [segundos, setSegundos] = useState(0);
            const [riesgo, setRiesgo] = useState(0);
            const [transcripcion, setTranscripcion] = useState("");
            const [cargando, setCargando] = useState(false);
            const [error, setError] = useState("");
            const [analisisFinalizado, setAnalisisFinalizado] = useState(false);
            const mediaRecorderRef = useRef(null);
            const chunksRef = useRef([]);
            const timerRef = useRef(null);
            const loopRef = useRef(null);
            const analisisFinalizadoRef = useRef(false); // Ref para bloquear respuestas tardías del backend

            useEffect(() => {
                analisisFinalizadoRef.current = analisisFinalizado;
            }, [analisisFinalizado]);

            useEffect(() => {
                if (grabando) {
                    timerRef.current = setInterval(() => setSegundos(s => s + 1), 1000);
                } else {
                    clearInterval(timerRef.current);
                }
                return () => clearInterval(timerRef.current);
            }, [grabando]);

            const formatTime = s => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

            const enviarSegmento = useCallback(async(blob) => {
                setCargando(true);
                setError("");
                try {
                    const formData = new FormData();
                    formData.append("audio", blob, "segmento.mp4");
                    const res = await fetch(`${BACKEND_URL}/analyze_audio/`, { method: "POST", body: formData });
                    if (!res.ok) throw new Error(`Error ${res.status}`);
                    const data = await res.json();

                    // Si el análisis ya fue detenido, ignorar respuestas tardías del backend
                    if (analisisFinalizadoRef.current) return;

                    const nuevoRiesgo = Math.round(data.riesgo || 0);
                    setRiesgo(nuevoRiesgo);
                    if (nuevoRiesgo >= 75) emitirAlerta();
                    setTranscripcion(data.transcripcion || "");
                } catch (e) {
                    setError("No se pudo conectar con el servidor. Verifica la URL del backend.");
                } finally {
                    setCargando(false);
                }
            }, []);

            const iniciarLoop = useCallback(async() => {
                try {
                    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                    const grabarCiclo = () => {
                        const mr = new MediaRecorder(stream, { mimeType: "audio/webm" });
                        chunksRef.current = [];
                        mr.ondataavailable = e => chunksRef.current.push(e.data);
                        mr.onstop = () => { enviarSegmento(new Blob(chunksRef.current, { type: "audio/webm" })); };
                        mr.start();
                        mediaRecorderRef.current = mr;
                        loopRef.current = setTimeout(() => {
                            if (mr.state === "recording") mr.stop();
                            if (grabando) grabarCiclo();
                        }, 8000);
                    };
                    grabarCiclo();
                } catch {
                    setError("No se pudo acceder al micrófono.");
                    setGrabando(false);
                }
            }, [enviarSegmento, grabando]);

            const toggleGrabacion = () => {
                if (!grabando) {
                    // Reiniciar estado al iniciar nueva grabación
                    setAnalisisFinalizado(false);
                    analisisFinalizadoRef.current = false;
                    setGrabando(true);
                    setSegundos(0);
                    setRiesgo(0);
                    setTranscripcion("");
                    setError("");
                } else {
                    // Marcar como finalizado para congelar el gauge y bloquear respuestas tardías
                    setAnalisisFinalizado(true);
                    analisisFinalizadoRef.current = true;
                    setGrabando(false);
                    setCargando(false);
                    clearTimeout(loopRef.current);
                    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
                        mediaRecorderRef.current.stop();
                    }
                    // Guardar automáticamente al detener la llamada
                    onGuardar({
                        fecha: new Date().toLocaleString("es-MX"),
                        estado: riesgo >= 75 ? "Sospechoso" : "Seguro",
                        riesgo,
                    });
                }
            };

            useEffect(() => { if (grabando) iniciarLoop(); }, [grabando]);

            const boxStyle = { background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 20, padding: "20px 16px", marginBottom: 14 };

            return ( <
                div style = {
                    { animation: "fadeIn 0.4s ease both", paddingBottom: 24, maxWidth: mobile ? "100%" : 700, margin: "0 auto" } } >
                <
                div style = {
                    { padding: "24px 20px 12px" } } >
                <
                h2 style = {
                    { fontSize: mobile ? 18 : 24, fontWeight: 800, color: C.blanco } } > Monitoreo en tiempo real < /h2> <
                /div>

                <
                div style = {
                    { margin: "0 16px 8px", ...boxStyle } } >
                <
                Waveform activo = { grabando }
                /> <
                p style = {
                    { textAlign: "center", fontSize: 28, fontWeight: 800, color: C.blanco, marginTop: 8 } } > { formatTime(segundos) } < /p> <
                /div>

                <
                div style = {
                    { padding: "0 16px 12px" } } >
                <
                button onClick = { toggleGrabacion }
                style = {
                    {
                        width: "100%",
                        height: 52,
                        borderRadius: 26,
                        background: grabando ? C.rojo : C.morado,
                        color: C.blanco,
                        border: "none",
                        fontSize: 15,
                        fontWeight: 700,
                        cursor: "pointer",
                        animation: grabando ? "pulse 2s infinite" : "none",
                        boxShadow: `0 4px 16px ${grabando ? C.rojo : C.morado}55`
                    }
                } > { grabando ? "⏹ Detener grabación" : "🎙 Grabar llamada" } <
                /button> <
                /div>

                {
                    error && ( <
                        div style = {
                            { margin: "0 16px 12px", padding: "12px 16px", background: "rgba(229,57,53,0.15)", borderRadius: 12, border: "1px solid rgba(229,57,53,0.3)", color: "#ff8a80", fontSize: 13 } } > { error } <
                        /div>
                    )
                }

                <
                div style = {
                    { margin: "0 16px", ...boxStyle } } >
                <
                p style = {
                    { fontWeight: 700, fontSize: 15, color: C.blanco, textAlign: "center", marginBottom: 16 } } > Nivel de riesgo < /p> <
                RiskGauge valor = { riesgo }
                /> {
                    cargando && < p style = {
                            { textAlign: "center", fontSize: 12, color: "rgba(255,255,255,0.5)", marginTop: 10 } } > ⟳Analizando segmento... < /p>} {
                            riesgo >= 75 && ( <
                                div style = {
                                    { marginTop: 12, padding: "10px 14px", borderRadius: 12, background: "rgba(229,57,53,0.15)", border: "1px solid rgba(229,57,53,0.3)", textAlign: "center", color: "#ff8a80", fontWeight: 700, fontSize: 13 } } > ⚠️Alto riesgo de vishing detectado <
                                /div>
                            )
                        } <
                        /div>

                    { /* Solo transcripción, palabras clave eliminadas */ } {
                        transcripcion && ( <
                            div style = {
                                { margin: "0 16px", ...boxStyle } } >
                            <
                            p style = {
                                { fontWeight: 700, fontSize: 15, color: C.blanco, marginBottom: 10 } } > Transcripción < /p> <
                            p style = {
                                { fontSize: 13, color: "rgba(255,255,255,0.6)", lineHeight: 1.6, fontStyle: "italic" } } > "{transcripcion}" < /p> <
                            /div>
                        )
                    }

                    <
                    div style = {
                            { padding: "0 16px", display: "flex", flexDirection: "column", gap: 10 } } >
                        <
                        button onClick = {
                            () => {
                                if (grabando) {
                                    setAnalisisFinalizado(true);
                                    analisisFinalizadoRef.current = true;
                                    setGrabando(false);
                                    setCargando(false);
                                    clearTimeout(loopRef.current);
                                    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") mediaRecorderRef.current.stop();
                                    // Guardar al detener análisis manual
                                    onGuardar({
                                        fecha: new Date().toLocaleString("es-MX"),
                                        estado: riesgo >= 75 ? "Sospechoso" : "Seguro",
                                        riesgo,
                                    });
                                }
                            }
                        }
                    style = {
                            { width: "100%", height: 52, borderRadius: 26, background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", color: C.blanco, fontSize: 15, fontWeight: 700, cursor: "pointer" } } >
                        Detener análisis manual <
                        /button> <
                        /div> <
                        /div>
                );
            }

            function Historial({ lista, onLimpiar, mobile }) {
                return ( <
                    div style = {
                        { animation: "fadeIn 0.4s ease both", paddingBottom: 100, maxWidth: mobile ? "100%" : 700, margin: "0 auto" } } >
                    <
                    div style = {
                        { padding: "24px 20px 16px" } } >
                    <
                    h2 style = {
                        { fontSize: mobile ? 22 : 28, fontWeight: 800, color: C.blanco, lineHeight: 1.2 } } > Llamadas almacenadas < br / > hasta el momento < /h2> <
                    /div> <
                    div style = {
                        { padding: "0 16px" } } > {
                        lista.length === 0 ? ( <
                            div style = {
                                { textAlign: "center", padding: "48px 24px", background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 20 } } >
                            <
                            p style = {
                                { fontSize: 32, marginBottom: 12 } } > 📋 < /p> <
                            p style = {
                                { color: "rgba(255,255,255,0.4)", fontSize: 14 } } > No hay llamadas grabadas aún. < /p> <
                            /div>
                        ) : ( <
                            div style = {
                                { background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 20, overflow: "hidden" } } > {
                                lista.map((item, i) => ( <
                                    div key = { i }
                                    style = {
                                        { padding: "14px 16px", borderBottom: i < lista.length - 1 ? "1px solid rgba(255,255,255,0.08)" : "none", display: "flex", alignItems: "center", gap: 12 } } >
                                    <
                                    div style = {
                                        { width: 40, height: 40, borderRadius: 12, flexShrink: 0, background: item.estado === "Seguro" ? "rgba(0,150,136,0.2)" : "rgba(255,112,67,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 } } > { item.estado === "Seguro" ? "✅" : "⚠️" } <
                                    /div> <
                                    div style = {
                                        { flex: 1 } } >
                                    <
                                    p style = {
                                        { fontSize: 13, color: "rgba(255,255,255,0.8)", fontWeight: 600 } } > { item.fecha } < /p> <
                                    p style = {
                                        { fontSize: 13, fontWeight: 700, color: item.estado === "Seguro" ? C.verde : C.naranja } } > { item.estado }— { item.riesgo } % riesgo < /p> <
                                    /div> <
                                    /div>
                                ))
                            } <
                            /div>
                        )
                    } <
                    /div> <
                    div style = {
                        { padding: "16px 16px 0" } } >
                    <
                    button onClick = { onLimpiar }
                    style = {
                        { width: "100%", height: 56, borderRadius: 28, background: C.morado, color: C.blanco, border: "none", fontSize: 15, fontWeight: 700, cursor: "pointer", boxShadow: `0 4px 16px ${C.morado}44` } } > 🗑Limpiar Historial <
                    /button> <
                    /div> <
                    /div>
                );
            }

            function Configuracion({ config, onChange, mobile }) {
                const boxStyle = { background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 20, padding: "16px 20px", marginBottom: 14 };

                // Solicitar permiso de micrófono al activar el toggle
                const handleMicrofonoToggle = async() => {
                    if (!config.microfono) {
                        try {
                            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                            // Detener el stream inmediatamente, solo se necesitaba el popup de permiso
                            stream.getTracks().forEach(track => track.stop());
                            onChange("microfono", true);
                        } catch (e) {
                            // El usuario denegó el permiso — dejar toggle en false
                            onChange("microfono", false);
                        }
                    } else {
                        // No se puede revocar programáticamente, solo apagar el toggle visualmente
                        onChange("microfono", false);
                    }
                };

                const items = [
                    { key: "alertas", icon: "🔔", color: C.verde, label: "Activar alertas sonoras", onToggle: () => onChange("alertas", !config.alertas) },
                    { key: "microfono", icon: "🎙", color: C.naranja, label: "Permisos de micrófono", onToggle: handleMicrofonoToggle },
                    { key: "privacidad", icon: "🔒", color: C.rojo, label: "Permisos de privacidad", onToggle: () => onChange("privacidad", !config.privacidad) },
                ];

                return ( <
                    div style = {
                        { animation: "fadeIn 0.4s ease both", paddingBottom: 24, maxWidth: mobile ? "100%" : 600, margin: "0 auto" } } >
                    <
                    div style = {
                        { padding: "24px 20px 16px" } } >
                    <
                    h2 style = {
                        { fontSize: mobile ? 22 : 28, fontWeight: 800, color: C.blanco } } > Configuración < /h2> <
                    /div> <
                    div style = {
                        { padding: "0 16px" } } >

                    { /* Umbral de detección */ } <
                    div style = {
                        {...boxStyle } } >
                    <
                    div style = {
                        { display: "flex", alignItems: "center", gap: 12, marginBottom: 14 } } >
                    <
                    div style = {
                        { width: 44, height: 44, borderRadius: 12, background: "rgba(123,97,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 } } > 📊 < /div> <
                    div >
                    <
                    p style = {
                        { fontWeight: 700, fontSize: 14, color: C.blanco } } > Cambiar umbral de detección < /p> <
                    p style = {
                        { fontSize: 13, color: C.morado, fontWeight: 700 } } > { config.umbral } % < /p> <
                    /div> <
                    /div> <
                    input type = "range"
                    min = "0"
                    max = "100"
                    value = { config.umbral }
                    onChange = { e => onChange("umbral", Number(e.target.value)) }
                    style = {
                        { width: "100%", accentColor: C.morado } }
                    /> <
                    div style = {
                        { display: "flex", justifyContent: "space-between", marginTop: 4 } } >
                    <
                    span style = {
                        { fontSize: 11, color: "rgba(255,255,255,0.3)" } } > 0 % < /span> <
                    span style = {
                        { fontSize: 11, color: "rgba(255,255,255,0.3)" } } > 100 % < /span> <
                    /div> <
                    /div>

                    { /* Toggles */ } {
                        items.map(item => ( <
                            div key = { item.key }
                            style = {
                                {...boxStyle, display: "flex", flexDirection: "column", gap: 0 } } >
                            <
                            div style = {
                                { display: "flex", alignItems: "center", gap: 12 } } >
                            <
                            div style = {
                                { width: 44, height: 44, borderRadius: 12, flexShrink: 0, background: `${item.color}22`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 } } > { item.icon } <
                            /div> <
                            p style = {
                                { flex: 1, fontWeight: 600, fontSize: 14, color: C.blanco } } > { item.label } < /p> <
                            div onClick = { item.onToggle }
                            style = {
                                { width: 48, height: 28, borderRadius: 14, cursor: "pointer", background: config[item.key] ? C.morado : "rgba(255,255,255,0.15)", position: "relative", transition: "background 0.25s", flexShrink: 0 } } >
                            <
                            div style = {
                                { position: "absolute", top: 4, left: config[item.key] ? 24 : 4, width: 20, height: 20, borderRadius: "50%", background: C.blanco, transition: "left 0.25s", boxShadow: "0 1px 4px rgba(0,0,0,0.3)" } }
                            /> <
                            /div> <
                            /div> { /* Nota informativa para Permisos de privacidad */ } {
                                item.key === "privacidad" && ( <
                                    p style = {
                                        { fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 8, lineHeight: 1.5 } } >
                                    Los permisos de privacidad son gestionados por el navegador.Para revocarlos, ve a la configuración de tu navegador. <
                                    /p>
                                )
                            } { /* Nota informativa para Permisos de micrófono */ } {
                                item.key === "microfono" && ( <
                                    p style = {
                                        { fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 8, lineHeight: 1.5 } } >
                                    Al activar, el navegador solicitará acceso al micrófono.Para revocar el permiso, hazlo desde la configuración de tu navegador. <
                                    /p>
                                )
                            } <
                            /div>
                        ))
                    }

                    { /* Acerca de */ } <
                    div style = { boxStyle } >
                    <
                    p style = {
                        { fontWeight: 700, fontSize: 15, color: C.blanco, marginBottom: 12 } } > Acerca de < /p>

                    { /* Descripción del proyecto — texto fijo */ } <
                    p style = {
                        { fontSize: 14, color: "rgba(255,255,255,0.6)", lineHeight: 1.6, marginBottom: 14 } } >
                    Herramienta basada en Inteligencia Artificial para detectar intentos de fraude bancario durante llamadas telefónicas. <
                    /p>

                    <
                    div style = {
                        { height: 1, background: "rgba(255,255,255,0.08)", marginBottom: 4 } }
                    />

                    { /* Desarrolladores — expandible */ } <
                    div >
                    <
                    div onClick = {
                        () => onChange("_devExpanded", !config._devExpanded) }
                    style = {
                        { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", cursor: "pointer" } } >
                    <
                    p style = {
                        { fontSize: 14, color: "rgba(255,255,255,0.5)" } }
                    onMouseEnter = { e => e.target.style.color = C.blanco }
                    onMouseLeave = { e => e.target.style.color = "rgba(255,255,255,0.5)" } >
                    Desarrolladores <
                    /p> <
                    span style = {
                        { fontSize: 12, color: "rgba(255,255,255,0.35)", transition: "transform 0.2s", display: "inline-block", transform: config._devExpanded ? "rotate(180deg)" : "rotate(0deg)" } } > ▼ < /span> <
                    /div> {
                        config._devExpanded && ( <
                            div style = {
                                { paddingBottom: 8 } } > {
                                ["Chávez López Alexandra", "Estrada Vargas Valeria", "Serrano Fernández Gerardo Adonai"].map((nombre, i) => ( <
                                    p key = { i }
                                    style = {
                                        { fontSize: 13, color: "rgba(255,255,255,0.5)", padding: "4px 0 4px 12px", borderLeft: `2px solid ${C.morado}`, marginBottom: 6 } } > { nombre } <
                                    /p>
                                ))
                            } <
                            /div>
                        )
                    } <
                    /div> <
                    /div>

                    <
                    /div> <
                    /div>
                );
            }

            export default function App() {
                const [pantalla, setPantalla] = useState("splash");
                const [navActiva, setNavActiva] = useState("inicio");
                const [historial, setHistorial] = useState([]);
                const [config, setConfig] = useState({ umbral: 40, alertas: true, microfono: true, privacidad: true, _devExpanded: false });
                const mobile = useIsMobile();

                const navItems = [
                    { id: "inicio", icon: "🏠", label: "Inicio" },
                    { id: "monitoreo", icon: "📞", label: "Monitoreo" },
                    { id: "historial", icon: "📋", label: "Historial" },
                ];

                const handleNav = (id) => {
                    if (id === "configuracion") { setPantalla("configuracion"); return; }
                    setNavActiva(id);
                    setPantalla("main");
                };

                // Guardar en historial sin redirigir — el usuario decide cuándo ir al historial
                const handleGuardar = (entrada) => {
                    setHistorial(prev => [entrada, ...prev]);
                };

                const renderContenido = () => {
                    if (pantalla === "configuracion") return ( <
                        Configuracion config = { config }
                        onChange = {
                            (k, v) => setConfig(c => ({...c, [k]: v })) }
                        mobile = { mobile }
                        />
                    );
                    switch (navActiva) {
                        case "inicio":
                            return mobile ?
                                < PanelPrincipalMovil onNav = { handleNav }
                            historialCount = { historial.length }
                            />: < PanelPrincipalDesktop onNav = { handleNav }
                            historialCount = { historial.length }
                            />;
                        case "monitoreo":
                            return <Monitoreo onGuardar = { handleGuardar }
                            mobile = { mobile }
                            />;
                        case "historial":
                            return <Historial lista = { historial }
                            onLimpiar = {
                                () => setHistorial([]) }
                            mobile = { mobile }
                            />;
                        default:
                            return mobile ?
                                < PanelPrincipalMovil onNav = { handleNav }
                            historialCount = { historial.length }
                            />: < PanelPrincipalDesktop onNav = { handleNav }
                            historialCount = { historial.length }
                            />;
                    }
                };

                if (pantalla === "splash") return ( <
                    >
                    <
                    link href = "https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700;800;900&display=swap"
                    rel = "stylesheet" / >
                    <
                    SplashScreen onContinuar = {
                        () => setPantalla("main") }
                    /> <
                    />
                );

                return ( <
                    >
                    <
                    link href = "https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700;800;900&display=swap"
                    rel = "stylesheet" / >
                    <
                    div style = {
                        { minHeight: "100vh", background: "linear-gradient(135deg,#1A1A2E 0%,#2D1B69 40%,#4A2085 70%,#6C3FC5 100%)", fontFamily: "'DM Sans',sans-serif" } } >

                    {!mobile && ( <
                            div style = {
                                { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 48px", borderBottom: "1px solid rgba(255,255,255,0.08)" } } >
                            <
                            div style = {
                                { display: "flex", alignItems: "center", gap: 12 } } >
                            <
                            img src = "/logo.png"
                            alt = "logo"
                            style = {
                                { width: 40, height: 40, borderRadius: 12, objectFit: "contain" } }
                            /> <
                            p style = {
                                { color: C.blanco, fontWeight: 700, fontSize: 16 } } > Vishing Call Detection < /p> <
                            /div> <
                            div style = {
                                { display: "flex", gap: 8 } } > {
                                navItems.map(item => {
                                    const activo = navActiva === item.id && pantalla === "main";
                                    return ( <
                                        button key = { item.id }
                                        onClick = {
                                            () => handleNav(item.id) }
                                        style = {
                                            {
                                                padding: "8px 20px",
                                                borderRadius: 22,
                                                background: activo ? "rgba(123,97,255,0.3)" : "rgba(255,255,255,0.07)",
                                                border: activo ? "1px solid rgba(123,97,255,0.5)" : "1px solid rgba(255,255,255,0.1)",
                                                color: activo ? C.blanco : "rgba(255,255,255,0.6)",
                                                fontSize: 14,
                                                fontWeight: activo ? 700 : 500,
                                                cursor: "pointer",
                                                transition: "all 0.2s"
                                            }
                                        } > { item.icon } { item.label } <
                                        /button>
                                    );
                                })
                            } <
                            button onClick = {
                                () => setPantalla("configuracion") }
                            style = {
                                {
                                    padding: "8px 20px",
                                    borderRadius: 22,
                                    background: pantalla === "configuracion" ? "rgba(0,150,136,0.3)" : "rgba(255,255,255,0.07)",
                                    border: pantalla === "configuracion" ? "1px solid rgba(0,150,136,0.5)" : "1px solid rgba(255,255,255,0.1)",
                                    color: pantalla === "configuracion" ? C.blanco : "rgba(255,255,255,0.6)",
                                    fontSize: 14,
                                    fontWeight: 500,
                                    cursor: "pointer"
                                }
                            } > ⚙️Configuración <
                            /button> <
                            /div> <
                            /div>
                        )
                    }

                    <
                    div style = {
                        { paddingBottom: mobile ? 72 : 0 } } > { renderContenido() } < /div>

                    {
                        mobile && pantalla !== "configuracion" && ( <
                            div style = {
                                { position: "fixed", bottom: 0, left: 0, right: 0, background: "rgba(26,26,46,0.95)", backdropFilter: "blur(10px)", borderTop: "1px solid rgba(255,255,255,0.08)", display: "flex", height: 64, zIndex: 100 } } > {
                                navItems.map(item => {
                                        const activo = navActiva === item.id && pantalla === "main";
                                        return ( <
                                            button key = { item.id }
                                            onClick = {
                                                () => handleNav(item.id) }
                                            style = {
                                                { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2, background: "none", border: "none", cursor: "pointer" } } >
                                            <
                                            span style = {
                                                { fontSize: 20 } } > { item.icon } < /span> <
                                            span style = {
                                                { fontSize: 11, fontWeight: activo ? 700 : 500, color: activo ? C.morado : "rgba(255,255,255,0.4)", transition: "color 0.2s" } } > { item.label } < /span> {
                                                activo && < div style = {
                                                    { position: "absolute", bottom: 0, width: 32, height: 3, borderRadius: "3px 3px 0 0", background: C.morado } }
                                                />} <
                                                /button>
                                            );
                                        })
                                } <
                                /div>
                            )
                        }

                        {
                            mobile && pantalla === "configuracion" && ( <
                                button onClick = {
                                    () => { setPantalla("main");
                                        setNavActiva("inicio"); } }
                                style = {
                                    { position: "fixed", top: 16, left: 16, background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 12, color: C.blanco, fontSize: 14, fontWeight: 600, cursor: "pointer", padding: "8px 14px" } } > ←Atrás <
                                /button>
                            )
                        }

                        <
                        /div> <
                        />
                    );
                }