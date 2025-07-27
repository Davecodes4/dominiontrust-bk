'use client';

// Configure for Edge Runtime on Cloudflare Pages
export const runtime = 'edge';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function TransferRequestDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Transfer Request Details</h1>
      <p>Transfer Request ID: {id}</p>
      <button 
        onClick={() => router.back()}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Go Back
      </button>
    </div>
  );
}
