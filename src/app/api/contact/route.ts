import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const contactFormSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name is too long"),
  email: z.string().email("Please enter a valid email address"),
  subject: z.string().min(1, "Subject is required").max(200, "Subject is too long"),
  message: z.string().min(10, "Message must be at least 10 characters").max(2000, "Message is too long"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate the form data
    const validatedData = contactFormSchema.parse(body);
    
    // Log the contact form submission (in a real app, you'd save to database or send email)
    console.log("Contact form submission:", {
      ...validatedData,
      timestamp: new Date().toISOString(),
      ip: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown",
    });

    // In a real application, you would:
    // 1. Save the contact form submission to your database
    // 2. Send an email notification to your support team
    // 3. Send a confirmation email to the user
    
    // For now, we'll simulate a successful submission
    // You can integrate with services like Resend, SendGrid, or similar
    
    // Simulate some processing time
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return NextResponse.json(
      { 
        success: true, 
        message: "Thank you for your message! We'll get back to you within 24 hours." 
      },
      { status: 200 }
    );
    
  } catch (error) {
    console.error("Contact form error:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: "Please check your form data",
          errors: error.errors,
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong. Please try again later.",
      },
      { status: 500 }
    );
  }
}