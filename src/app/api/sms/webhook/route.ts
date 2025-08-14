import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { validateTwilioSignature } from "@/lib/twilio";
import { processSmsMessage } from "@/lib/sms-processor";

export async function POST(request: NextRequest) {
  try {
    const headersList = await headers();
    const twilioSignature = headersList.get("x-twilio-signature");

    if (!twilioSignature) {
      return NextResponse.json(
        { error: "Missing Twilio signature" },
        { status: 401 },
      );
    }

    const body = await request.text();
    const url = new URL(request.url);

    // Validate that the request came from Twilio
    const isValid = validateTwilioSignature(
      twilioSignature,
      url.toString(),
      body,
    );

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid Twilio signature" },
        { status: 401 },
      );
    }

    // Parse the form data from Twilio webhook
    const formData = new URLSearchParams(body);
    const smsData = {
      From: formData.get("From"),
      To: formData.get("To"),
      Body: formData.get("Body"),
      MessageSid: formData.get("MessageSid"),
    };

    if (!smsData.From || !smsData.Body) {
      return NextResponse.json(
        { error: "Missing required SMS data" },
        { status: 400 },
      );
    }

    // Process the SMS message and generate response
    const responseMessage = await processSmsMessage(smsData);

    // Return TwiML response
    const twimlResponse = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>${responseMessage}</Message>
</Response>`;

    return new NextResponse(twimlResponse, {
      status: 200,
      headers: {
        "Content-Type": "text/xml",
      },
    });
  } catch (error) {
    console.error("SMS webhook error:", error);

    const errorResponse = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>Sorry, I encountered an error processing your message. Please try again or send "help" for assistance.</Message>
</Response>`;

    return new NextResponse(errorResponse, {
      status: 200,
      headers: {
        "Content-Type": "text/xml",
      },
    });
  }
}
