"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function DiscoverPage() {
  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-6">Discover Colleges</h1>
        
        <div className="bg-card border border-border rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">College Search</h2>
          <p className="text-muted-foreground mb-6">
            Use our college discovery tool to find the perfect college match based on your preferences.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="p-4 bg-muted/50 rounded-lg">
              <h3 className="font-medium mb-2">Filter by State</h3>
              <p className="text-sm text-muted-foreground">Find colleges in your preferred state</p>
            </div>
            
            <div className="p-4 bg-muted/50 rounded-lg">
              <h3 className="font-medium mb-2">Filter by Fees</h3>
              <p className="text-sm text-muted-foreground">Find colleges within your budget range</p>
            </div>
            
            <div className="p-4 bg-muted/50 rounded-lg">
              <h3 className="font-medium mb-2">Filter by Rating</h3>
              <p className="text-sm text-muted-foreground">Find top-rated colleges</p>
            </div>
          </div>
          
          <p className="mb-4">Connect to the backend API to see real college data.</p>
          
          <Link href="/">
            <Button>Back to Home</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}