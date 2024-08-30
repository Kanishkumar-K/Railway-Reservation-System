'use strict';

const nodemailer = require('nodemailer');
const generatePDF = require('./pdfService');
const moment = require('moment-timezone');

const sendBookingConfirmationEmail = async (user, train, booking) => {
    const transporter = nodemailer.createTransport({
        host: process.env.HOST,
        port: process.env.PORT2,
        auth: {
            user: process.env.USER,
            pass: process.env.PASS,
        },
        secure: false,
        tls: {
            rejectUnauthorized: false,
        },
    });

    const pdfBuffer = await generatePDF(booking, train, user);

    const journeyDate = moment(booking.journeyDate)
        .tz('Asia/Kolkata')
        .format('DD MMM YYYY');
    const departureTime = moment(train.departureTime)
        .tz('Asia/Kolkata')
        .format('HH:mm');
    const arrivalTime = moment(train.arrivalTime)
        .tz('Asia/Kolkata')
        .format('HH:mm');

    const mailOptions = {
        from: 'mailtrap@demomailtrap.com',
        to: user.email,
        subject: 'Booking Confirmation',
        html: `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        background-color: #f4f4f4;
                        margin: 0;
                        padding: 0;
                    }
                    .container {
                        width: 80%;
                        margin: 0 auto;
                        background-color: #ffffff;
                        padding: 20px;
                        border-radius: 8px;
                        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                    }
                    .header {
                        background-color: #007BFF;
                        color: #ffffff;
                        padding: 10px 20px;
                        border-radius: 8px 8px 0 0;
                        text-align: center;
                    }
                    .content {
                        padding: 20px;
                    }
                    .footer {
                        text-align: center;
                        padding: 10px 20px;
                        font-size: 14px;
                        color: #777777;
                        border-top: 1px solid #eeeeee;
                    }
                    .highlight {
                        color: #007BFF;
                        font-weight: bold;
                    }
                    .info {
                        margin: 10px 0;
                    }
                    .info span {
                        display: inline-block;
                        width: 150px;
                        font-weight: bold;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        Booking Confirmation
                    </div>
                    <div class="content">
                        <p>Dear <span class="highlight">${user.username}</span>,</p>
                        <p>Your booking is ${booking.status}</p>
                        <div class="info">
                            <span>Train Name:</span> ${train.name}
                        </div>
                        <div class="info">
                            <span>Train Number:</span> ${train.trainNumber}
                        </div>
                        <div class="info">
                            <span>Source:</span> ${train.source}
                        </div>
                        <div class="info">
                            <span>Destination:</span> ${train.destination}
                        </div>
                        <div class="info">
                            <span>Journey Date:</span> ${journeyDate}
                        </div>
                        <div class="info">
                            <span>Departure Time:</span> ${train.departureTime}
                        </div>
                        <div class="info">
                            <span>Arrival Time:</span> ${train.arrivalTime}
                        </div>
                        <div class="info">
                            <span>Coach Number:</span> ${booking.coachNumber}
                        </div>
                        <div class="info">
                            <span>Seat Number:</span> ${booking.seatNumber}
                        </div>
                        <div class="info">
                            <span>Coach Type:</span> ${booking.coachType}
                        </div>
                        <div class="info">
                            <span>Status:</span> ${booking.status}
                        </div>
                        <div class="info">
                            <span>Ticket Fare:</span> ₹ ${booking.price}
                        </div>
                        <p>Have a Comfortable and Safe Journey!</p>
                    </div>
                </div>
            </body>
            </html>`,
        attachments: [
            {
                filename: 'eTicket.pdf',
                content: pdfBuffer,
                encoding: 'base64',
            },
        ],
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Booking confirmation email sent successfully.');
    } catch (error) {
        console.error(
            'Error sending booking confirmation email:',
            error.message
        );
    }
};

module.exports = sendBookingConfirmationEmail;
