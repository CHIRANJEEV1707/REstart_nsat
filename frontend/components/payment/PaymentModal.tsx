'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { X, CreditCard, QrCode, Upload, Check, Loader2, Image as ImageIcon, Tag, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    pkg: {
        title: string;
        price: number;
    };
    upiId: string;
    onRazorpay: (discountedPrice?: number) => Promise<void>;
    upiSubmitUrl?: string;
}

export function PaymentModal({ isOpen, onClose, pkg, upiId, onRazorpay, upiSubmitUrl = '/api/payment/upi-submit' }: PaymentModalProps) {
    const { user } = useAuth();
    const [paymentMethod, setPaymentMethod] = useState<'razorpay' | 'upi' | null>(null);
    const [qrLoading, setQrLoading] = useState(true);
    const [proofFile, setProofFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const userEmail = user?.email || '';

    // Coupon state
    const [couponCode, setCouponCode] = useState('');
    const [couponApplied, setCouponApplied] = useState(false);
    const [discount, setDiscount] = useState(0);

    // Check if today is Jan 26 for Republic Day offer
    const isRepublicDay = () => {
        const today = new Date();
        return today.getMonth() === 0 && today.getDate() === 26;
    };

    const applyCoupon = () => {
        const code = couponCode.trim().toUpperCase();
        if (code === 'INDIA77' && isRepublicDay()) {
            const discountAmount = Math.floor(pkg.price * 0.5);
            setDiscount(discountAmount);
            setCouponApplied(true);
            toast.success('🎉 Republic Day offer applied! 50% OFF');
        } else if (code === 'INDIA77' && !isRepublicDay()) {
            toast.error('This offer is only valid on Republic Day (Jan 26)');
        } else {
            toast.error('Invalid coupon code');
        }
    };

    const removeCoupon = () => {
        setCouponCode('');
        setCouponApplied(false);
        setDiscount(0);
    };

    const finalPrice = pkg.price - discount;

    if (!isOpen) return null;

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setProofFile(file);
        }
    };

    const submitProof = async () => {
        if (!proofFile) {
            toast.error("Please upload payment proof");
            return;
        }

        setUploading(true);
        try {
            // Create FormData with proof file
            const formData = new FormData();
            formData.append('proof', proofFile);
            formData.append('amount', String(finalPrice));
            formData.append('productSlug', (pkg as any).slug || pkg.title);
            formData.append('productTitle', pkg.title);
            if (couponApplied) {
                formData.append('couponCode', couponCode);
                formData.append('originalPrice', String(pkg.price));
            }

            // Submit to UPI endpoint
            const response = await fetch(upiSubmitUrl, {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.message || 'Failed to submit proof');
            }

            toast.success("Proof submitted! We'll verify it within 24 hours.", {
                icon: '✅',
                duration: 5000
            });
            setProofFile(null);
            setPaymentMethod(null);
            onClose();
        } catch (e) {
            console.error(e);
            toast.error("Failed to submit proof. Please try again.");
        } finally {
            setUploading(false);
        }
    };

    const upiUrl = `upi://pay?pa=${upiId}&pn=REstart&am=${finalPrice}&cu=INR`;
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
                    {/* Price Display */}
                    <div className="mb-4 text-center">
                        <p className="text-gray-500 text-sm mb-1">Total Amount</p>
                        {couponApplied ? (
                            <div className="flex items-center justify-center gap-3">
                                <p className="text-2xl text-gray-400 line-through">₹{pkg.price}</p>
                                <p className="text-4xl font-extrabold text-green-600">₹{finalPrice}</p>
                            </div>
                        ) : (
                            <p className="text-4xl font-extrabold text-gray-900">₹{pkg.price}</p>
                        )}
                        {couponApplied && (
                            <p className="text-sm text-green-600 mt-1 font-medium">🎉 You save ₹{discount}!</p>
                        )}
                    </div>

                    {/* Coupon Code Section */}
                    <div className="mb-6 p-4 bg-gradient-to-r from-orange-50 via-white to-green-50 rounded-xl border border-orange-200">
                        <p className="text-xs font-medium text-gray-600 mb-2 flex items-center gap-1">
                            <Tag className="w-3 h-3" /> Have a coupon code?
                        </p>
                        {!couponApplied ? (
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={couponCode}
                                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                    placeholder="Enter code"
                                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                />
                                <Button
                                    onClick={applyCoupon}
                                    disabled={!couponCode.trim()}
                                    className="bg-orange-500 hover:bg-orange-600 text-white px-4"
                                >
                                    Apply
                                </Button>
                            </div>
                        ) : (
                            <div className="flex items-center justify-between bg-green-50 p-3 rounded-lg border border-green-200">
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4 text-green-600" />
                                    <span className="font-mono font-bold text-green-700">{couponCode}</span>
                                    <span className="text-xs text-green-600">(-50%)</span>
                                </div>
                                <button
                                    onClick={removeCoupon}
                                    className="text-gray-400 hover:text-red-500 text-xs"
                                >
                                    Remove
                                </button>
                            </div>
                        )}
                    </div>


                    {!paymentMethod ? (
                        <div className="space-y-3">
                            <button
                                onClick={() => onRazorpay(couponApplied ? finalPrice : undefined)}
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

                            <p className="text-sm font-medium text-gray-900 mb-1">Scan to Pay ₹{finalPrice}</p>
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
