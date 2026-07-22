import { validatePresence } from "./api.js";

// ======================================
// ETAT APPLICATION
// ======================================

let activeSessionId = null;
let qrApprenant = null;

// Un seul verrou :
// true = un QR est en cours de traitement
let scanBloque = false;


// ======================================
// SESSION LOCALE
// ======================================

const ancienneSession =
    localStorage.getItem("activeSessionId");


if (
    ancienneSession &&
    ancienneSession !== "undefined" &&
    ancienneSession !== "null"
) {
    activeSessionId = ancienneSession;
}


// ======================================
// DEBUG
// ======================================

function debug(message) {

    const zone =
        document.getElementById("debug");

    if (zone) {
        zone.innerText += "\n" + message;
    }

}


debug(
    "SESSION AU CHARGEMENT :\n" +
    activeSessionId
);


// ======================================
// PRESENCE
// ======================================

async function enregistrerPresence() {

    if (!activeSessionId || !qrApprenant) {
        scanBloque = false;
        return;
    }


    try {

        const result =
            await validatePresence(
                activeSessionId,
                qrApprenant
            );


        if (result.status === "ok") {

            document.getElementById("status").innerText =
                "✅ Présence enregistrée";

        }


        else if (
            result.code === "PRESENCE_ALREADY_EXISTS"
        ) {

            document.getElementById("status").innerText =
                "ℹ️ Présence déjà enregistrée";

        }


        else if (
            result.error === "Apprenant introuvable"
        ) {

            document.getElementById("status").innerText =
                "❌ Apprenant inconnu";

        }


        else if (
            result.error ===
            "Apprenant non prévu pour cette séance"
        ) {

            document.getElementById("status").innerText =
                "❌ Apprenant non prévu pour cette séance";

        }


        else {

            document.getElementById("status").innerText =
                "❌ Erreur lors de l'enregistrement";

        }


        await stopperCamera();

        qrApprenant = null;

    }


    catch (error) {

        console.error(
            "Erreur présence :",
            error
        );


        document.getElementById("status").innerText =
            "❌ " + error.message;

    }


    finally {

        // Le scanner redevient disponible
        // uniquement après la fin complète
        // du traitement.
        scanBloque = false;

    }

}


// ======================================
// CAMERA
// ======================================

async function stopperCamera() {

    try {

        await html5QrCode.stop();

    }

    catch (error) {

        console.error(
            "Erreur arrêt caméra :",
            error
        );

    }

}



async function demarrerCamera() {

    try {

        await html5QrCode.start(
            {
                facingMode: "environment"
            },
            {
                fps: 10,
                qrbox: 250
            },
            onScanSuccess
        );

    }

    catch (error) {

        console.error(
            "Erreur démarrage caméra",
            error
        );

    }

}


// ======================================
// SCAN QR
// ======================================

async function onScanSuccess(decodedText) {


    // Un seul traitement à la fois
    if (scanBloque) {
        return;
    }


    scanBloque = true;


    let data = null;


    try {

        data = JSON.parse(decodedText);

    }


    catch (e) {


        if (decodedText.startsWith("APP_")) {

            data = {

                type: "APPRENANT",
                version: 1,
                qrCode: decodedText

            };

        }


        else {

            debug(
                "QR INVALIDE :\n" +
                decodedText
            );


            document.getElementById("status").innerText =
                "❌ QR invalide";


            scanBloque = false;

            return;

        }

    }



    debug(
        "QR LU :\n" +
        JSON.stringify(data)
    );



    if (!data.type) {

        document.getElementById("status").innerText =
            "❌ QR sans type";


        scanBloque = false;

        return;

    }



    // ======================================
    // QR SESSION
    // ======================================

    if (data.type === "SESSION") {


        if (!data.activeSessionId) {

            document.getElementById("status").innerText =
                "❌ Session invalide";


            scanBloque = false;

            return;

        }


        activeSessionId = data.activeSessionId;


        localStorage.setItem(
            "activeSessionId",
            activeSessionId
        );


        document.getElementById("status").innerText =
            "✅ Session reconnue\n" +
            activeSessionId;


        debug(
            "SESSION ACTIVE : " +
            activeSessionId
        );


        await stopperCamera();


        scanBloque = false;

        return;

    }



    // ======================================
    // QR APPRENANT
    // ======================================

    if (data.type === "APPRENANT") {


        if (!activeSessionId) {

            document.getElementById("status").innerText =
                "⚠️ Scannez d'abord le QR séance";


            scanBloque = false;

            return;

        }


        if (!data.qrCode) {

            document.getElementById("status").innerText =
                "❌ QR apprenant invalide";


            scanBloque = false;

            return;

        }


        qrApprenant = data.qrCode;


        document.getElementById("status").innerText =
            "📷 QR apprenant détecté\n" +
            qrApprenant +
            "\nValidation en cours...";


        debug(
            "QR APPRENANT : " +
            qrApprenant
        );


        // Validation immédiate.
        // Le verrou empêche les doubles lectures.
        await enregistrerPresence();


        return;

    }



    document.getElementById("status").innerText =
        "❌ Type QR inconnu";


    scanBloque = false;

}


// ======================================
// CAMERA START
// ======================================

const html5QrCode =
    new Html5Qrcode("reader");


demarrerCamera();



// ======================================
// BOUTON SCANNER
// ======================================

document
    .getElementById("btnScanner")
    .addEventListener(
        "click",
        async () => {


            scanBloque = false;

            qrApprenant = null;


            document.getElementById("status").innerText =
                "En attente du QR...";


            await demarrerCamera();

        }
    );