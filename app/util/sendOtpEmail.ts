'use server'

import {Resend} from "resend";

const resend = new Resend(process.env.RESEND_API_KEY!);

resend.domains.verify('5e4d5e4d-5e4d-5e4d-5e4d-5e4d5e4d5e4d');

export async function sendOtpEmail(to: string, otp: string) {
    if (!process.env.RESEND_API_KEY) {
        throw new Error("Missing RESEND_API_KEY");
    }

    const subject = "Il tuo codice di verifica";

    // HTML dell’email OTP
    const html = `
      <div style="font-family: Arial; padding: 20px;">
        <h2>Il tuo codice di verifica</h2>
        <p>Usa il seguente codice per completare il login:</p>
        <div style="
          font-size: 32px;
          font-weight: bold;
          letter-spacing: 4px;
          margin: 20px 0;
        ">${otp}</div>
        <p>Il codice scade tra 5 minuti.</p>
        <br/>
        <p style="color: #777">Se non hai richiesto questo codice, ignora questa email.</p>
      </div>
    `;

    const { data, error } = await resend.emails.send({
        from: 'Auth <noreply@resend.dev>',
        to: [to],
        subject,
        html,
    });

    if (error) {
        console.error("Resend error:", error);
        throw new Error("EMAIL_SEND_FAILED");
    }

    // data.id contiene l'id della mail inviata (utile per log)
    return data;
}