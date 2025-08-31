// controllers/ticketController.js
const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');
const Booking = require('../models/Booking');
const fs = require('fs');
const path = require('path');

// Generate and download ticket PDF
exports.downloadTicket = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const userId = req.user.id;

    // Fetch booking with populated data
    const booking = await Booking.findById(bookingId)
      .populate('event', 'title date location category price capacity images')
      .populate('user', 'firstName lastName email');

    if (!booking) {
      return res.status(404).json({ 
        success: false, 
        message: 'Booking not found' 
      });
    }

    // Authorization check
    if (booking.user._id.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Unauthorized access' 
      });
    }

    // Check if booking is confirmed
    if (booking.status !== 'confirmed') {
      return res.status(400).json({ 
        success: false, 
        message: 'Ticket can only be downloaded for confirmed bookings' 
      });
    }

    // Generate QR Code for ticket verification
    const qrData = JSON.stringify({
      bookingId: booking._id,
      eventId: booking.event._id,
      bookingReference: booking.bookingReference,
      userId: booking.user._id,
      tickets: booking.quantity,
      timestamp: new Date().toISOString()
    });

    const qrCodeDataURL = await QRCode.toDataURL(qrData, { 
      width: 200,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    // Create PDF document
    const doc = new PDFDocument({ 
      size: 'A4', 
      margin: 50,
      info: {
        Title: `Event Ticket - ${booking.bookingReference}`,
        Author: 'Event Platform',
        Subject: 'Event Ticket',
        Keywords: 'event, ticket, booking'
      }
    });

    // Set response headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="Ticket_${booking.bookingReference}.pdf"`);

    // Pipe PDF to response
    doc.pipe(res);

    // Document styling
    const primaryColor = '#3B82F6';
    const textColor = '#1F2937';
    const accentColor = '#10B981';

    // Header with gradient background
    doc.rect(0, 0, doc.page.width, 150)
       .fillAndStroke('#F3F4F6', '#E5E7EB');

    // Logo/Brand area (if you have a logo)
    doc.fontSize(28)
       .fillColor(primaryColor)
       .text('EVENT PLATFORM', 50, 40, { align: 'center' })
       .fontSize(14)
       .fillColor('#6B7280')
       .text('Your Digital Event Ticket', 50, 75, { align: 'center' });

    // Ticket border
    doc.rect(30, 120, doc.page.width - 60, 500)
       .stroke('#D1D5DB');

    // Event Title
    doc.fontSize(22)
       .fillColor(textColor)
       .text(booking.event.title, 50, 160, { 
         width: doc.page.width - 200,
         align: 'left'
       });

    // Booking Reference (prominent)
    doc.fontSize(12)
       .fillColor('#6B7280')
       .text('BOOKING REFERENCE', 50, 200)
       .fontSize(16)
       .fillColor(primaryColor)
       .text(`#${booking.bookingReference}`, 50, 215);

    // Event Details Section
    const detailsStartY = 260;
    
    doc.fontSize(14)
       .fillColor('#374151')
       .text('EVENT DETAILS', 50, detailsStartY)
       .fontSize(12)
       .fillColor('#6B7280');

    // Date and Time
    const eventDate = new Date(booking.event.date);
    doc.text(`Date: ${eventDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })}`, 50, detailsStartY + 25);

    doc.text(`Time: ${eventDate.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })}`, 50, detailsStartY + 45);

    // Location
    doc.text(`Location: ${booking.event.location}`, 50, detailsStartY + 65);

    // Category
    doc.text(`Category: ${booking.event.category.toUpperCase()}`, 50, detailsStartY + 85);

    // Attendee Information
    doc.fontSize(14)
       .fillColor('#374151')
       .text('ATTENDEE INFORMATION', 50, detailsStartY + 120)
       .fontSize(12)
       .fillColor('#6B7280');

    let attendeeY = detailsStartY + 145;
    booking.attendeeInfo.forEach((attendee, index) => {
      doc.text(`${index + 1}. ${attendee.name}`, 50, attendeeY);
      doc.text(`   Email: ${attendee.email}`, 50, attendeeY + 15);
      if (attendee.phone) {
        doc.text(`   Phone: ${attendee.phone}`, 50, attendeeY + 30);
        attendeeY += 60;
      } else {
        attendeeY += 45;
      }
    });

    // Ticket Quantity and Price
    doc.fontSize(14)
       .fillColor('#374151')
       .text('TICKET INFORMATION', 50, attendeeY + 20)
       .fontSize(12)
       .fillColor('#6B7280')
       .text(`Quantity: ${booking.quantity} ticket${booking.quantity > 1 ? 's' : ''}`, 50, attendeeY + 45)
       .text(`Total Amount: INR ${booking.totalAmount.toLocaleString()}`, 50, attendeeY + 65);

    // QR Code section
    const qrBuffer = Buffer.from(qrCodeDataURL.split(',')[1], 'base64');
    doc.image(qrBuffer, doc.page.width - 150, detailsStartY, { width: 100 });
    
    doc.fontSize(10)
       .fillColor('#6B7280')
       .text('Scan QR Code for\nquick entry', doc.page.width - 150, detailsStartY + 110, {
         width: 100,
         align: 'center'
       });

    // Instructions section
    doc.fontSize(14)
       .fillColor('#374151')
       .text('IMPORTANT INSTRUCTIONS', 50, 550)
       .fontSize(10)
       .fillColor('#6B7280')
       .text('• Please arrive at least 15 minutes before the event starts', 50, 575)
       .text('• Present this ticket (digital or printed) at the entrance', 50, 590)
       .text('• Keep your ticket safe - it cannot be replaced if lost', 50, 605)
       .text('• Contact support if you have any questions about your booking', 50, 620);

    // Footer
    doc.fontSize(8)
       .fillColor('#9CA3AF')
       .text(`Generated on ${new Date().toLocaleString()}`, 50, 680)
       .text('Thank you for choosing our platform!', 50, 695)
       .text('For support, contact: support@eventplatform.com', 50, 710);

    // Security watermark
    doc.fontSize(8)
       .fillColor('#E5E7EB')
       .text('VALID TICKET - DO NOT DUPLICATE', 200, 400, {
         rotate: -45,
         opacity: 0.3
       });

    // Finalize the PDF
    doc.end();

  } catch (error) {
    console.error('Download Ticket Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate ticket',
      error: error.message
    });
  }
};


