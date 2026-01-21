import { Resend } from 'resend';
import logger from './logger';

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendEmailOptions {
    email: string;
    subject: string;
    message: string;
    html?: string;
}

export const sendEmail = async (options: SendEmailOptions) => {
    try {
        const { data, error } = await resend.emails.send({
            from: process.env.RESEND_FROM_EMAIL || 'REstart Support <support@letsrestart.in>',
            to: options.email,
            subject: options.subject,
            text: options.message,
            html: options.html || options.message,
        });

        if (error) {
            logger.error('Resend email error:', error);
            throw new Error('Email could not be sent');
        }

        return data;
    } catch (error: any) {
        logger.error('Email sending failed:', error.message);
        throw new Error('Email could not be sent');
    }
};
