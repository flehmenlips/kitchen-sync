// LogoTestPage.tsx - Clean test page showing only the exact login page elements
import React from 'react';
import { Container, Box, Typography, Paper } from '@mui/material';
import { KitchenSyncLogo } from '../components/common/KitchenSyncLogo';

const LogoTestPage: React.FC = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Typography variant="h3" className="text-gray-900 font-bold mb-8 text-center">
        KitchenSync Login Page Elements
      </Typography>

      {/* Login Page Style Background */}
      <Paper 
        className="p-8 mb-6 shadow-xl rounded-2xl relative overflow-hidden"
        sx={{ 
          background: 'linear-gradient(135deg, #1f2937 0%, #1e40af 50%, #7c3aed 100%)',
          minHeight: '400px'
        }}
      >
        <Typography variant="h5" className="text-white font-semibold mb-8 text-center">
          EXACT Login Page Layout
        </Typography>
        
        <Box className="flex flex-col items-center justify-center" style={{ minHeight: '300px' }}>
          {/* EXACT Login Page Code - Top Logo */}
          <div style={{
            width: '80px',
            height: '80px',
            background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
            borderRadius: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Inner glow effect */}
            <div style={{
              position: 'absolute',
              inset: '2px',
              background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 100%)',
              borderRadius: '18px',
              pointerEvents: 'none'
            }}></div>
            <img 
              src="/k-table-logo.svg" 
              alt="KitchenSync Logo" 
              style={{ 
                width: '48px', 
                height: '48px',
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
                position: 'relative',
                zIndex: 1
              }}
            />
          </div>

          {/* EXACT Login Page Code - Bottom Text */}
          <div style={{ 
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: '12px'
          }}>
            <KitchenSyncLogo size="xlarge" variant="light" showIcon />
          </div>
        </Box>
      </Paper>

      {/* Complete Logo Files */}
      <Paper className="p-8 shadow-xl rounded-2xl">
        <Typography variant="h5" className="text-gray-900 font-semibold mb-6 text-center">
          Complete Logo - HTML Version
        </Typography>
        
        <Box className="text-center">
          <Typography variant="caption" className="text-gray-500 uppercase tracking-wider mb-4 block">
            Glass-morphism card with EXACT login page elements
          </Typography>
          
          {/* HTML Version - EXACT elements in glass card */}
          <div style={{
            width: '400px',
            height: '300px',
            background: 'linear-gradient(135deg, #1f2937 0%, #1e40af 50%, #7c3aed 100%)',
            backdropFilter: 'blur(10px)',
            borderRadius: '20px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '40px',
            boxSizing: 'border-box',
            margin: '0 auto'
          }}>
            {/* EXACT Login Page Top Logo */}
            <div style={{
              width: '80px',
              height: '80px',
              background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Inner glow effect */}
              <div style={{
                position: 'absolute',
                inset: '2px',
                background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 100%)',
                borderRadius: '18px',
                pointerEvents: 'none'
              }}></div>
              <img 
                src="/k-table-logo.svg" 
                alt="KitchenSync Logo" 
                style={{ 
                  width: '48px', 
                  height: '48px',
                  filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
                  position: 'relative',
                  zIndex: 1
                }}
              />
            </div>
            
            {/* EXACT KitchenSyncLogo Component */}
            <div style={{ marginBottom: '12px' }}>
              <KitchenSyncLogo size="xlarge" variant="light" showIcon />
            </div>
          </div>
        </Box>
      </Paper>
    </Container>
  );
};

export default LogoTestPage;