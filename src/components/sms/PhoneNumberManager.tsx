'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Phone, MessageSquare, Check, X } from 'lucide-react';

interface PhoneNumberManagerProps {
  currentPhone?: string | null;
  userId: string;
  onPhoneUpdated?: (phoneNumber: string | null) => void;
}

export function PhoneNumberManager({ currentPhone, userId, onPhoneUpdated }: PhoneNumberManagerProps) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [step, setStep] = useState<'add' | 'verify' | 'verified'>('add');
  const [loading, setLoading] = useState(false);
  const [pendingPhone, setPendingPhone] = useState<string>('');
  const { toast } = useToast();

  const formatPhoneDisplay = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 11 && cleaned.startsWith('1')) {
      const number = cleaned.slice(1);
      return `+1 (${number.slice(0, 3)}) ${number.slice(3, 6)}-${number.slice(6)}`;
    }
    return phone;
  };

  const handleAddPhone = async () => {
    if (!phoneNumber.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a phone number',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/user/phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber, userId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send verification code');
      }

      setPendingPhone(data.phoneNumber);
      setStep('verify');
      toast({
        title: 'Verification code sent',
        description: 'Check your phone for a 6-digit verification code',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to send verification code',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode.trim() || verificationCode.length !== 6) {
      toast({
        title: 'Error',
        description: 'Please enter the 6-digit verification code',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/user/phone', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: pendingPhone, verificationCode, userId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to verify phone number');
      }

      setStep('verified');
      onPhoneUpdated?.(data.phoneNumber);
      toast({
        title: 'Phone verified!',
        description: 'You can now use SMS to manage your budget',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to verify phone number',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemovePhone = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/user/phone', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to remove phone number');
      }

      onPhoneUpdated?.(null);
      setStep('add');
      setPhoneNumber('');
      setVerificationCode('');
      setPendingPhone('');
      toast({
        title: 'Phone removed',
        description: 'SMS functionality has been disabled',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to remove phone number',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (currentPhone) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            SMS Budgeting
          </CardTitle>
          <CardDescription>
            Text your phone to add transactions and check budgets
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
            <Check className="h-4 w-4 text-green-600" />
            <span className="text-sm">
              <strong>Phone verified:</strong> {formatPhoneDisplay(currentPhone)}
            </span>
          </div>
          
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium mb-2">Quick Commands:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• <code>"Spent $25 on groceries"</code> - Add expense</li>
              <li>• <code>"Income $500 freelance"</code> - Add income</li>
              <li>• <code>"Budget groceries"</code> - Check category budget</li>
              <li>• <code>"Budget"</code> - See all budgets</li>
              <li>• <code>"help"</code> - Get full help menu</li>
            </ul>
          </div>

          <Button 
            variant="outline" 
            onClick={handleRemovePhone}
            disabled={loading}
            className="w-full"
          >
            <X className="h-4 w-4 mr-2" />
            Remove Phone Number
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Phone className="h-5 w-5" />
          Enable SMS Budgeting
        </CardTitle>
        <CardDescription>
          Add your phone number to manage transactions via text message
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {step === 'add' && (
          <>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+1 (555) 123-4567"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
              <p className="text-xs text-gray-500">
                We'll send a verification code to this number
              </p>
            </div>
            <Button 
              onClick={handleAddPhone} 
              disabled={loading || !phoneNumber.trim()}
              className="w-full"
            >
              {loading ? 'Sending...' : 'Send Verification Code'}
            </Button>
          </>
        )}

        {step === 'verify' && (
          <>
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm">
                Verification code sent to <strong>{formatPhoneDisplay(pendingPhone)}</strong>
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="code">Verification Code</Label>
              <Input
                id="code"
                type="text"
                placeholder="123456"
                maxLength={6}
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
              />
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={handleVerifyCode} 
                disabled={loading || verificationCode.length !== 6}
                className="flex-1"
              >
                {loading ? 'Verifying...' : 'Verify Phone'}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setStep('add')}
                disabled={loading}
              >
                Cancel
              </Button>
            </div>
          </>
        )}

        {step === 'verified' && (
          <div className="text-center space-y-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <Check className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="font-medium text-green-800">Phone Verified!</p>
              <p className="text-sm text-green-600">
                You can now text this number to manage your budget
              </p>
            </div>
          </div>
        )}

        <div className="p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium mb-2">What you can do with SMS:</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Add expenses and income instantly</li>
            <li>• Check budget balances on the go</li>
            <li>• Get real-time spending alerts</li>
            <li>• Simple, natural language commands</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}