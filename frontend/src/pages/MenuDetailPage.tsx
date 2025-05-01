import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, Container, Typography, Paper, Button, CircularProgress,
  Divider, IconButton, Alert, Grid
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
        // Get the active sections and items for the menu
        const activeSections = menu?.sections?.filter(section => !section.deleted && section.active) || [];
        
        // Create column layout based on menu settings
        const isDoubleColumn = menu?.layout === 'double';
        const isGridLayout = menu?.layout === 'grid';
        
        printWindow.document.write(`
          <html>
            <head>
              <title>${menu?.name || 'Menu'}</title>
              <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Roboto:wght@300;400;500;700&family=Lora:ital,wght@0,400;0,700;1,400&family=Montserrat:wght@300;400;500;700&family=Oswald:wght@300;400;500;700&display=swap" rel="stylesheet">
              <style>
                @media print {
                  @page { 
                    size: letter;
                    margin: 0.5cm; 
                  }
                }
                
                body {
                  font-family: ${menu?.font || 'Playfair Display'}, serif;
                  color: ${menu?.textColor || '#000000'};
                  background-color: ${menu?.backgroundColor || '#ffffff'};
                  margin: 0;
                  padding: 15px;
                  box-sizing: border-box;
                }
                
                .menu-container {
                  max-width: 100%;
                  margin: 0 auto;
                }
                
                .menu-header {
                  text-align: center;
                  margin-bottom: 20px;
                }
                
                .menu-logo {
                  max-width: 200px;
                  max-height: 100px;
                  display: block;
                  margin: 0 auto 15px;
                }
                
                .menu-title {
                  color: ${menu?.accentColor || '#333333'};
                  font-size: 24px;
                  margin: 0 0 5px;
                  font-weight: bold;
                }
                
                .menu-subtitle {
                  font-size: 16px;
                  margin: 0;
                  font-style: italic;
                }
                
                .menu-content {
                  ${isDoubleColumn ? `
                    column-count: 2;
                    column-gap: 40px;
                    column-fill: balance;
                  ` : ''}
                }
                
                .menu-section {
                  break-inside: avoid;
                  margin-bottom: 25px;
                  page-break-inside: avoid;
                }
                
                .section-title {
                  color: ${menu?.accentColor || '#333333'};
                  font-size: 18px;
                  border-bottom: ${menu?.showSectionDividers ? `1px solid ${menu?.accentColor || '#333333'}` : 'none'};
                  padding-bottom: 5px;
                  margin-bottom: 15px;
                  font-weight: bold;
                }
                
                .menu-item {
                  margin-bottom: 12px;
                  page-break-inside: avoid;
                }
                
                .item-header {
                  display: flex;
                  justify-content: space-between;
                  align-items: baseline;
                }
                
                .item-name {
                  font-weight: bold;
                  font-size: 16px;
                  margin: 0;
                }
                
                .item-price {
                  font-weight: bold;
                  font-size: 16px;
                  margin: 0;
                  text-align: right;
                  min-width: 60px;
                }
                
                .item-description {
                  font-style: italic;
                  font-size: 14px;
                  margin: 4px 0 0;
                }
                
                ${isGridLayout ? `
                  .menu-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 20px;
                  }
                  
                  .grid-section {
                    break-inside: avoid;
                    page-break-inside: avoid;
                  }
                ` : ''}
                
                /* Font size adjustments */
                .small-text .item-name { font-size: 14px; }
                .small-text .item-price { font-size: 14px; }
                .small-text .item-description { font-size: 12px; }
                .small-text .section-title { font-size: 16px; }
                
                .large-text .item-name { font-size: 18px; }
                .large-text .item-price { font-size: 18px; }
                .large-text .item-description { font-size: 16px; }
                .large-text .section-title { font-size: 22px; }
              </style>
            </head>
            <body class="normal-text">
              <div class="menu-container">
                <div class="menu-header">
                  ${menu?.logoPath ? `<img src="${menu.logoPath}" alt="Menu logo" class="menu-logo" />` : ''}
                  <h1 class="menu-title">${menu?.title || menu?.name}</h1>
                  ${menu?.subtitle ? `<p class="menu-subtitle">${menu.subtitle}</p>` : ''}
                </div>
                
                ${isGridLayout ? '<div class="menu-grid">' : '<div class="menu-content">'}
                ${activeSections.map(section => {
                  return `
                    <div class="${isGridLayout ? 'grid-section' : 'menu-section'}">
                      <h2 class="section-title">${section.name}</h2>
                      ${section.items
                        .filter(item => !item.deleted && item.active)
                        .map(item => {
                          return `
                            <div class="menu-item">
                              <div class="item-header">
                                <h3 class="item-name">${item.name}</h3>
                                ${item.price ? `
                                  <p class="item-price">
                                    ${menu?.showDollarSign ? '$' : ''}${menu?.showDecimals ? item.price : parseFloat(item.price || '0').toFixed(0)}
                                  </p>
                                ` : ''}
                              </div>
                              ${item.description ? `<p class="item-description">${item.description}</p>` : ''}
                            </div>
                          `;
                        }).join('')}
                    </div>
                  `;
                }).join('')}
                </div>
              </div>
              
              <script>
                window.onload = function() {
                  window.print();
                  // Uncomment the line below if you want to close the print window after printing
                  // setTimeout(function() { window.close(); }, 500);
                };
              </script>
            </body>
          </html>
        `);
        printWindow.document.close();
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

  // Filter for active sections and items
  const activeSections = menu.sections?.filter(section => !section.deleted && section.active) || [];

  // Determine if we should show as single column, two column or grid
  const isDoubleColumn = menu.layout === 'double';
  const isGridLayout = menu.layout === 'grid';

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
          mx: 'auto',
          overflow: 'hidden'
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
                    maxHeight: '80px',
                    objectFit: 'contain'
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
          {activeSections.length > 0 ? (
            isGridLayout ? (
              // Grid Layout
              <Grid container spacing={4}>
                {activeSections.map((section) => (
                  <Grid item xs={12} md={6} key={section.id}>
                    <Box sx={{ mb: 4 }}>
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
                      
                      {section.items && section.items.filter(item => !item.deleted && item.active).length > 0 ? (
                        // Display active items
                        section.items
                          .filter(item => !item.deleted && item.active)
                          .map((item) => (
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
                  </Grid>
                ))}
              </Grid>
            ) : isDoubleColumn ? (
              // Two-column layout
              <Box sx={{ 
                columnCount: 2, 
                columnGap: '40px',
                columnFill: 'balance',
                '@media print': {
                  columnCount: 2
                }
              }}>
                {activeSections.map((section) => (
                  <Box 
                    key={section.id} 
                    sx={{ 
                      mb: 4, 
                      breakInside: 'avoid',
                      pageBreakInside: 'avoid'
                    }}
                  >
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
                    
                    {section.items && section.items.filter(item => !item.deleted && item.active).length > 0 ? (
                      // Display active items
                      section.items
                        .filter(item => !item.deleted && item.active)
                        .map((item) => (
                          <Box 
                            key={item.id} 
                            sx={{ 
                              mb: 2,
                              breakInside: 'avoid',
                              pageBreakInside: 'avoid'
                            }}
                          >
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
                ))}
              </Box>
            ) : (
              // Single column layout
              activeSections.map((section) => (
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
                  
                  {section.items && section.items.filter(item => !item.deleted && item.active).length > 0 ? (
                    // Display active items
                    section.items
                      .filter(item => !item.deleted && item.active)
                      .map((item) => (
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
            )
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