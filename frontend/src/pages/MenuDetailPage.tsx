import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, Container, Typography, Paper, Button, CircularProgress,
  Divider, IconButton, Alert
} from '@mui/material';
import { 
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Print as PrintIcon,
  Download as DownloadIcon
} from '@mui/icons-material';
import { getMenuById, Menu } from '../services/apiService';

const MenuDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const menuRef = useRef<HTMLDivElement>(null);

  const [menu, setMenu] = useState<Menu | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError("No menu ID provided");
      setLoading(false);
      return;
    }

    const fetchMenu = async () => {
      try {
        setLoading(true);
        const data = await getMenuById(parseInt(id));
        setMenu(data);
        setError(null);
      } catch (err) {
        console.error(`Error fetching menu #${id}:`, err);
        setError("Failed to load menu. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchMenu();
  }, [id]);

  const handlePrint = () => {
    const printContent = document.getElementById('printable-menu');
    
    if (printContent) {
      const printWindow = window.open('', '_blank');
      
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>${menu?.name || 'Menu'}</title>
              <style>
                body {
                  font-family: ${menu?.font || 'Playfair Display'}, serif;
                  color: ${menu?.textColor || '#000000'};
                  background-color: ${menu?.backgroundColor || '#ffffff'};
                  margin: 0;
                  padding: 20px;
                }
                .menu-title {
                  text-align: center;
                  margin-bottom: 20px;
                }
                .menu-section {
                  margin-bottom: 30px;
                }
                .section-title {
                  color: ${menu?.accentColor || '#333333'};
                  border-bottom: ${menu?.showSectionDividers ? `1px solid ${menu?.accentColor || '#333333'}` : 'none'};
                  padding-bottom: 5px;
                  margin-bottom: 15px;
                }
                .menu-item {
                  display: flex;
                  justify-content: space-between;
                  margin-bottom: 10px;
                }
                .item-details {
                  flex: 1;
                }
                .item-price {
                  font-weight: bold;
                  min-width: 60px;
                  text-align: right;
                }
                .item-description {
                  font-style: italic;
                  margin-top: 5px;
                  font-size: 0.9em;
                }
                @media print {
                  body {
                    padding: 0.5cm;
                  }
                }
              </style>
            </head>
            <body>
              ${printContent.innerHTML}
            </body>
          </html>
        `);
        printWindow.document.close();
        
        // Wait for the content to load
        printWindow.onload = () => {
          printWindow.print();
        };
      }
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !menu) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <IconButton 
            edge="start" 
            sx={{ mr: 2 }} 
            onClick={() => navigate('/menus')}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" component="h1">
            Error
          </Typography>
        </Box>
        <Alert severity="error">
          {error || "Failed to load menu"}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
      {/* Header with controls */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <IconButton 
          edge="start" 
          sx={{ mr: 2 }} 
          onClick={() => navigate('/menus')}
          aria-label="back to menus"
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1" sx={{ flexGrow: 1 }}>
          {menu.name}
        </Typography>
        <Box>
          <Button 
            startIcon={<EditIcon />} 
            onClick={() => navigate(`/menus/${id}/edit`)}
            sx={{ mr: 1 }}
          >
            Edit
          </Button>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<PrintIcon />}
            onClick={handlePrint}
          >
            Print
          </Button>
        </Box>
      </Box>

      {/* Menu preview */}
      <Paper 
        sx={{ 
          p: 4, 
          mb: 4,
          backgroundColor: menu.backgroundColor || '#ffffff',
          color: menu.textColor || '#000000',
          fontFamily: `${menu.font || 'Playfair Display'}, serif`,
          maxWidth: menu.layout === 'single' ? '600px' : '100%',
          mx: 'auto'
        }}
        ref={menuRef}
      >
        <div id="printable-menu">
          {/* Menu title and subtitle */}
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            {menu.logoPath && (
              <Box sx={{ mb: 2, textAlign: 'center' }}>
                <img 
                  src={menu.logoPath} 
                  alt="Menu logo" 
                  style={{ 
                    maxWidth: '200px', 
                    maxHeight: '200px'
                  }} 
                />
              </Box>
            )}
            <Typography 
              variant="h3" 
              component="h2" 
              sx={{ 
                color: menu.accentColor || '#333333',
                fontFamily: 'inherit'
              }}
            >
              {menu.title || menu.name}
            </Typography>
            {menu.subtitle && (
              <Typography 
                variant="h6" 
                component="p"
                sx={{ mt: 1, fontFamily: 'inherit' }}
              >
                {menu.subtitle}
              </Typography>
            )}
          </Box>

          {/* Menu sections and items */}
          {menu.sections && menu.sections.length > 0 ? (
            menu.sections.map((section) => (
              <Box key={section.id} sx={{ mb: 4 }}>
                <Typography 
                  variant="h5" 
                  component="h3"
                  sx={{ 
                    color: menu.accentColor || '#333333',
                    borderBottom: menu.showSectionDividers ? `1px solid ${menu.accentColor || '#333333'}` : 'none',
                    pb: 1,
                    mb: 2,
                    fontFamily: 'inherit'
                  }}
                >
                  {section.name}
                </Typography>
                
                {section.items && section.items.length > 0 ? (
                  section.items.map((item) => (
                    <Box key={item.id} sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography 
                          variant="h6" 
                          component="h4"
                          sx={{ fontFamily: 'inherit' }}
                        >
                          {item.name}
                        </Typography>
                        <Typography 
                          variant="h6" 
                          component="span"
                          sx={{ fontWeight: 'bold', fontFamily: 'inherit' }}
                        >
                          {item.price && (
                            menu.showDollarSign ? 
                            `$${menu.showDecimals ? item.price : parseFloat(item.price).toFixed(0)}` :
                            `${menu.showDecimals ? item.price : parseFloat(item.price).toFixed(0)}`
                          )}
                        </Typography>
                      </Box>
                      {item.description && (
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            fontStyle: 'italic', 
                            mt: 0.5,
                            fontFamily: 'inherit'
                          }}
                        >
                          {item.description}
                        </Typography>
                      )}
                    </Box>
                  ))
                ) : (
                  <Typography variant="body2">No items in this section</Typography>
                )}
              </Box>
            ))
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6">
                This menu has no sections or items yet
              </Typography>
              <Typography variant="body1" sx={{ mt: 1 }}>
                Edit this menu to add sections and items
              </Typography>
            </Box>
          )}
        </div>
      </Paper>
    </Container>
  );
};

export default MenuDetailPage; 