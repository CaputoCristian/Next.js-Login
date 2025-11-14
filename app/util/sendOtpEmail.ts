import nodemailer from "nodemailer";

export async function sendOtpEmail(to: string, otp: string) {
    try {
        // Viene creato un transporter Simple Mail Transfer Protocol (SMTP)
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST!,
            port: Number(process.env.SMTP_PORT!),
            secure: false, // La connessione sulla porta 587 è già sicura di suo
            auth: {
                user: process.env.SMTP_USER!,
                pass: process.env.SMTP_PASS!,
            },
        });

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

        // Invia la mail
        await transporter.sendMail({
            from: `"Node.js Auth" <${process.env.SMTP_USER!}>`,
            to,
            subject: "Il tuo codice OTP per accedere",
            html,
        });

        console.log("OTP email inviato a", to);
    } catch (err) {
        console.error("Errore nell'invio dell OTP:", err);
        throw new Error("EMAIL_SEND_FAILED");
    }
}