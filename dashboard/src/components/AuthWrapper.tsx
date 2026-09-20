"use client";

import { Authenticator, useAuthenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import Image from 'next/image';

const components = {
  SignIn: {
    Header() {
      return (
        <div className="mb-8">
          <h2 className="text-3xl font-extrabold text-[#111827] tracking-tight mb-2">Welcome back</h2>
          <p className="text-[#667085] text-base font-medium">Sign in to access your WBOS workspace.</p>
        </div>
      );
    },
    Footer() {
      return (
        <div className="mt-8 text-center text-sm font-medium text-[#667085]">
          Protected by Amazon Cognito · MFA enabled
        </div>
      );
    }
  },
  ConfirmSignIn: {
    Header() {
      return (
        <div className="mb-8">
          <h2 className="text-3xl font-extrabold text-[#111827] tracking-tight mb-2">Verify your identity</h2>
          <p className="text-[#667085] text-base font-medium">Enter the 6-digit code from your authenticator app.</p>
        </div>
      );
    },
    Footer() {
      return (
        <div className="mt-8 text-center text-sm font-medium text-[#667085]">
          Protected by Amazon Cognito · MFA enabled
        </div>
      );
    }
  },
  SetupTOTP: {
    Header() {
      return (
        <div className="mb-8">
          <h2 className="text-3xl font-extrabold text-[#111827] tracking-tight mb-2">Set up MFA</h2>
          <p className="text-[#667085] text-base font-medium">Secure your account with an authenticator app.</p>
        </div>
      );
    },
    Footer() {
      return (
        <div className="mt-8 text-center text-sm font-medium text-[#667085]">
          Protected by Amazon Cognito · MFA enabled
        </div>
      );
    }
  },
  ResetPassword: {
    Header() {
      return (
        <div className="mb-8">
          <h2 className="text-3xl font-extrabold text-[#111827] tracking-tight mb-2">Reset password</h2>
          <p className="text-[#667085] text-base font-medium">We'll send you a verification code.</p>
        </div>
      );
    },
    Footer() {
      return (
        <div className="mt-8 text-center text-sm font-medium text-[#667085]">
          Protected by Amazon Cognito
        </div>
      );
    }
  }
};

const formFields = {
  signIn: {
    username: {
      placeholder: 'Enter your username',
      isRequired: true,
      label: 'Username'
    },
    password: {
      placeholder: 'Enter your password',
      isRequired: true,
      label: 'Password'
    },
  },
  confirmSignIn: {
    confirmation_code: {
      placeholder: '• • • • • •',
      label: 'Authentication code',
      isRequired: true,
    },
  },
};

function AuthLayout({ children }: { children: React.ReactNode }) {
  const { authStatus } = useAuthenticator((context) => [context.authStatus]);

  if (authStatus === 'authenticated') {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen w-full bg-[#F6F7F9]">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex flex-col justify-between w-[45%] max-w-[600px] bg-white border-r border-[#D8DEE7] p-12 relative overflow-hidden">
        
        {/* Subtle Technical Grid Background */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(#111827 1px, transparent 1px), linear-gradient(90deg, #111827 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }}>
        </div>

        {/* Top Logo Area */}
        <div className="relative z-10 flex items-center gap-3">
          <Image src="/wbos-logo.png" alt="WBOS Logo" width={32} height={32} className="object-contain" />
          <div className="leading-none mt-1">
            <div className="font-extrabold text-xl tracking-tight text-[#111827]">WBOS</div>
            <div className="text-[9px] font-bold uppercase tracking-widest text-[#667085] mt-0.5">Business Operations System</div>
          </div>
        </div>

        {/* Center Content */}
        <div className="relative z-10 my-16">
          <h1 className="text-[40px] leading-[1.1] font-extrabold text-[#111827] tracking-tight mb-6">
            Run your business from one operational layer.
          </h1>
          <p className="text-lg text-[#667085] font-medium mb-12 max-w-[400px]">
            Connect conversations, orders, inventory and automation through one AWS-powered control center.
          </p>

          <div className="space-y-8">
            <div className="flex gap-4">
              <div className="text-xs font-bold text-[#0F8A9A] w-6 shrink-0 pt-0.5">01</div>
              <div>
                <h3 className="text-sm font-bold text-[#111827] mb-1">Conversations</h3>
                <p className="text-sm text-[#667085] font-medium">Customer communication through WhatsApp</p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="text-xs font-bold text-[#0F8A9A] w-6 shrink-0 pt-0.5">02</div>
              <div>
                <h3 className="text-sm font-bold text-[#111827] mb-1">Orders</h3>
                <p className="text-sm text-[#667085] font-medium">Control the complete fulfillment lifecycle</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="text-xs font-bold text-[#0F8A9A] w-6 shrink-0 pt-0.5">03</div>
              <div>
                <h3 className="text-sm font-bold text-[#111827] mb-1">Inventory</h3>
                <p className="text-sm text-[#667085] font-medium">Track stock in real time</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="text-xs font-bold text-[#0F8A9A] w-6 shrink-0 pt-0.5">04</div>
              <div>
                <h3 className="text-sm font-bold text-[#111827] mb-1">Automation</h3>
                <p className="text-sm text-[#667085] font-medium">Respond to operational events automatically</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="relative z-10">
          <div className="text-[10px] font-bold text-[#667085] tracking-widest flex items-center gap-3">
            <span>AWS-NATIVE</span>
            <span className="w-1 h-1 rounded-full bg-[#D8DEE7]"></span>
            <span>EVENT-DRIVEN</span>
            <span className="w-1 h-1 rounded-full bg-[#D8DEE7]"></span>
            <span>WHATSAPP-FIRST</span>
          </div>
        </div>
      </div>

      {/* Right Panel - Authentication */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 relative overflow-y-auto">
        {/* Mobile Header (Hidden on Desktop) */}
        <div className="lg:hidden flex items-center gap-3 mb-10 self-start max-w-[440px] mx-auto w-full">
          <Image src="/wbos-logo.png" alt="WBOS Logo" width={28} height={28} className="object-contain" />
          <div className="leading-none mt-1">
            <div className="font-extrabold text-lg tracking-tight text-[#111827]">WBOS</div>
            <div className="text-[8px] font-bold uppercase tracking-widest text-[#667085] mt-0.5">Business Operations</div>
          </div>
        </div>

        <div className="w-full max-w-[440px] mx-auto wbos-auth-shell">
          <Authenticator 
            hideSignUp 
            components={components} 
            formFields={formFields}
          />
        </div>
      </div>
    </div>
  );
}

export default function AuthWrapper({ children }: { children: React.ReactNode }) {
  return (
    <Authenticator.Provider>
      <AuthLayout>{children}</AuthLayout>
    </Authenticator.Provider>
  );
}
