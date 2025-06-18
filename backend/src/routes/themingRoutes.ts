import express from 'express';
import { themingController } from '../controllers/themingController';

const router = express.Router();

// Color Palette Routes
router.get('/restaurants/:restaurantId/color-palettes', themingController.getColorPalettes);
router.get('/restaurants/:restaurantId/color-palettes/active', themingController.getActiveColorPalette);
router.post('/restaurants/:restaurantId/color-palettes', themingController.createColorPalette);
router.put('/color-palettes/:paletteId', themingController.updateColorPalette);
router.post('/restaurants/:restaurantId/color-palettes/:paletteId/activate', themingController.setActiveColorPalette);
router.delete('/color-palettes/:paletteId', themingController.deleteColorPalette);

// Typography Configuration Routes
router.get('/restaurants/:restaurantId/typography-configs', themingController.getTypographyConfigs);
router.get('/restaurants/:restaurantId/typography-configs/active', themingController.getActiveTypographyConfig);
router.post('/restaurants/:restaurantId/typography-configs', themingController.createTypographyConfig);
router.put('/typography-configs/:configId', themingController.updateTypographyConfig);
router.post('/restaurants/:restaurantId/typography-configs/:configId/activate', themingController.setActiveTypographyConfig);
router.delete('/typography-configs/:configId', themingController.deleteTypographyConfig);

// Brand Asset Routes
router.get('/restaurants/:restaurantId/brand-assets', themingController.getBrandAssets);
router.post('/restaurants/:restaurantId/brand-assets', themingController.createBrandAsset);
router.put('/brand-assets/:assetId', themingController.updateBrandAsset);
router.post('/restaurants/:restaurantId/brand-assets/:assetId/set-primary', themingController.setPrimaryBrandAsset);
router.delete('/brand-assets/:assetId', themingController.deleteBrandAsset);

// Utility Routes
router.get('/predefined-color-schemes', themingController.getPredefinedColorSchemes);
router.post('/extract-colors', themingController.extractColorsFromImage);
router.get('/google-fonts', themingController.getGoogleFonts);
router.get('/font-pairings', themingController.getFontPairings);

export default router; 