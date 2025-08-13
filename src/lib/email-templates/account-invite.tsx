import {
  Button,
  Container,
  Head,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface AccountInviteEmailProps {
  inviterName: string;
  accountName: string;
  inviteUrl: string;
}

export default function AccountInviteEmail({
  inviterName,
  accountName,
  inviteUrl,
}: AccountInviteEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>
        You&apos;ve been invited to join {accountName} on Budget Before Broke
      </Preview>
      <Section style={main}>
        <Container style={container}>
          <Text style={heading}>You&apos;ve Been Invited!</Text>
          <Text style={paragraph}>
            {inviterName} has invited you to join {accountName} on Budget Before
            Broke.
          </Text>
          <Text style={paragraph}>
            Click the button below to accept the invitation and join the
            account.
          </Text>
          <Button style={button} href={inviteUrl}>
            Accept Invitation
          </Button>
          <Text style={paragraph}>
            If you didn&apos;t expect this invitation, you can safely ignore
            this email.
          </Text>
          <Text style={footer}>This invitation will expire in 7 days.</Text>
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

const button = {
  backgroundColor: "#4F46E5",
  borderRadius: "5px",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "block",
  width: "100%",
  padding: "10px",
};

const footer = {
  color: "#898989",
  fontSize: "14px",
  lineHeight: "22px",
  marginTop: "12px",
  marginBottom: "24px",
};
