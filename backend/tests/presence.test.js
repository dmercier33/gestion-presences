import { describe, test, expect } from "vitest";
import request from "supertest";
import app from "../app.js";

import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();


const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);



describe("Presences API", () => {


  test("un apprenant ne peut pas être enregistré deux fois sur une session", async () => {


    // 1 - créer une session

    const sessionResponse = await request(app)
      .post("/sessions")
      .send({
        duration_minutes: 120
      });


    expect(sessionResponse.status).toBe(200);


    const sessionId = sessionResponse.body.sessionId;



    // 2 - récupérer un apprenant existant

    const { data: apprenant } = await supabase
      .from("apprenants")
      .select("qr_code")
      .limit(1)
      .single();


    expect(apprenant).toBeDefined();



    const qrCode = apprenant.qr_code;



    // 3 - premier scan

    const firstScan = await request(app)
      .post("/api/presences")
      .send({
        sessionId,
        apprenantId: qrCode
      });


    expect(firstScan.status).toBe(200);



    // 4 - deuxième scan identique

    const secondScan = await request(app)
      .post("/api/presences")
      .send({
        sessionId,
        apprenantId: qrCode
      });



    expect(secondScan.status)
      .toBe(409);


    expect(secondScan.body.error)
      .toBe("Already registered");


  });


});

test("une session inconnue est refusée", async () => {


  // Récupérer un QR apprenant valide

  const { data: apprenant } = await supabase
    .from("apprenants")
    .select("qr_code")
    .limit(1)
    .single();


  expect(apprenant).toBeDefined();



  const response = await request(app)
    .post("/api/presences")
    .send({
      sessionId: "SESSION_INEXISTANTE",
      apprenantId: apprenant.qr_code
    });



  expect(response.status)
    .toBe(404);


  expect(response.body.error)
    .toBe("Session not found");


});

test("un QR apprenant inconnu est refusé", async () => {


  // Créer une session valide

  const sessionResponse = await request(app)
    .post("/sessions")
    .send({
      duration_minutes: 120
    });


  expect(sessionResponse.status)
    .toBe(200);



  const response = await request(app)
    .post("/api/presences")
    .send({
      sessionId: sessionResponse.body.sessionId,
      apprenantId: "FAUX_QR_TEST_12345"
    });



  expect(response.status)
    .toBe(404);


  expect(response.body.error)
    .toBe("Apprenant introuvable");


});

test("refuse une présence sur une session expirée", async () => {

  // création session
  const sessionResponse = await request(app)
    .post("/sessions")
    .send({
      duration_minutes: 120
    });

  const sessionId = sessionResponse.body.sessionId;


  // on force l'expiration dans le passé
  await supabase
    .from("sessions")
    .update({
      expires_at: new Date(Date.now() - 60000)
    })
    .eq("id", sessionId);


  // tentative de scan
  const response = await request(app)
    .post("/api/presences")
    .send({
      sessionId,
      apprenantId: "UN_QR_TEST"
    });


  expect(response.status).toBe(403);
  expect(response.body.error).toBe("Session expired");

});