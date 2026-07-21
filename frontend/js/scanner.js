import { validatePresence } from "./api.js";

console.log("scanner v0.9.0");


// ======================================
// ETAT APPLICATION
// ======================================

let sessionId = null;
let qrApprenant = null;
let isScanning = true;
let presenceEnCours = false;


// ======================================
// SESSION LOCALE
// ======================================

const ancienneSession =
    localStorage.getItem("sessionId");


if (
    ancienneSession &&
    ancienneSession !== "undefined" &&
    ancienneSession !== "null"
) {
    sessionId = ancienneSession;
}


// ======================================
// DEBUG
// ======================================
function debug(message) {
    document.getElementById("debug").innerText +=
        "\n" + message;
}


debug(
    "SESSION AU CHARGEMENT :\n" +
    sessionId
);


// ======================================
// PRESENCE
// ======================================

async function enregistrerPresence() {

    if (presenceEnCours) {
        return;
    }

    if (!sessionId || !qrApprenant) {
        return;
    }

    presenceEnCours = true;

    try {

        const result =
            await validatePresence(
                sessionId,
                qrApprenant
            );

        console.log(
            "REPONSE PRESENCE :",
            result
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
            result.error === "Apprenant non prévu pour cette séance"
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

        presenceEnCours = false;

    }

}


async function stopperCamera() {

    try {

        await html5QrCode.stop();

        console.log("CAMERA ARRETEE");

    } catch (error) {

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

        console.log("CAMERA DEMARREE");

    } catch (error) {

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

    if (!isScanning) {
        return;
    }

    isScanning = false;

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

            isScanning = true;

            return;

        }

    }

    debug(
        "QR LU :\n" +
        JSON.stringify(data)
    );

    console.log(
        "QR LU :",
        data
    );

    if (!data.type) {

        debug(
            "QR SANS TYPE"
        );

        document.getElementById("status").innerText =
            "❌ QR sans type";


        isScanning = true;

        return;

    }


    // ======================================
    // QR SESSION
    // ======================================

    if (data.type === "SESSION") {

        if (!data.sessionId) {

            document.getElementById("status").innerText =
                "❌ Session invalide";

            isScanning = true;

            return;

        }

        sessionId = data.sessionId;

        localStorage.setItem(
            "sessionId",
            sessionId
        );

        document.getElementById("status").innerText =
            "✅ Session reconnue\n" +
            sessionId;

        debug(
            "SESSION ACTIVE : " +
            sessionId
        );

        isScanning = true;

        setTimeout(() => {
           stopperCamera();
        }, 1500);
        
        return;

    }


    // ======================================
    // QR APPRENANT
    // ======================================

    if (data.type === "APPRENANT") {

        if (!sessionId) {

            document.getElementById("status").innerText =
                "⚠️ Scannez d'abord le QR séance";


            isScanning = true;

            return;

        }

        if (!data.qrCode && !data.id) {

            document.getElementById("status").innerText =
                "❌ QR apprenant invalide";

            isScanning = true;

            return;

        }

        if (!data.qrCode) {
            document.getElementById("status").innerText =
                "❌ QR apprenant invalide";

            isScanning = true;

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

        setTimeout(() => {
            enregistrerPresence();
        }, 1500);

        isScanning = true;

        return;

    }

    debug(
        "TYPE QR INCONNU : " +
        data.type
    );

    document.getElementById("status").innerText =
        "❌ Type QR inconnu : " + data.type;

    isScanning = true;

}

// ======================================
// CAMERA
// START
// ======================================

const html5QrCode =
    new Html5Qrcode("reader");

demarrerCamera();

document
    .getElementById("btnScanner")
    .addEventListener(
        "click",
        () => {

            isScanning = true;
            qrApprenant = null;

            document.getElementById("status").innerText =
                "En attente du QR...";

            demarrerCamera();

        }
    );