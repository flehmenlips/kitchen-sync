import React, { useState, useEffect } from 'react';
import { AppBar, Toolbar, Box, Link, Container, IconButton, Drawer, List, ListItem } from '@mui/material';
import { Menu as MenuIcon, Close as CloseIcon } from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: 'transparent',
  boxShadow: 'none',
  transition: 'all 0.3s ease',
  '&.scrolled': {
    backgroundColor: 'rgba(250, 250, 248, 0.95)',
    backdropFilter: 'blur(10px)',
    boxShadow: '0 1px 0 rgba(0, 0, 0, 0.05)',
  }
}));

const NavLink = styled(Link)(({ theme }) => ({
  color: theme.palette.text.primary,
  textDecoration: 'none',
  fontSize: '0.875rem',
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  padding: theme.spacing(1, 2),
  position: 'relative',
  transition: 'opacity 0.3s ease',
  '&:hover': {
    opacity: 0.7,
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: 0,
    left: '50%',
    transform: 'translateX(-50%)',
    width: 0,
    height: '1px',
    backgroundColor: theme.palette.text.primary,
    transition: 'width 0.3s ease',
  },
  '&:hover::after': {
    width: '80%',
  }
}));

const StyledDrawer = styled(Drawer)(({ theme }) => ({
  '& .MuiDrawer-paper': {
    width: '100%',
    backgroundColor: '#fafaf8',
    padding: theme.spacing(4),
  }
}));

const DrawerLink = styled(Link)(({ theme }) => ({
  color: theme.palette.text.primary,
  textDecoration: 'none',
  fontSize: '1.5rem',
  fontFamily: '"Playfair Display", serif',
  letterSpacing: '0.05em',
  padding: theme.spacing(2, 0),
  display: 'block',
  transition: 'opacity 0.3s ease',
  '&:hover': {
    opacity: 0.7,
  }
}));

interface NavigationItem {
  label: string;
  href: string;
  special?: boolean;
}

interface FineDiningNavigationProps {
  items?: NavigationItem[];
  logo?: React.ReactNode;
}

const defaultItems: NavigationItem[] = [
  { label: 'About', href: '#about' },
  { label: 'Menu', href: '#menu' },
  { label: 'Gift Cards', href: '#gift-cards' },
  { label: 'Large Parties', href: '#large-parties' },
  { label: 'Wine Events', href: '#wine-events' },
  { label: '#SeasonalSpecial', href: '#special', special: true },
];

const FineDiningNavigation: React.FC<FineDiningNavigationProps> = ({
  items = defaultItems,
  logo
}) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <>
      <StyledAppBar position="fixed" className={scrolled ? 'scrolled' : ''}>
        <Container maxWidth="lg">
          <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 0, md: 2 } }}>
            {/* Logo */}
            <Box sx={{ flex: 1 }}>
              {logo}
            </Box>

            {/* Desktop Navigation */}
            <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center' }}>
              {items.map((item) => (
                <NavLink
                  key={item.label}
                  href={item.href}
                  sx={{
                    fontStyle: item.special ? 'italic' : 'normal',
                    fontWeight: item.special ? 300 : 400,
                  }}
                >
                  {item.label}
                </NavLink>
              ))}
            </Box>

            {/* Mobile Menu Button */}
            <IconButton
              sx={{ display: { xs: 'block', md: 'none' } }}
              onClick={handleDrawerToggle}
              aria-label="menu"
            >
              <MenuIcon />
            </IconButton>
          </Toolbar>
        </Container>
      </StyledAppBar>

      {/* Mobile Drawer */}
      <StyledDrawer
        anchor="right"
        open={mobileOpen}
        onClose={handleDrawerToggle}
      >
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 4 }}>
          <IconButton onClick={handleDrawerToggle}>
            <CloseIcon />
          </IconButton>
        </Box>
        <List>
          {items.map((item) => (
            <ListItem key={item.label} disablePadding>
              <DrawerLink
                href={item.href}
                onClick={handleDrawerToggle}
                sx={{
                  fontStyle: item.special ? 'italic' : 'normal',
                }}
              >
                {item.label}
              </DrawerLink>
            </ListItem>
          ))}
        </List>
      </StyledDrawer>

      {/* Spacer for fixed navbar */}
      <Toolbar />
    </>
  );
};

export default FineDiningNavigation; 