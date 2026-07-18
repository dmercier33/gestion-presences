import { validatePresence } from "./api.js";

console.log("scanner v0.8.0");

// ======================================
// ETAT APPLICATION
// ======================================

let sessionId = null;
let qrApprenant = null;
let isScanning = true;
let presenceEnCours = false;

// secours mémoire locale

const ancienneSession =
    localStorage.getItem("sessionId");

if (
    ancienneSession &&
    ancienneSession !== "undefined" &&
    ancienneSession !== "null"
) {
    sessionId = ancienneSession;
}


debug(
    "SESSION AU CHARGEMENT :\n" +
    sessionId
);

// ======================================
// DEBUG
// ======================================

function debug(message) {

    document.getElementById("debug").innerText +=
        "\n" + message;

}

// ======================================
// PRESENCE
// ======================================

console.log("SESSION AVANT ENVOI :", sessionId);
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


        if (result.status === "ok") {

            succès

        }

        else if (result.error === "Already registered") {

            doublon

        }

        else if (result.error === "Apprenant introuvable") {

            QR inconnu

        }

        else {

            erreur générale

        }


        qrApprenant = null;

    }

    catch (error) {

        document.getElementById("status").innerText =
            "❌ " + error.message;

    }

    finally {

        presenceEnCours = false;

    }

}


// ======================================
// SCAN QR
// ======================================


function onScanSuccess(decodedText) {


    if (!isScanning) {
        return;

    }


    isScanning = false;

    let data = null;


    // ======================================
    // Lecture QR normalisée
    // ======================================

    try {
        data = JSON.parse(decodedText);
    }

    catch (e) {


        // ======================================
        // Compatibilité anciens QR apprenant
        // ======================================

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





    // ======================================
    // Contrôle type QR
    // ======================================


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


            debug(
                "SESSION INVALIDE"
            );


            document.getElementById("status").innerText =
                "❌ Session invalide";


            isScanning = true;

            return;


        }



        sessionId =
            data.sessionId;



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



        if (qrApprenant) {


            enregistrerPresence();


        }



        isScanning = true;

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


            debug(
                "APPRENANT SANS IDENTITE"
            );


            document.getElementById("status").innerText =
                "❌ QR apprenant invalide";


            isScanning = true;

            return;


        }



        qrApprenant =
            data.qrCode || data.id;



        document.getElementById("status").innerText =
            "✅ Apprenant reconnu\n" +
            qrApprenant +
            "\nSession : " +
            sessionId;



        debug(
            "QR APPRENANT : " +
            qrApprenant
        );



        if (sessionId) {


            enregistrerPresence();


        }

        else {


            document.getElementById("status").innerText +=
                "\n⚠️ En attente de la session";


        }



        isScanning = true;

        return;


    }






    // ======================================
    // Type inconnu
    // ======================================


    debug(
        "TYPE QR INCONNU : " +
        data.type
    );


    document.getElementById("status").innerText =
        "❌ Type QR inconnu";


    isScanning = true;



}





// ======================================
// CAMERA
// ======================================


const html5QrCode =
    new Html5Qrcode("reader");



html5QrCode.start(

    {

        facingMode: "environment"

    },

    {

        fps: 10,

        qrbox: 250

    },

    onScanSuccess

)


    .catch(err => {


        console.error(
            "Erreur caméra",
            err
        );


        document.getElementById("status").innerText =
            "Erreur caméra : " + err;


    });

