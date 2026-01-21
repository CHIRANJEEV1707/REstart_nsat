'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Sparkles, Copy, Check } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/Dialog';
import { Input } from '@/components/ui/Input';
import { useMutation } from '@tanstack/react-query';
import api from '@/lib/axios';
import toast from 'react-hot-toast';

export function ReferralCard() {
    const [isClaimOpen, setIsClaimOpen] = useState(false);
    const [claimForm, setClaimForm] = useState({ name: '', phoneNumber: '', registeredEmail: '', stream: 'general' });
    const [copied, setCopied] = useState(false);

    const referralLink = 'https://www.newtonschool.co/newton-school-of-technology-nst/apply-referral/?utm_source=referral&utm_medium=sahilkhan&utm_campaign=btech-computer-science-nst-students-referral-invite-your-junior--portal-referral';

    const claimMutation = useMutation({
        mutationFn: async () => {
            const res = await api.post('/free-pack/claim', { ...claimForm, claimType: 'core' });
            return res.data;
        },
        onSuccess: (data) => {
            toast.success(data.message || 'Claim submitted successfully!');
            setIsClaimOpen(false);
            setClaimForm({ name: '', phoneNumber: '', registeredEmail: '', stream: 'general' });
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to submit claim.');
        }
    });

    const handleCopy = () => {
        navigator.clipboard.writeText(referralLink);
        setCopied(true);
        toast.success("Link copied to clipboard!");
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <>
            <div className="bg-gradient-to-br from-indigo-900 to-blue-900 rounded-2xl p-8 text-white text-center relative overflow-hidden my-8">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                <div className="relative z-10 max-w-3xl mx-auto">
                    <Sparkles className="w-8 h-8 text-yellow-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold mb-2">Registered for NSAT using our Referral Link?</h2>
                    <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
                        If you used our special referral link to apply for NSAT 2025, you are eligible for the <span className="font-bold text-white">Core Pack (Worth ₹800)</span> absolutely FREE!
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Button
                            variant="outline"
                            className="bg-transparent text-white border-white/30 hover:bg-white/10 gap-2 min-w-[160px]"
                            onClick={handleCopy}
                        >
                            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            {copied ? "Copied!" : "Copy Link"}
                        </Button>
                        <Button
                            className="bg-white text-blue-900 hover:bg-blue-50 font-semibold min-w-[200px]"
                            onClick={() => setIsClaimOpen(true)}
                        >
                            Get Details & Claim Reward
                        </Button>
                    </div>
                </div>
            </div>

            <Dialog open={isClaimOpen} onOpenChange={setIsClaimOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Claim Your Free Core Pack</DialogTitle>
                        <DialogDescription>
                            Please provide the details you used while registering for NSAT. We will verify your application source and grant access.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Your Name</label>
                            <Input
                                placeholder="Name used in registration"
                                value={claimForm.name}
                                onChange={(e) => setClaimForm({ ...claimForm, name: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Phone Number</label>
                            <Input
                                placeholder="Phone number used in registration"
                                value={claimForm.phoneNumber}
                                onChange={(e) => setClaimForm({ ...claimForm, phoneNumber: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Registered Email</label>
                            <Input
                                placeholder="Email used for NSAT registration"
                                value={claimForm.registeredEmail}
                                onChange={(e) => setClaimForm({ ...claimForm, registeredEmail: e.target.value })}
                            />
                            <p className="text-xs text-muted-foreground">This MUST match the email you used to register on Newton School.</p>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Stream</label>
                            <div className="flex gap-4">
                                <label className="flex items-center space-x-2 border rounded-lg p-3 w-full cursor-pointer hover:bg-gray-50">
                                    <input
                                        type="radio"
                                        name="stream"
                                        value="general"
                                        checked={claimForm.stream === 'general'}
                                        onChange={(e) => setClaimForm({ ...claimForm, stream: e.target.value })}
                                        className="text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="text-sm font-medium">General</span>
                                </label>
                                <label className="flex items-center space-x-2 border rounded-lg p-3 w-full cursor-pointer hover:bg-gray-50">
                                    <input
                                        type="radio"
                                        name="stream"
                                        value="coding"
                                        checked={claimForm.stream === 'coding'}
                                        onChange={(e) => setClaimForm({ ...claimForm, stream: e.target.value })}
                                        className="text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="text-sm font-medium">Coding</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3">
                        <Button variant="outline" onClick={() => setIsClaimOpen(false)}>Cancel</Button>
                        <Button
                            onClick={() => claimMutation.mutate()}
                            disabled={claimMutation.isPending || !claimForm.name || !claimForm.phoneNumber || !claimForm.registeredEmail}
                        >
                            {claimMutation.isPending ? 'Verifying...' : 'Submit Claim'}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
