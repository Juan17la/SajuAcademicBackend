export class EmailService {
  async sendPasswordResetEmail(email: string, token: string): Promise<void> {
    // PENDING: Email service not configured
    console.log(`[EMAIL STUB] Password reset email to ${email} with token ${token}`);
  }

  async sendWelcomeEmail(email: string, firstName: string): Promise<void> {
    // PENDING: Email service not configured
    console.log(`[EMAIL STUB] Welcome email to ${email}`);
  }
}
