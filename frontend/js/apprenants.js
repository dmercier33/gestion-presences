async function genererQR(id) {

    const response = await fetch("/apprenants/" + id + "/qr", {
        method: "POST"
    });

    const data = await response.json();

    if (data.qr_code) {

        const zoneQR = document.getElementById("qr-" + id);

        zoneQR.innerHTML = "";

        new QRCode(zoneQR, {
            text: data.qr_code,
            width: 180,
            height: 180
        });

    }

}