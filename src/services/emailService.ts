import sgMail from '@sendgrid/mail';
import { ReservationDetails } from '../types';

// Initialize SendGrid with API key from environment variables
sgMail.setApiKey(process.env.VITE_SENDGRID_API_KEY || '');

export const sendReservationConfirmation = async (details: ReservationDetails) => {
  const msg = {
    to: details.customerEmail,
    from: process.env.VITE_SENDGRID_FROM_EMAIL || 'noreply@shakeyspizza.com',
    subject: `Your Reservation Confirmation - ${details.date} at ${details.time}`,
    text: `
      Thank you for your reservation at Shakey's Pizza!
      
      Reservation Details:
      Date: ${details.date}
      Time: ${details.time}
      Party Size: ${details.numPeople} people
      ${details.notes ? `Notes: ${details.notes}\n` : ''}
      Reservation ID: ${details.reservationId}
      
      We look forward to serving you!
      
      Best regards,
      The Shakey's Pizza Team
    `,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Thank you for your reservation at Shakey's Pizza!</h2>
        
        <p><strong>Reservation Details:</strong></p>
        <p>Date: ${details.date}<br>
        Time: ${details.time}<br>
        Party Size: ${details.numPeople} people<br>
        ${details.notes ? `Notes: ${details.notes}<br>` : ''}
        Reservation ID: ${details.reservationId}</p>
        
        <p>We look forward to serving you!</p>
        
        <p>Best regards,<br>
        The Shakey's Pizza Team</p>
      </div>
    `,
  };

  try {
    await sgMail.send(msg);
    console.log('Reservation confirmation email sent');
  } catch (error) {
    console.error('Error sending reservation confirmation email:', error);
    throw new Error('Failed to send reservation confirmation email');
  }
};

export const sendReservationCancellation = async (details: ReservationDetails) => {
  const msg = {
    to: details.customerEmail,
    from: process.env.VITE_SENDGRID_FROM_EMAIL || 'noreply@shakeyspizza.com',
    subject: `Your Reservation Has Been Cancelled`,
    text: `
      Your reservation at Shakey's Pizza has been cancelled.
      
      Cancelled Reservation Details:
      Date: ${details.date}
      Time: ${details.time}
      Party Size: ${details.numPeople} people
      Reservation ID: ${details.reservationId}
      
      We're sorry to see you go. If this was a mistake or you'd like to reschedule, please contact us.
      
      Best regards,
      The Shakey's Pizza Team
    `,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Your reservation at Shakey's Pizza has been cancelled</h2>
        
        <p><strong>Cancelled Reservation Details:</strong></p>
        <p>Date: ${details.date}<br>
        Time: ${details.time}<br>
        Party Size: ${details.numPeople} people<br>
        Reservation ID: ${details.reservationId}</p>
        
        <p>We're sorry to see you go. If this was a mistake or you'd like to reschedule, please contact us.</p>
        
        <p>Best regards,<br>
        The Shakey's Pizza Team</p>
      </div>
    `,
  };

  try {
    await sgMail.send(msg);
    console.log('Reservation cancellation email sent');
  } catch (error) {
    console.error('Error sending cancellation email:', error);
    throw new Error('Failed to send cancellation email');
  }
};
