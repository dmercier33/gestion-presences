import { describe, test, expect } from "vitest";
import request from "supertest";
import app from "../app.js";

import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

import { testFormation } from "./helpers.js";

dotenv.config();


const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);


describe("Sessions API", () => {

  test("création d'une nouvelle session", async () => {

    const response = await request(app)
      .post("/sessions")
      .send({
        duration_minutes: 120
      });


    expect(response.status).toBe(200);

    expect(response.body.sessionId)
      .toBeDefined();

    expect(response.body.token)
      .toBeDefined();

    expect(response.body.expires_at)
      .toBeDefined();

  });

});

test("une nouvelle session désactive l'ancienne", async () => {

  // Création session A
  const firstResponse = await request(app)
    .post("/sessions")
    .send({
      duration_minutes: 120
    });


  expect(firstResponse.status).toBe(200);


  const firstSessionId = firstResponse.body.sessionId;



  // Création session B
  const secondResponse = await request(app)
    .post("/sessions")
    .send({
      duration_minutes: 120
    });


  expect(secondResponse.status).toBe(200);


  const secondSessionId = secondResponse.body.sessionId;



  // Vérification en base Supabase
  const { data: sessions, error } = await supabase
    .from("sessions")
    .select("id, active")
    .in("id", [
      firstSessionId,
      secondSessionId
    ]);

    console.log(sessions);

  expect(error).toBeNull();


  const oldSession = sessions.find(
    s => s.id === firstSessionId
  );


  const newSession = sessions.find(
    s => s.id === secondSessionId
  );


  expect(oldSession.active)
    .toBe(false);


  expect(newSession.active)
    .toBe(true);

});