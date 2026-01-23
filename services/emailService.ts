
/**
 * Simulates sending an email notification to the administrator.
 * In a real-world scenario, this would call a backend API that triggers an email via SendGrid, SES, etc.
 */
export const notifyAdminByEmail = (subject: string, body: string) => {
  console.log("%c[ADMIN EMAIL NOTIFICATION]", "color: #facc15; font-weight: bold; background-color: #050810; padding: 2px 4px;");
  console.log(`Subject: ${subject}`);
  console.log(`Body: ${body}`);
  console.log("-----------------------------------------");
};
