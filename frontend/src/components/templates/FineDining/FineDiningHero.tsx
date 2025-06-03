import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Container } from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';

const underlineAnimation = keyframes`
  0% { width: 0; }
  50% { width: 100%; }
  100% { width: 0; }
`;

const AnimatedText = styled(Typography)(({ theme }) => ({
  position: 'relative',
  display: 'inline-block',
  '& .underline': {
    position: 'absolute',
    bottom: '0.1em',
    left: 0,
    height: '1px',
    backgroundColor: theme.palette.text.primary,
    animation: `${underlineAnimation} 4s ease-in-out infinite`,
  }
}));

const HeroContainer = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: '#fafaf8',
  position: 'relative',
  padding: theme.spacing(4),
}));

const TaglineContainer = styled(Box)(({ theme }) => ({
  textAlign: 'center',
  marginTop: theme.spacing(4),
  '& .tagline-item': {
    display: 'inline-block',
    padding: theme.spacing(0, 2),
    position: 'relative',
    '&:not(:last-child)::after': {
      content: '"."',
      position: 'absolute',
      right: '-0.5em',
      color: theme.palette.text.secondary,
    }
  }
}));

const CTAButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(6),
  padding: theme.spacing(2, 4),
  fontSize: '0.875rem',
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  border: '1px solid',
  borderColor: theme.palette.text.primary,
  borderRadius: 0,
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundColor: theme.palette.text.primary,
    color: theme.palette.background.paper,
  }
}));

interface FineDiningHeroProps {
  restaurantName: string;
  tagline?: string;
  seasonalWords?: string[];
  ctaText?: string;
  onCTAClick?: () => void;
}

const FineDiningHero: React.FC<FineDiningHeroProps> = ({
  restaurantName,
  tagline = 'Seasonal cuisine. Quality Wine. Good vibes.',
  seasonalWords = ['Seasonal', 'Local', 'Artisanal', 'Fresh'],
  ctaText = 'Book My Table',
  onCTAClick
}) => {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const taglineItems = tagline.split('. ');

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWordIndex((prev) => (prev + 1) % seasonalWords.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [seasonalWords]);

  return (
    <HeroContainer>
      <Container maxWidth="md">
        <Box textAlign="center">
          {/* Restaurant Name */}
          <Typography
            variant="h6"
            sx={{
              letterSpacing: '0.3em',
              textTransform: 'uppercase',
              mb: 4,
              fontWeight: 300,
              fontSize: '0.875rem'
            }}
          >
            Escape to {restaurantName}
          </Typography>

          {/* Animated Seasonal Text */}
          <AnimatedText
            variant="h2"
            sx={{
              fontFamily: '"Playfair Display", serif',
              fontWeight: 300,
              fontSize: { xs: '2.5rem', md: '4rem' },
              letterSpacing: '0.02em',
              mb: 2
            }}
          >
            {seasonalWords[currentWordIndex]}
            <span className="underline" />
          </AnimatedText>

          <Typography
            variant="h2"
            sx={{
              fontFamily: '"Playfair Display", serif',
              fontWeight: 300,
              fontSize: { xs: '2.5rem', md: '4rem' },
              letterSpacing: '0.02em'
            }}
          >
            cuisine
          </Typography>

          {/* Tagline */}
          <TaglineContainer>
            {taglineItems.map((item, index) => (
              <Typography
                key={index}
                variant="body1"
                className="tagline-item"
                sx={{
                  fontFamily: '"Inter", sans-serif',
                  fontSize: '1rem',
                  letterSpacing: '0.05em',
                  color: 'text.secondary'
                }}
              >
                {item}
              </Typography>
            ))}
          </TaglineContainer>

          {/* CTA Button */}
          <CTAButton
            variant="outlined"
            onClick={onCTAClick}
          >
            {ctaText}
          </CTAButton>
        </Box>
      </Container>
    </HeroContainer>
  );
};

export default FineDiningHero; 