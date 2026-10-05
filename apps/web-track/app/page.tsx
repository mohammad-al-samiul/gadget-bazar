'use client';

import React, { useState } from 'react';
import { Button } from '@gadgetbazar/ui';
import { colors } from '@gadgetbazar/design-tokens';

/**
 * NON-NEGOTIABLE RULE:
 * Public tracking exposes NO customer PII (no name, phone number, full street address)
 * and never exposes sourcing_price_cny.
 */
export default function PublicTrackingPage() {
  const [trackingNumber, setTrackingNumber] = useState('');

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <main style={{ padding: '40px 24px', maxWidth: '800px', margin: '0 auto' }}>
      <header style={{ marginBottom: '32px', textAlign: 'center' }}>
        <h1 style={{ color: colors.primary.blue, fontSize: '2.5rem', marginBottom: '8px' }}>
          গ্যাজেটট্র্যাক (GadgetTrack)
        </h1>
        <p style={{ color: colors.neutral.midGray, fontSize: '1.125rem' }}>
          আপনার পার্সেল ও শিপমেন্ট স্ট্যাটাস ট্র্যাক করুন
        </p>
      </header>

      <form
        onSubmit={handleTrack}
        style={{
          display: 'flex',
          gap: '12px',
          maxWidth: '500px',
          margin: '0 auto 40px auto',
        }}
      >
        <input
          type="text"
          value={trackingNumber}
          onChange={(e) => setTrackingNumber(e.target.value)}
          placeholder="ট্র্যাকিং নম্বর লিখুন (যেমন: GB-TRK-1002)"
          style={{
            flex: 1,
            padding: '10px 14px',
            borderRadius: '8px',
            border: `1px solid ${colors.neutral.midGray}`,
            fontSize: '1rem',
          }}
        />
        <Button variant="primary" type="submit">
          ট্র্যাক করুন
        </Button>
      </form>

      <div
        style={{
          border: `1px solid ${colors.neutral.lightGray}`,
          backgroundColor: '#FAFAFA',
          borderRadius: '8px',
          padding: '24px',
        }}
      >
        <h3 style={{ margin: '0 0 12px 0', color: colors.neutral.nearBlack }}>
          গোপনীয়তা ও নিরাপত্তা নির্দেশিকা
        </h3>
        <p style={{ margin: 0, fontSize: '0.875rem', color: colors.neutral.midGray }}>
          গ্রাহকের ব্যক্তিগত তথ্য সুরক্ষার স্বার্থে এই ট্র্যাকিং পেজে কোনো নাম, ফোন নম্বর বা পূর্ণ
          ঠিকানা প্রদর্শন করা হয় না।
        </p>
      </div>
    </main>
  );
}
