import {
  Container,
  Head,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface FollowUpEmailProps {
  name: string;
  subject: string;
  message: string;
  supportName: string;
  supportEmail: string;
  conversationId: string;
}

export default function FollowUpEmail({
  name,
  subject,
  message,
  supportName,
  supportEmail,
  conversationId,
}: FollowUpEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Response to your message: {subject}</Preview>
      <Section style={main}>
        <Container style={container}>
          <Text style={heading}>Response to Your Message</Text>
          <Text style={paragraph}>Hi {name},</Text>
          <Text style={paragraph}>
            Thank you for contacting us. Here&apos;s our response to your
            message:
          </Text>
          <Text style={paragraph}>
            <strong>Original Subject:</strong> {subject}
          </Text>
          <Text style={sectionTitle}>Our Response:</Text>
          <Text style={messageText}>{message}</Text>
          <Text style={paragraph}>
            If you have any further questions or need additional assistance,
            please don&apos;t hesitate to reach out to us again.
          </Text>
          <Text style={footer}>
            Best regards,
            <br />
            {supportName}
            <br />
            Support Team
            <br />
            Budget Before Broke
            <br />
            {supportEmail}
          </Text>
          <Text style={conversationIdStyle}>
            Conversation ID: {conversationId}
          </Text>
        </Container>
      </Section>
    </Html>
  );
}

const main = {
  backgroundColor: "#f6f9fc",
  padding: "10px 0",
};

const container = {
  backgroundColor: "#ffffff",
  border: "1px solid #f0f0f0",
  borderRadius: "8px",
  padding: "45px",
  margin: "0 auto",
  maxWidth: "600px",
};

const heading = {
  fontSize: "24px",
  fontWeight: "bold",
  color: "#333",
  marginBottom: "20px",
  textAlign: "center" as const,
};

const paragraph = {
  fontSize: "16px",
  lineHeight: "24px",
  color: "#333",
  marginBottom: "16px",
};

const sectionTitle = {
  fontSize: "18px",
  fontWeight: "bold",
  color: "#333",
  marginTop: "24px",
  marginBottom: "12px",
};

const messageText = {
  fontSize: "16px",
  lineHeight: "24px",
  color: "#333",
  backgroundColor: "#f8f9fa",
  padding: "16px",
  borderRadius: "6px",
  border: "1px solid #e9ecef",
  marginBottom: "20px",
  whiteSpace: "pre-wrap" as const,
};

const footer = {
  fontSize: "14px",
  lineHeight: "20px",
  color: "#666",
  marginTop: "32px",
  paddingTop: "20px",
  borderTop: "1px solid #e9ecef",
};

const conversationIdStyle = {
  fontSize: "12px",
  lineHeight: "16px",
  color: "#999",
  marginTop: "16px",
  textAlign: "center" as const,
  fontStyle: "italic",
};
