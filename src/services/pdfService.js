'use strict';

const { jsPDF } = require('jspdf');
const { Buffer } = require('buffer');

const generatePDF = (booking, train, user) => {
    const doc = new jsPDF();

    doc.setLineWidth(0.5);
    doc.setDrawColor(0, 0, 0);
    doc.roundedRect(10, 35, 190, 120, 3, 3);

    doc.setFontSize(16);
    doc.setTextColor(0, 51, 153);
    doc.text('Indian Railways E-Ticket', 105, 45, { align: 'center' });

    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);

    doc.text(`Passenger Name: ${user.username}`, 20, 60);
    doc.text(`Booking Status: ${booking.status}`, 20, 70);

    doc.text(`Train: ${train.name} (${train.trainNumber})`, 20, 80);
    doc.text(`Source: ${train.source}`, 20, 90);
    doc.text(`Destination: ${train.destination}`, 20, 100);

    doc.text('Journey Date', 20, 110);
    doc.text(':', 50, 110);
    doc.text(`${booking.journeyDate}`, 55, 110);

    doc.text('Coach Number', 20, 120);
    doc.text(':', 50, 120);
    doc.text(`${booking.coachNumber}`, 55, 120);

    doc.text('Seat Number', 20, 130);
    doc.text(':', 50, 130);
    doc.text(`${booking.seatNumber}`, 55, 130);

    doc.text('Coach Type', 20, 140);
    doc.text(':', 50, 140);
    doc.text(`${booking.coachType}`, 55, 140);

    doc.text('Fare', 20, 150);
    doc.text(':', 50, 150);
    doc.text(`${booking.price}`, 55, 150);

    doc.setFontSize(12);
    doc.setTextColor(0, 51, 153);
    doc.text('Have a Comfortable and Safe Journey!', 105, 165, {
        align: 'center',
    });

    const pdfOutput = doc.output('arraybuffer');
    return Buffer.from(pdfOutput);
};

module.exports = generatePDF;
