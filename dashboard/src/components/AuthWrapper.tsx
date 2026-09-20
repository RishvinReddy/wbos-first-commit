"use client";

import { Authenticator, useAuthenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';

function AuthHeader({ title, subtitle }: { title: string, subtitle: string }) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-8">
        <img src="/wbos-logo.png" alt="WBOS" className="w-5 h-5 object-contain" />
        <div className="leading-none text-left mt-0.5">
          <div className="font-extrabold text-[11px] tracking-tight text-[#111827]">WBOS</div>
          <div className="text-[6px] font-bold uppercase tracking-widest text-[#667085] mt-0.5">Business Operations System</div>
        </div>
      </div>
      <h2 className="text-[36px] font-[650] text-[#111827] tracking-tight mb-2.5 leading-tight" style={{ letterSpacing: '-0.025em' }}>{title}</h2>
      <p className="text-[15px] text-[#667085] font-medium leading-[1.6]">{subtitle}</p>
    </div>
  );
}

function AuthFooter() {
  return (
    <div className="mt-8">
      <div className="border-t border-[#E4E7EC] pt-7 mb-7">
        <div className="flex items-start gap-2.5">
           <div className="w-1.5 h-1.5 rounded-full bg-[#0F8A9A] mt-1.5 shrink-0"></div>
           <div>
             <div className="text-[13px] font-bold text-[#111827] mb-0.5">Secure workspace access</div>
             <div className="text-[13px] font-medium text-[#667085]">Protected by Amazon Cognito · MFA enabled</div>
           </div>
        </div>
      </div>
      
      <div className="text-[10px] font-bold text-[#667085] uppercase tracking-widest flex flex-col gap-1">
        <div className="text-[#111827]">WBOS · BUSINESS OPERATIONS SYSTEM</div>
        <div className="opacity-70">AWS-NATIVE · EVENT-DRIVEN · WHATSAPP-FIRST</div>
      </div>
    </div>
  );
}

const components = {
  SignIn: {
    Header() { return <AuthHeader title="Welcome back" subtitle="Sign in to access your WBOS workspace." />; },
    Footer() { return <AuthFooter />; }
  },
  ConfirmSignIn: {
    Header() { return <AuthHeader title="Verify your identity" subtitle="Enter the 6-digit code from your authenticator app." />; },
    Footer() { return <AuthFooter />; }
  },
  SetupTOTP: {
    Header() { return <AuthHeader title="Set up MFA" subtitle="Secure your account with an authenticator app." />; },
    Footer() { return <AuthFooter />; }
  },
  ResetPassword: {
    Header() { return <AuthHeader title="Reset password" subtitle="We'll send you a verification code." />; },
    Footer() { return <AuthFooter />; }
  }
};

const formFields = {
  signIn: {
    username: { placeholder: 'Enter your username', isRequired: true, label: 'Username' },
    password: { placeholder: 'Enter your password', isRequired: true, label: 'Password' },
  },
  confirmSignIn: {
    confirmation_code: { placeholder: '• • • • • •', label: 'Authentication code', isRequired: true },
  },
};

function AuthLayout({ children }: { children: React.ReactNode }) {
  const { authStatus } = useAuthenticator((context) => [context.authStatus]);

  if (authStatus === 'authenticated') return <>{children}</>;

  return (
    <div className="flex h-screen w-full bg-[#F6F7F9]">
      {/* Left Panel */}
      <div className="hidden lg:flex flex-col justify-between w-[45%] max-w-[600px] bg-white border-r border-[#D8DEE7] p-12 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{ backgroundImage: 'linear-gradient(#111827 1px, transparent 1px), linear-gradient(90deg, #111827 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
        </div>
        <div className="relative z-10 flex items-center gap-3">
          <img src="/wbos-logo.png" alt="WBOS" className="w-8 h-8 object-contain" />
          <div className="leading-none mt-1">
            <div className="font-extrabold text-xl tracking-tight text-[#111827]">WBOS</div>
            <div className="text-[9px] font-bold uppercase tracking-widest text-[#667085] mt-0.5">Business Operations System</div>
          </div>
        </div>
        <div className="relative z-10 my-16">
          <h1 className="text-[40px] leading-[1.1] font-extrabold text-[#111827] tracking-tight mb-6">Run your business from one operational layer.</h1>
          <p className="text-lg text-[#667085] font-medium mb-12 max-w-[400px]">Connect conversations, orders, inventory and automation through one AWS-powered control center.</p>
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
                <p className="text-sm text-[#667085] font-medium">Control the fulfillment lifecycle</p>
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
        <div className="relative z-10">
          <div className="text-[10px] font-bold text-[#667085] tracking-widest flex items-center gap-3">
            <span>AWS-NATIVE</span><span className="w-1 h-1 rounded-full bg-[#D8DEE7]"></span>
            <span>EVENT-DRIVEN</span><span className="w-1 h-1 rounded-full bg-[#D8DEE7]"></span>
            <span>WHATSAPP-FIRST</span>
          </div>
        </div>
      </div>
      {/* Right Panel */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 relative overflow-y-auto">
        <div className="lg:hidden flex items-center gap-3 mb-10 self-start max-w-[440px] mx-auto w-full">
          <img src="/wbos-logo.png" alt="WBOS" className="w-7 h-7 object-contain" />
          <div className="leading-none mt-1">
            <div className="font-extrabold text-lg tracking-tight text-[#111827]">WBOS</div>
            <div className="text-[8px] font-bold uppercase tracking-widest text-[#667085] mt-0.5">Business Operations</div>
          </div>
        </div>
        <div className="w-full max-w-[480px] wbos-auth-form-card wbos-auth-shell">
          <Authenticator hideSignUp components={components} formFields={formFields} />
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
