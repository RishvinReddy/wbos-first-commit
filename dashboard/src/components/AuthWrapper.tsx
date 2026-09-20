"use client";

import { Authenticator, useAuthenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';

function AuthHeader({ title, subtitle }: { title: string, subtitle: string }) {
  return (
    <div style={{ marginBottom: '30px' }}>
      <div className="flex items-center gap-3" style={{ marginBottom: '44px' }}>
        <img src="/wbos-logo.png" alt="WBOS" style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
        <div className="leading-none text-left mt-0.5">
          <div style={{ fontWeight: 700, fontSize: '14px', letterSpacing: '0', color: '#111827' }}>WBOS</div>
          <div style={{ fontWeight: 700, fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#667085', marginTop: '2px' }}>Business Operations System</div>
        </div>
      </div>
      <h2 style={{ fontSize: 'clamp(32px, 3vw, 40px)', fontWeight: 700, lineHeight: 1.08, letterSpacing: '-0.03em', color: '#101828', marginBottom: '10px' }}>{title}</h2>
      <p style={{ fontSize: '15px', lineHeight: 1.55, color: '#667085', margin: 0 }}>{subtitle}</p>
    </div>
  );
}

function AuthFooter() {
  return (
    <div style={{ marginTop: '28px' }}>
      <div style={{ borderTop: '1px solid #EAECF0', paddingTop: '24px', marginBottom: '28px' }}>
        <div className="flex items-start gap-2.5">
           <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#0F8A9A', marginTop: '6px', flexShrink: 0 }}></div>
           <div>
             <div style={{ fontSize: '13px', fontWeight: 650, color: '#344054', marginBottom: '2px' }}>Secure workspace access</div>
             <div style={{ fontSize: '12px', color: '#667085' }}>Protected by Amazon Cognito · MFA enabled</div>
           </div>
        </div>
      </div>
      
      <div>
        <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em', color: '#344054', marginBottom: '8px' }}>WBOS · BUSINESS OPERATIONS SYSTEM</div>
        <div style={{ fontSize: '9px', fontWeight: 600, letterSpacing: '0.08em', color: '#98A2B3' }}>AWS-NATIVE · EVENT-DRIVEN · WHATSAPP-FIRST</div>
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
    <div className="auth-page-root">
      {/* Left Panel */}
      <div className="hidden lg:flex flex-col bg-[#FFFFFF] border-r border-[#D8DEE7] relative overflow-hidden" 
           style={{ paddingTop: '64px', paddingBottom: '48px', paddingLeft: 'clamp(32px, 5vw, 72px)', paddingRight: 'clamp(32px, 5vw, 72px)' }}>
        
        {/* Grid Background */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: 'linear-gradient(rgba(15, 23, 42, 0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(15, 23, 42, 0.045) 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
        </div>

        <div className="relative z-10 w-full mx-auto flex flex-col h-full justify-between" style={{ maxWidth: '570px' }}>
          
          <div className="flex items-center gap-3">
            <img src="/wbos-logo.png" alt="WBOS" className="object-contain" style={{ width: '32px', height: '32px' }} />
            <div className="leading-none mt-1">
              <div style={{ fontWeight: 800, fontSize: '20px', letterSpacing: '-0.02em', color: '#111827' }}>WBOS</div>
              <div style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#667085', marginTop: '2px' }}>Business Operations System</div>
            </div>
          </div>
          
          <div className="my-auto py-12">
            <h1 style={{ fontSize: '40px', lineHeight: 1.1, fontWeight: 800, color: '#111827', letterSpacing: '-0.02em', marginBottom: '24px' }}>Run your business from one operational layer.</h1>
            <p style={{ fontSize: '18px', color: '#667085', fontWeight: 500, marginBottom: '48px', maxWidth: '400px' }}>Connect conversations, orders, inventory and automation through one AWS-powered control center.</p>
            <div className="space-y-8">
              <div className="flex gap-4">
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#0F8A9A', width: '24px', flexShrink: 0, paddingTop: '2px' }}>01</div>
                <div>
                  <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#111827', marginBottom: '4px' }}>Conversations</h3>
                  <p style={{ fontSize: '14px', color: '#667085', fontWeight: 500, margin: 0 }}>Customer communication through WhatsApp</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#0F8A9A', width: '24px', flexShrink: 0, paddingTop: '2px' }}>02</div>
                <div>
                  <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#111827', marginBottom: '4px' }}>Orders</h3>
                  <p style={{ fontSize: '14px', color: '#667085', fontWeight: 500, margin: 0 }}>Control the fulfillment lifecycle</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#0F8A9A', width: '24px', flexShrink: 0, paddingTop: '2px' }}>03</div>
                <div>
                  <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#111827', marginBottom: '4px' }}>Inventory</h3>
                  <p style={{ fontSize: '14px', color: '#667085', fontWeight: 500, margin: 0 }}>Track stock in real time</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#0F8A9A', width: '24px', flexShrink: 0, paddingTop: '2px' }}>04</div>
                <div>
                  <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#111827', marginBottom: '4px' }}>Automation</h3>
                  <p style={{ fontSize: '14px', color: '#667085', fontWeight: 500, margin: 0 }}>Respond to operational events automatically</p>
                </div>
              </div>
            </div>
          </div>

          <div style={{ fontSize: '10px', fontWeight: 700, color: '#667085', letterSpacing: '0.1em', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span>AWS-NATIVE</span><span style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: '#D8DEE7' }}></span>
            <span>EVENT-DRIVEN</span><span style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: '#D8DEE7' }}></span>
            <span>WHATSAPP-FIRST</span>
          </div>

        </div>
      </div>

      {/* Right Panel */}
      <div className="flex items-center justify-center p-6 md:p-12 box-border" style={{ backgroundColor: '#F6F7F9' }}>
        
        {/* Mobile Header (Hidden on Desktop) */}
        <div className="lg:hidden absolute top-8 left-8 flex items-center gap-3">
          <img src="/wbos-logo.png" alt="WBOS" className="object-contain" style={{ width: '24px', height: '24px' }} />
          <div className="leading-none mt-1">
            <div style={{ fontWeight: 800, fontSize: '16px', letterSpacing: '-0.02em', color: '#111827' }}>WBOS</div>
          </div>
        </div>

        <div className="wbos-auth-form-card wbos-auth-shell">
          <div className="auth-content">
            <Authenticator hideSignUp components={components} formFields={formFields} />
          </div>
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
