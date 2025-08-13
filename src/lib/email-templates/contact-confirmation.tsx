import {
  Container,
  Head,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface ContactConfirmationEmailProps {
  name: string;
  subject: string;
  message: string;
}

export default function ContactConfirmationEmail({
  name,
  subject,
  message,
}: ContactConfirmationEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>We&apos;ve received your message: {subject}</Preview>
      <Section style={main}>
        <Container style={container}>
          <Text style={heading}>Thank you for contacting us!</Text>
          <Text style={paragraph}>Hi {name},</Text>
          <Text style={paragraph}>
            We&apos;ve received your message and will get back to you within 24
            hours.
          </Text>
          <Text style={paragraph}>
            <strong>Subject:</strong> {subject}
          </Text>
          <Text style={paragraph}>
            <strong>Your message:</strong>
          </Text>
          <Text style={messageText}>{message}</Text>
          <Text style={paragraph}>
            If you have any urgent questions, please don&apos;t hesitate to
            reach out again.
          </Text>
          <Text style={footer}>
            Best regards,
            <br />
            The Budget Before Broke Team
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
  maxWidth: "560px",
};

const heading = {
  fontSize: "24px",
  letterSpacing: "-0.5px",
  lineHeight: "1.3",
  fontWeight: "400",
  color: "#484848",
  padding: "17px 0 0",
};

const paragraph = {
  margin: "0 0 15px",
  fontSize: "15px",
  lineHeight: "1.4",
  color: "#3c4149",
};

const messageText = {
  margin: "0 0 15px",
  fontSize: "15px",
  lineHeight: "1.4",
  color: "#3c4149",
  backgroundColor: "#f8f9fa",
  padding: "15px",
  borderRadius: "5px",
  border: "1px solid #e9ecef",
};

const footer = {
  color: "#898989",
  fontSize: "14px",
  lineHeight: "22px",
  marginTop: "12px",
  marginBottom: "24px",
};
