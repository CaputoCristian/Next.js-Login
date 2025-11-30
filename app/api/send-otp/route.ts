export const runtime = 'nodejs'; // forza Node runtime
import { sendOtpEmail } from '@/app/util/sendOtpEmail';

export async function POST(req: Request) {
    const { email, otp } = await req.json();
    //TODO rimosso per fase di test
    // await sendOtpEmail(email, otp);
    return new Response(null, { status: 200 });
}