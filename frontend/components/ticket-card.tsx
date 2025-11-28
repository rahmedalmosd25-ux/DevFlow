'use client';

import { useState } from "react";
import Image from "next/image";
import { Ticket } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { ticketApi } from "@/lib/api";
import { toast } from "sonner";
import { Download, QrCode, X } from "lucide-react";

interface TicketCardProps {
  ticket: Ticket;
  onCancel?: (ticketId: string) => void;
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const formatTime = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
};

export default function TicketCard({ ticket, onCancel }: TicketCardProps) {
  const [showQR, setShowQR] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const handleShowQR = async () => {
    if (qrCode) {
      setShowQR(!showQR);
      return;
    }

    try {
      setLoading(true);
      const response = await ticketApi.getTicketQRCode(ticket.id);
      if (response.success && response.data?.qrCode) {
        setQrCode(response.data.qrCode);
        setShowQR(true);
      }
    } catch (error) {
      console.error('Error loading QR code:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    try {
      setDownloading(true);
      await ticketApi.downloadTicketPDF(ticket.id);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast.error('Failed to download PDF', {
        description: 'Please try again later.',
      });
    } finally {
      setDownloading(false);
    }
  };

  const handleCancelTicket = async () => {
    // Prevent canceling if already checked in
    if (ticket.checkIn) {
      toast.error('Cannot cancel ticket', {
        description: 'This ticket has already been checked in.',
      });
      return;
    }

    try {
      setCancelling(true);
      await ticketApi.cancelTicket(ticket.id);
      toast.success('Ticket cancelled successfully', {
        description: 'Your ticket has been cancelled.',
      });
      // Call the onCancel callback if provided to refresh the list
      if (onCancel) {
        onCancel(ticket.id);
      }
    } catch (error: any) {
      console.error('Error cancelling ticket:', error);
      toast.error('Failed to cancel ticket', {
        description: error.message || 'Please try again later.',
      });
    } finally {
      setCancelling(false);
    }
  };

  if (!ticket.event) return null;

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow border border-gray-200">
      {/* Image */}
      <div className="relative h-48 w-full overflow-hidden">
        {ticket.event.image ? (
          <Image 
            src={ticket.event.image} 
            alt={ticket.event.title} 
            fill 
            className="object-cover" 
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <span className="text-white text-2xl font-bold">{ticket.event.title.charAt(0)}</span>
          </div>
        )}
        {/* Check-in Status */}
        {ticket.checkIn && (
          <div className="absolute top-2 right-2">
            <span className="px-2 py-1 rounded-md text-xs font-semibold bg-green-500 text-white">
              Checked In
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Title */}
        <h3 className="text-xl font-bold text-gray-900 mb-2">{ticket.event.title}</h3>

        {/* Date and Location */}
        <p className="text-sm text-gray-600 font-medium mb-1">
          {formatDate(ticket.event.dateTime)}, {formatTime(ticket.event.dateTime)}
        </p>
        <p className="text-sm text-gray-600 mb-3">{ticket.event.location}</p>

        {/* Ticket ID */}
        <p className="text-xs text-gray-500 mb-4">Ticket ID: {ticket.id.slice(0, 8)}...</p>

        {/* QR Code Display */}
        {showQR && qrCode && (
          <div className="mb-4 p-4 bg-gray-50 rounded-lg flex flex-col items-center">
            <img src={qrCode} alt="QR Code" className="w-48 h-48 mb-2" />
            <p className="text-xs text-gray-600">Scan for check-in</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleShowQR}
              disabled={loading || cancelling}
              className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-blue-700 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <QrCode className="w-4 h-4" />
                  <span className="hidden sm:inline">{showQR ? 'Hide QR' : 'Show QR'}</span>
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={handleDownloadPDF}
              disabled={downloading || cancelling}
              className="flex-1 bg-orange-50 hover:bg-orange-100 text-orange-700 border-orange-200 flex items-center justify-center gap-2"
            >
              {downloading ? (
                <div className="w-4 h-4 border-2 border-orange-700 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">PDF</span>
                </>
              )}
            </Button>
          </div>
          {!ticket.checkIn && (
            <Button
              variant="outline"
              onClick={handleCancelTicket}
              disabled={cancelling}
              className="w-full bg-red-50 hover:bg-red-100 text-red-700 border-red-200 flex items-center justify-center gap-2"
            >
              {cancelling ? (
                <>
                  <div className="w-4 h-4 border-2 border-red-700 border-t-transparent rounded-full animate-spin" />
                  <span>Cancelling...</span>
                </>
              ) : (
                <>
                  <X className="w-4 h-4" />
                  <span>Cancel Ticket</span>
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

