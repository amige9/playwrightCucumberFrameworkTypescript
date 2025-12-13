// helper/mailosaur-helper.js

class MailosaurHelper {
    constructor() {
        this.apiKey = process.env.MAILOSAUR_API_KEY;
        this.serverId = process.env.MAILOSAUR_SERVER_ID;
        this.client = null;
        this.emailTimeout = process.env.EMAIL_TIMEOUT;
        this.retryAttempt = process.env.EMAIL_RETRY_ATTEMPTS;
        this.retyDelay = process.env.EMAIL_RETRY_DELAY;

        if (!this.apiKey || !this.serverId) {
            throw new Error('Mailosaur API key or Server ID not configured in environment variables');
        }

        this.initializeClient();
    }

    initializeClient() {
        try {
            const mailosaur = require('mailosaur');
            this.client = new mailosaur(this.apiKey);
        } catch (error) {
            throw new Error(`Failed to initialize Mailosaur client: ${error.message}`);
        }
    }

    generateTestEmail(identifier = 'test') {
        const timestamp = Date.now();
        return `${identifier}-${timestamp}@${this.serverId}.mailosaur.net`;
    }

    async waitForEmail(emailAddress, timeout = 60000) {
        if (!this.client) {
            throw new Error('Mailosaur client not initialized');
        }

        try {
            console.log(`⏳ Waiting for email to: ${emailAddress}`);
            const email = await this.client.messages.get(
                this.serverId,
                {
                    sentTo: emailAddress
                },
                {
                    timeout: timeout
                }
            );
            console.log(`✅ Email received: ${email.subject}`);
            return email;
        } catch (error) {
            throw new Error(`Failed to retrieve email: ${error.message}`);
        }
    }

    async extractLinkFromEmail(email, pattern = /https?:\/\/[^\s<>"']+/g) {
        const htmlContent = email.html?.body || '';
        const textContent = email.text?.body || '';

        const links = [...htmlContent.matchAll(pattern), ...textContent.matchAll(pattern)];
        return links.length > 0 ? links[0][0] : null;
    }


    extractCodeFromEmail(email) {
        const htmlContent = email.html?.body || '';
        const textContent = email.text?.body || '';
        const fullContent = htmlContent + ' ' + textContent;d

        console.log('🔍 Looking for OTP in email content...');

        // Simple patterns for alphanumeric codes (5-8 characters)
        const patterns = [
            // Pattern 1: Content inside h3 tags (your specific case)
            /<h3[^>]*>([a-zA-Z0-9]{5,8})<\/h3>/,

            // Pattern 2: Any alphanumeric code after "token" or "OTP"
            /(?:token|otp)[^a-zA-Z0-9]*([a-zA-Z0-9]{5,8})/i,

            // Pattern 3: Any isolated alphanumeric code (5-8 chars)
            /\b([a-zA-Z0-9]{5,8})\b/
        ];

        for (let i = 0; i < patterns.length; i++) {
            console.log(`🔍 Trying pattern ${i + 1}`);
            const match = fullContent.match(patterns[i]);

            if (match) {
                const code = match[1];
                console.log(`🎯 Found potential code: "${code}"`);

                // Simple validation: not common HTML/CSS words
                if (!this.isCommonWord(code)) {
                    console.log(`✅ Valid OTP found: ${code}`);
                    return code;
                }
            }
        }

        console.log('❌ No OTP found');
        return null;
    }

    // Simple filter for common words
    isCommonWord(code) {
        const excludeWords = [
            'style', 'width', 'height', 'margin', 'center', 'right', 'solid',
            'color', '2025', 'email', 'token', 'valid', 'arial', 'auto'
        ];
        return excludeWords.includes(code.toLowerCase());
    }

    // Add this method specifically for Airgate emails
    extractAirgateOTP(email) {
        const htmlContent = email.html?.body || '';

        console.log('🔍 Looking for Airgate OTP in HTML content');

        // Your specific pattern - OTP is in an h3 tag after "Validation Token"
        const h3Pattern = /<h3[^>]*>([^<]+)<\/h3>/g;
        const h3Matches = [...htmlContent.matchAll(h3Pattern)];

        console.log('🔍 All h3 matches found:', h3Matches.map(m => m[1]));

        for (const match of h3Matches) {
            const content = match[1].trim();
            console.log(`🎯 Checking h3 content: "${content}"`);

            // Skip "Validation Token" and look for the actual token
            if (content !== 'Validation Token' &&
                /^[a-zA-Z0-9]{5,8}$/.test(content) &&
                content.toLowerCase() !== 'validation') {

                console.log(`✅ Found Airgate OTP: ${content}`);
                return content;
            }
        }

        console.log('❌ No Airgate OTP found');
        return null;
    }

  
    async deleteAllEmails() {
        if (!this.client) {
            console.warn('Mailosaur client not initialized, skipping email cleanup');
            return;
        }

        try {
            await this.client.messages.deleteAll(this.serverId);
        } catch (error) {
            console.warn(`Failed to delete emails: ${error.message}`);
        }
    }
}

module.exports = MailosaurHelper;