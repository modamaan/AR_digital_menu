'use client';

import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import { useState } from "react";
import { Linkedin, Instagram, Play } from "lucide-react";

export default function Home() {
  const { user, isLoaded } = useUser();
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      question: "What is VisionDine?",
      answer: "VisionDine is an AR-powered digital menu platform for restaurants. Customers scan a QR code and instantly view your menu in 3D — they can place dishes on their table using augmented reality before ordering."
    },
    {
      question: "How does the AR menu work?",
      answer: "Each dish on your menu can have a 3D model attached. When customers open the menu on their phone, they can tap any item to view it in AR — seeing the dish in real size on their actual table through their camera."
    },
    {
      question: "Do my customers need to download an app?",
      answer: "No! VisionDine works entirely in the browser. Customers scan your QR code, the menu opens instantly — no app download required. AR works directly on iOS and Android browsers."
    },
    {
      question: "How do I create 3D models for my dishes?",
      answer: "Just upload a photo of your dish in the dashboard and VisionDine automatically generates a 3D model using AI. No 3D design skills needed — it takes about 1-3 minutes per item."
    },
    {
      question: "Can I manage orders from VisionDine?",
      answer: "Yes! The dashboard lets you manage your full menu, receive and track orders, configure payment methods (UPI, Razorpay, Cash on Delivery), and view analytics — all in one place."
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b bg-white sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt="VisionDine Logo"
              width={40}
              height={40}
              className="rounded-lg"
            />
            <span className="text-xl sm:text-2xl font-bold text-[#4E44FD]">VisionDine</span>
          </Link>

          <div className="flex items-center gap-2 sm:gap-4">
            {!isLoaded ? (
              <div className="h-10 w-20 rounded-full bg-gray-200 animate-pulse" />
            ) : user ? (
              <Link
                href="/home"
                className="px-4 sm:px-6 py-2 text-sm sm:text-base bg-[#4E44FD] text-white rounded-full hover:bg-[#3d36ca] transition-colors font-medium"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/sign-in"
                  className="px-3 sm:px-4 py-2 text-sm sm:text-base text-[#4E44FD] hover:text-[#3d36ca] transition-colors font-medium"
                >
                  Log in
                </Link>
                <Link
                  href="/sign-up"
                  className="px-4 sm:px-6 py-2 text-sm sm:text-base bg-[#4E44FD] text-white rounded-full hover:bg-[#3d36ca] transition-colors font-medium"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section
        className="w-full bg-white bg-contain bg-center opacity-100"
        style={{ backgroundImage: "url('/grid.png')" }}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
          <div className="max-w-4xl">
            <div className="flex items-center gap-2 mb-6 font-[family-name:var(--font-jetbrains-mono)]">
              <div className="w-2 h-2 bg-[#4E44FD] rounded-full"></div>
              <span className="text-sm sm:text-base text-gray-700 font-medium">Made for restaurants</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-[50px] font-[family-name:var(--font-jetbrains-mono)] font-bold text-gray-900 mb-6 leading-tight">
              Let Customers See Your Dishes<br className="hidden sm:block" />
              in 3D — Before They Order
            </h1>

            <p className="text-base sm:text-lg text-gray-600 mb-8 max-w-2xl font-[family-name:var(--font-jetbrains-mono)]">
              AR-powered digital menus for restaurants. Scan a QR code, explore dishes in augmented reality, and order — no app needed.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              {!isLoaded ? (
                <div className="h-14 w-48 rounded-xl bg-gray-200 animate-pulse" />
              ) : user ? (
                <Link
                  href="/home"
                  className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-[#4E44FD] text-white rounded-xl hover:bg-[#3d36ca] transition-colors font-semibold text-sm sm:text-base"
                >
                  Go to Dashboard
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              ) : (
                <>
                  <Link
                    href="/sign-up"
                    className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-[#4E44FD] text-white rounded-xl hover:bg-[#3d36ca] transition-colors font-semibold text-sm sm:text-base"
                  >
                    Get started now
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Link>
                  <Link
                    href="/sign-in"
                    className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-white border-2 border-gray-200 text-gray-700 rounded-xl hover:border-gray-300 transition-colors font-semibold text-sm sm:text-base"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Continue with Google
                  </Link>
                </>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6 text-xs sm:text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <Image
                  src="/diamond.png"
                  alt="Free trial"
                  width={20}
                  height={20}
                  className="w-5 h-5 object-contain"
                />
                <span>Free trial</span>
              </div>
              <div className="flex items-center gap-2">
                <Image
                  src="/credit_card.png"
                  alt="No credit card"
                  width={20}
                  height={20}
                  className="w-5 h-5 object-contain"
                />
                <span>No credit card required</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Video Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="max-w-5xl mx-auto">
          <div className="bg-gray-200 rounded-2xl sm:rounded-3xl aspect-video flex items-center justify-center relative overflow-hidden group cursor-pointer hover:bg-gray-300 transition-colors">
            <div className="absolute inset-0 bg-gradient-to-br from-gray-300/50 to-transparent"></div>
            <button className="relative z-10 flex items-center gap-3 px-6 sm:px-8 py-3 sm:py-4 bg-white rounded-full shadow-lg hover:shadow-xl transition-all group-hover:scale-105">
              <Play className="w-5 h-5 sm:w-6 sm:h-6 text-gray-900" fill="currentColor" />
              <span className="font-semibold text-sm sm:text-base text-gray-900">Demo</span>
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <h2 className="text-[40px] md:text-[50px] font-bold text-center mb-12 sm:mb-16 font-[family-name:var(--font-jetbrains-mono)] text-black">Powerful & Simple</h2>

        <div className="max-w-6xl mx-auto border-t border-gray-300">
          <div className="grid md:grid-cols-2">
            {/* Instant Setup */}
            <div className="border-b border-gray-300 md:border-r p-8 sm:p-12 flex gap-6 items-start">
              <div className="flex-shrink-0 pt-2">
                <Image
                  src="/flash.png"
                  alt="Instant Setup"
                  width={64}
                  height={64}
                  className="w-16 h-16 object-contain"
                />
              </div>
              <div className="space-y-2">
                <h3 className="text-[30px] font-bold font-[family-name:var(--font-jetbrains-mono)] leading-none text-black">AR Menu in Minutes</h3>
                <p className="text-[18px] font-normal text-gray-700 font-[family-name:var(--font-jetbrains-mono)] leading-normal">
                  Upload a dish photo and we<br />
                  auto-generate a 3D model.<br />
                  Live AR menu in minutes.
                </p>
              </div>
            </div>

            {/* Built to Stay Stable */}
            <div className="border-b border-gray-300 p-8 sm:p-12 flex gap-6 items-start">
              <div className="flex-shrink-0 pt-2">
                <Image
                  src="/Vector.png"
                  alt="Stable"
                  width={64}
                  height={64}
                  className="w-16 h-16 object-contain"
                />
              </div>
              <div className="space-y-2">
                <h3 className="text-[30px] font-bold font-[family-name:var(--font-jetbrains-mono)] leading-none text-black">No App Required</h3>
                <p className="text-[18px] font-normal text-gray-700 font-[family-name:var(--font-jetbrains-mono)] leading-normal">
                  Customers scan a QR code<br />
                  and view AR dishes right in<br />
                  their browser. Zero friction.
                </p>
              </div>
            </div>
          </div>

          {/* Effortless Management */}
          <div className="flex justify-center">
            <div className="w-full md:max-w-2xl border-l border-r border-gray-300 p-8 sm:p-12 flex gap-6 items-start border-b">
              <div className="flex-shrink-0 pt-2">
                <Image
                  src="/magic.png"
                  alt="Effortless"
                  width={64}
                  height={64}
                  className="w-16 h-16 object-contain"
                />
              </div>
              <div className="space-y-2">
                <h3 className="text-[30px] font-bold font-[family-name:var(--font-jetbrains-mono)] leading-none text-black">Full Order Management</h3>
                <p className="text-[18px] font-normal text-gray-700 font-[family-name:var(--font-jetbrains-mono)] leading-normal">
                  Receive orders, manage the menu,<br />
                  accept UPI & card payments —<br />
                  all from one dashboard.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center mb-4 font-[family-name:var(--font-jetbrains-mono)]">Let's Clear Things Up</h2>
          <p className="text-sm sm:text-base text-gray-600 text-center mb-8 sm:mb-12 font-[family-name:var(--font-jetbrains-mono)]">
            We've answered the most common questions<br className="hidden sm:block" />
            to help you get started.
          </p>

          <div className="border border-gray-300">
            {faqs.map((faq, index) => (
              <div key={index} className="border-b border-gray-300 last:border-b-0 bg-white">
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full px-6 py-6 sm:py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors group"
                >
                  <span className="font-bold text-[18px] sm:text-[20px] text-black pr-4 font-[family-name:var(--font-jetbrains-mono)]">
                    {faq.question}
                  </span>
                  <div className="flex-shrink-0 ml-4">
                    {openFaq === index ? (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M5 12H19" stroke="black" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    ) : (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 5V19M5 12H19" stroke="black" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${openFaq === index ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
                    }`}
                >
                  <div className="px-6 pb-6 sm:pb-8 pt-0">
                    <p className="text-[16px] sm:text-[18px] text-gray-600 leading-relaxed font-[family-name:var(--font-jetbrains-mono)]">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        className="border-t bg-white bg-contain bg-center opacity-100"
        style={{ backgroundImage: "url('/grid.png')" }}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-12 mb-8 sm:mb-12">
            {/* Logo */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Image
                  src="/logo.png"
                  alt="VisionDine Logo"
                  width={40}
                  height={40}
                  className="rounded-lg"
                />
                <span className="text-xl font-bold text-[#4E44FD]">VisionDine</span>
              </div>
              <div className="flex gap-4">
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-600 transition-colors">
                  <Linkedin className="w-5 h-5" />
                </a>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-600 transition-colors">
                  <Instagram className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* Product */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-4 font-[family-name:var(--font-jetbrains-mono)]">Product</h4>
              <ul className="space-y-2 text-sm text-gray-600 font-[family-name:var(--font-jetbrains-mono)]">
                <li><Link href="#" className="hover:text-gray-900 transition-colors">Features</Link></li>
                <li><Link href="#" className="hover:text-gray-900 transition-colors">Pricing</Link></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-4 font-[family-name:var(--font-jetbrains-mono)]">Company</h4>
              <ul className="space-y-2 text-sm text-gray-600 font-[family-name:var(--font-jetbrains-mono)]">
                <li><Link href="#" className="hover:text-gray-900 transition-colors">Contact</Link></li>
                <li><Link href="#" className="hover:text-gray-900 transition-colors">Privacy & Policy</Link></li>
              </ul>
            </div>
          </div>

          {/* Large VisionDine Text */}
          <div className="text-center mb-6 sm:mb-8 overflow-hidden">
            <div className="text-[60px] sm:text-[120px] lg:text-[250px] font-bold tracking-tight font-[family-name:var(--font-jetbrains-mono)] bg-gradient-to-b from-[#111111] to-[#FFFFFF] bg-clip-text text-transparent opacity-30 select-none leading-none">
              VisionDine
            </div>
          </div>

          {/* Copyright */}
          <div className="text-center text-xs sm:text-sm text-gray-500 font-[family-name:var(--font-jetbrains-mono)]">
            © 2026 VisionDine. Made with <span className="text-red-500">❤</span> in India. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
