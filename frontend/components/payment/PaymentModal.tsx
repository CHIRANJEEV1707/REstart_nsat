'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { X, CreditCard, QrCode, Upload, Check, Loader2, Image as ImageIcon, Mail } from 'lucide-react';
import toast from 'react-hot-toast';

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    pkg: {
        title: string;
        price: number;
    };
    upiId: string;
    onRazorpay: (email: string) => Promise<void>;
}

export function PaymentModal({ isOpen, onClose, pkg, upiId, onRazorpay }: PaymentModalProps) {
    const [paymentMethod, setPaymentMethod] = useState<'razorpay' | 'upi' | null>(null);
    const [qrLoading, setQrLoading] = useState(true);
    const [proofFile, setProofFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [email, setEmail] = useState('');

    if (!isOpen) return null;

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setProofFile(file);
        }
    };

    const submitProof = async () => {
        if (!proofFile || !email) {
            toast.error("Please provide email and proof");
            return;
        }

        setUploading(true);
        try {
            // Simulate Upload
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Send Email
            await fetch('/api/email/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email,
                    name: "Student", // Could add name input too
                    productTitle: pkg.title,
                    amount: pkg.price,
                    type: 'upi_proof'
                })
            });

            toast.success("Proof submitted! Confirmation email sent.", {
                icon: '✅',
                duration: 5000
            });
            setProofFile(null);
            setPaymentMethod(null);
            onClose();
        } catch (e) {
            console.error(e);
            toast.error("Failed to submit");
        } finally {
            setUploading(false);
        }
    };

    const upiUrl = `upi://pay?pa=${upiId}&pn=REstart&am=${pkg.price}&cu=INR`;
    const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(upiUrl)}`;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50 sticky top-0 z-10">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900">Complete Payment</h3>
                        <p className="text-sm text-gray-500">for {pkg.title}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                <div className="p-6">
                    <div className="mb-6 text-center">
                        <p className="text-gray-500 text-sm mb-1">Total Amount</p>
                        <p className="text-4xl font-extrabold text-gray-900">₹{pkg.price}</p>
                    </div>

                    {/* Email Input */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email to receive access"
                                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                            />
                        </div>
                    </div>

                    {!paymentMethod ? (
                        <div className="space-y-3">
                            <button
                                onClick={() => {
                                    if (!email) return toast.error("Please enter your email first");
                                    onRazorpay(email);
                                }}
                                className="w-full flex items-center justify-between p-4 rounded-xl border border-indigo-100 bg-indigo-50/50 hover:bg-indigo-50 hover:border-indigo-200 transition-all group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
                                        <CreditCard className="w-5 h-5" />
                                    </div>
                                    <div className="text-left">
                                        <p className="font-semibold text-gray-900">Pay with Razorpay</p>
                                        <p className="text-xs text-gray-500">Cards, Netbanking, Wallet</p>
                                    </div>
                                </div>
                            </button>

                            <button
                                onClick={() => {
                                    if (!email) return toast.error("Please enter your email first");
                                    setPaymentMethod('upi');
                                    setQrLoading(true);
                                }}
                                className="w-full flex items-center justify-between p-4 rounded-xl border border-emerald-100 bg-emerald-50/50 hover:bg-emerald-50 hover:border-emerald-200 transition-all group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                                        <QrCode className="w-5 h-5" />
                                    </div>
                                    <div className="text-left">
                                        <p className="font-semibold text-gray-900">Pay with UPI QR</p>
                                        <p className="text-xs text-gray-500">Scan with any UPI app</p>
                                    </div>
                                </div>
                            </button>
                        </div>
                    ) : paymentMethod === 'upi' ? (
                        <div className="text-center animate-in slide-in-from-right-8 duration-200">
                            <div className="bg-white p-4 rounded-2xl border border-gray-200 inline-block mb-6 shadow-sm relative min-h-[250px] min-w-[250px] flex items-center justify-center">
                                {qrLoading && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                                        <Loader2 className="w-8 h-8 animate-spin mb-2" />
                                        <span className="text-xs">Generating QR...</span>
                                    </div>
                                )}
                                <img
                                    src={qrImageUrl}
                                    alt="UPI QR Code"
                                    className={`w-full h-full transition-opacity duration-300 ${qrLoading ? 'opacity-0' : 'opacity-100'}`}
                                    onLoad={() => setQrLoading(false)}
                                />
                            </div>

                            <p className="text-sm font-medium text-gray-900 mb-1">Scan to Pay ₹{pkg.price}</p>
                            <p className="text-xs text-gray-500 mb-6">Use PhonePe, Paytm, GPay or any UPI app</p>

                            {/* Proof Upload Section */}
                            <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                                <label className="block text-sm font-medium text-gray-700 mb-3">Upload Payment Screenshot</label>

                                {!proofFile ? (
                                    <div className="relative">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFileUpload}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        />
                                        <div className="flex flex-col items-center justify-center py-4 text-gray-400 hover:text-gray-600 transition-colors">
                                            <Upload className="w-8 h-8 mb-2" />
                                            <span className="text-xs">Click to upload image</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-between bg-white p-2 rounded-lg border border-gray-200">
                                        <div className="flex items-center gap-2 overflow-hidden">
                                            <ImageIcon className="w-4 h-4 text-blue-500 flex-shrink-0" />
                                            <span className="text-xs truncate max-w-[150px]">{proofFile.name}</span>
                                        </div>
                                        <button
                                            onClick={() => setProofFile(null)}
                                            className="text-gray-400 hover:text-red-500 p-1"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}

                                {proofFile && (
                                    <Button
                                        onClick={submitProof}
                                        disabled={uploading}
                                        className="w-full mt-3 bg-emerald-600 hover:bg-emerald-700 text-white"
                                    >
                                        {uploading ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                Processing...
                                            </>
                                        ) : (
                                            <>
                                                Submit Proof
                                                <Check className="w-4 h-4 ml-2" />
                                            </>
                                        )}
                                    </Button>
                                )}
                            </div>

                            <Button
                                onClick={() => setPaymentMethod(null)}
                                variant="outline"
                                className="w-full border-gray-200"
                            >
                                Back to Payment Options
                            </Button>
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    );
}
