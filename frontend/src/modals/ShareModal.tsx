import { useState } from "react";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  shareUrl?: string;
  qrCode?: string;
}

const ShareModal = ({ isOpen, onClose, shareUrl, qrCode }: ShareModalProps) => {
  const [isCopied, setIsCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/30 bg-opacity-50 z-50 flex justify-center items-center"
      onClick={onClose}
    >
      <div
        className="bg-white p-8 rounded-lg shadow-xl w-full max-w-sm relative text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-2xl"
        >
          &times;
        </button>
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Share Event</h2>

        {qrCode ? (
          <img
            src={qrCode}
            alt="Event QR Code"
            className="w-48 h-48 mx-auto my-4 border rounded-lg"
          />
        ) : (
          <div className="w-48 h-48 mx-auto my-4 bg-gray-100 flex items-center justify-center rounded-lg">
            <p className="text-sm text-gray-500">Loading QR Code...</p>
          </div>
        )}

        <p className="text-sm text-gray-500 mb-4">
          Share this link or let friends scan the QR code.
        </p>

        <div className="flex w-full">
          <input
            type="text"
            value={shareUrl || ""}
            readOnly
            className="w-full bg-gray-100 border rounded-l-md p-2 text-sm text-gray-700"
          />
          <button
            onClick={handleCopy}
            className="bg-gray-800 text-white font-semibold px-4 rounded-r-md hover:bg-gray-700 min-w-[80px]"
          >
            {isCopied ? "Copied!" : "Copy"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
