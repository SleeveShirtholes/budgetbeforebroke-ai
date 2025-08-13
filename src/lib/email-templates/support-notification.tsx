import {
  Container,
  Head,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface SupportNotificationEmailProps {
  submissionId: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
}

export default function SupportNotificationEmail({
  submissionId,
  name,
  email,
  subject,
  message,
  ipAddress,
  userAgent,
  timestamp,
}: SupportNotificationEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>New contact form submission: {subject}</Preview>
      <Section style={main}>
        <Container style={container}>
          <Text style={heading}>New Contact Form Submission</Text>

          <Text style={sectionTitle}>Submission Details</Text>
          <Text style={detailRow}>
            <strong>ID:</strong> {submissionId}
          </Text>
          <Text style={detailRow}>
            <strong>From:</strong> {name} ({email})
          </Text>
          <Text style={detailRow}>
            <strong>Subject:</strong> {subject}
          </Text>
          <Text style={detailRow}>
            <strong>Submitted:</strong> {timestamp}
          </Text>

          {ipAddress && (
            <Text style={detailRow}>
              <strong>IP Address:</strong> {ipAddress}
            </Text>
          )}

          {userAgent && (
            <Text style={detailRow}>
              <strong>User Agent:</strong> {userAgent}
            </Text>
          )}

          <Text style={sectionTitle}>Message</Text>
          <Text style={messageText}>{message}</Text>

          <Text style={footer}>
            This is an automated notification from your contact form system.
            Please respond to the user at {email} and update the submission
            status in your admin panel.
          </Text>
        </Container>
      </Section>
    </Html>
  );
}

const main = {
  backgroundColor: "#ffffff",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: "0 auto",
  padding: "20px 0 48px",
  maxWidth: "600px",
};

const heading = {
  fontSize: "24px",
  letterSpacing: "-0.5px",
  lineHeight: "1.3",
  fontWeight: "600",
  color: "#1f2937",
  padding: "17px 0 0",
  marginBottom: "20px",
};

const sectionTitle = {
  fontSize: "18px",
  fontWeight: "600",
  color: "#374151",
  marginTop: "24px",
  marginBottom: "12px",
  borderBottom: "2px solid #e5e7eb",
  paddingBottom: "8px",
};

const detailRow = {
  margin: "8px 0",
  fontSize: "14px",
  lineHeight: "1.5",
  color: "#4b5563",
};

const messageText = {
  margin: "16px 0",
  fontSize: "14px",
  lineHeight: "1.6",
  color: "#374151",
  backgroundColor: "#f9fafb",
  padding: "16px",
  borderRadius: "6px",
  border: "1px solid #e5e7eb",
  whiteSpace: "pre-wrap",
};

const footer = {
  color: "#6b7280",
  fontSize: "12px",
  lineHeight: "1.5",
  marginTop: "24px",
  padding: "16px",
  backgroundColor: "#f3f4f6",
  borderRadius: "6px",
  border: "1px solid #e5e7eb",
};
