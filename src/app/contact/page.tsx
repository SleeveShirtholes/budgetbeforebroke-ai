"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Footer from "@/components/Footer";
import Navigation from "@/components/Navigation";
import Card from "@/components/Card";
import Input from "@/components/Forms/Input";
import TextArea from "@/components/Forms/TextArea";
import Button from "@/components/Button";
import { useToast } from "@/components/Toast";

const contactFormSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name is too long"),
  email: z.string().email("Please enter a valid email address"),
  subject: z
    .string()
    .min(1, "Subject is required")
    .max(200, "Subject is too long"),
  message: z
    .string()
    .min(10, "Message must be at least 10 characters")
    .max(2000, "Message is too long"),
});

type ContactFormData = z.infer<typeof contactFormSchema>;

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
  });

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        showToast("Message Sent! " + result.message, {
          type: "success",
        });
        reset(); // Clear the form
      } else {
        showToast(
          result.message || "Failed to send message. Please try again.",
          {
            type: "error",
          },
        );
      }
    } catch (error) {
      console.error("Contact form submission error:", error);
      showToast("Failed to send message. Please try again.", {
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Navigation />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 pt-20 sm:pt-24">
        <div className="space-y-6 sm:space-y-8">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl font-bold text-secondary-900 mb-3 sm:mb-4">
              Contact Us
            </h1>
            <p className="text-base sm:text-lg text-secondary-600 max-w-2xl mx-auto px-2 sm:px-0">
              Have a question, suggestion, or need support? We&apos;d love to
              hear from you. Send us a message and we&apos;ll get back to you as
              soon as possible.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
            {/* Contact Form */}
            <Card>
              <div className="p-4 sm:p-6">
                <h2 className="text-xl sm:text-2xl font-semibold text-secondary-900 mb-4 sm:mb-6">
                  Send us a message
                </h2>

                <form
                  onSubmit={handleSubmit(onSubmit)}
                  className="space-y-4 sm:space-y-6"
                >
                  <Input
                    label="Name"
                    id="name"
                    type="text"
                    placeholder="Your full name"
                    error={errors.name?.message}
                    fullWidth
                    {...register("name")}
                  />

                  <Input
                    label="Email"
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    error={errors.email?.message}
                    fullWidth
                    {...register("email")}
                  />

                  <Input
                    label="Subject"
                    id="subject"
                    type="text"
                    placeholder="What's this about?"
                    error={errors.subject?.message}
                    fullWidth
                    {...register("subject")}
                  />

                  <TextArea
                    label="Message"
                    id="message"
                    placeholder="Tell us more about your question or feedback..."
                    rows={5}
                    error={errors.message?.message}
                    required
                    {...register("message")}
                  />

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    fullWidth
                    isLoading={isSubmitting}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Sending..." : "Send Message"}
                  </Button>
                </form>
              </div>
            </Card>

            {/* Contact Information */}
            <div className="space-y-3 sm:space-y-4 lg:space-y-6">
              <Card>
                <div className="p-4 sm:p-6">
                  <h2 className="text-xl sm:text-2xl font-semibold text-secondary-900 mb-4 sm:mb-6">
                    Get in touch
                  </h2>

                  <div className="space-y-3 sm:space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-primary-100 flex items-center justify-center mt-0.5 sm:mt-1">
                        <svg
                          className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-primary-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-sm sm:text-base font-medium text-secondary-900">
                          Email
                        </h3>
                        <p className="text-sm sm:text-base text-secondary-600 break-words">
                          support@budgetbeforebroke.com
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-primary-100 flex items-center justify-center mt-0.5 sm:mt-1">
                        <svg
                          className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-primary-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-sm sm:text-base font-medium text-secondary-900">
                          Response Time
                        </h3>
                        <p className="text-sm sm:text-base text-secondary-600">
                          Usually within 24 hours
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-primary-100 flex items-center justify-center mt-0.5 sm:mt-1">
                        <svg
                          className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-primary-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-sm sm:text-base font-medium text-secondary-900">
                          Office
                        </h3>
                        <p className="text-sm sm:text-base text-secondary-600">
                          Remote-first team
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              <Card>
                <div className="p-4 sm:p-6">
                  <h3 className="text-base sm:text-lg font-semibold text-secondary-900 mb-3 sm:mb-4">
                    Frequently Asked Questions
                  </h3>
                  <div className="space-y-2 sm:space-y-3">
                    <div>
                      <h4 className="text-sm sm:text-base font-medium text-secondary-800">
                        How secure is my financial data?
                      </h4>
                      <p className="text-xs sm:text-sm text-secondary-600">
                        We use bank-level encryption and never store your
                        banking credentials.
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm sm:text-base font-medium text-secondary-800">
                        Can I export my data?
                      </h4>
                      <p className="text-xs sm:text-sm text-secondary-600">
                        Yes, you can export all your data at any time from your
                        account settings.
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm sm:text-base font-medium text-secondary-800">
                        Is there a mobile app?
                      </h4>
                      <p className="text-xs sm:text-sm text-secondary-600">
                        Our web app is mobile-optimized. Native apps are coming
                        soon!
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 sm:mt-4">
                    <Button variant="text" href="/support">
                      Visit our Help Center →
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
