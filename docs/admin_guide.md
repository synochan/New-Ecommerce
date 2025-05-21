# E-commerce Admin Guide

This guide provides detailed instructions for administrators on how to manage products, categories, and other aspects of the e-commerce platform.

## Accessing the Admin Interface

1. Navigate to `http://your-domain/admin`
2. Log in with your admin credentials
3. You'll see the main admin dashboard with sections for Categories, Products, Reviews, and other models

## Managing Categories

### Adding a New Category

1. Click on "Categories" in the admin dashboard
2. Click "Add Category" in the top right corner
3. Fill in the following fields:
   - **Name**: The category name (e.g., "Men's Clothing")
   - **Description**: A brief description of the category
   - The **slug** will be automatically generated from the name

### Editing Categories

1. From the Categories list, click on the category name
2. Modify the desired fields
3. Click "Save" to apply changes

## Managing Products

### Adding a New Product

1. Click on "Products" in the admin dashboard
2. Click "Add Product" in the top right corner
3. Fill in the product details in the following sections:

#### Basic Information
- **Name**: Product name
- **Category**: Select from existing categories
- **Description**: Detailed product description
- The **slug** will be automatically generated from the name

#### Pricing & Inventory
- **Price**: Product price (decimal format: 99.99)
- **Stock**: Number of items in stock
- **Available**: Toggle to show/hide product on the site

#### Media
- **Image**: Upload product image (recommended size: 800x800px)
- You'll see an image preview after upload

### Bulk Editing Products

1. From the Products list, you can directly edit:
   - Price
   - Stock
   - Availability
2. Select multiple products using checkboxes
3. Use the action dropdown to perform bulk actions

### Managing Product Images

- Supported formats: JPG, PNG, WebP
- Maximum file size: 5MB
- Recommended dimensions: 800x800 pixels
- Images are automatically resized and optimized

## Best Practices

### Product Information
1. Use clear, descriptive product names
2. Write detailed product descriptions
3. Include accurate pricing and stock information
4. Use high-quality product images

### Category Management
1. Keep category structure simple and logical
2. Use descriptive category names
3. Add helpful category descriptions
4. Regularly review and update categories

### Inventory Management
1. Regularly update stock levels
2. Set up low stock alerts
3. Mark products as unavailable when out of stock
4. Review product availability regularly

## Monitoring and Analytics

### Product Views
- Track product view statistics in the ProductView section
- Monitor which products are most viewed
- Track user engagement with products

### Product Reviews
- Moderate product reviews in the ProductReview section
- Monitor product ratings
- Address customer feedback promptly

## Troubleshooting

### Common Issues

1. **Images not displaying**
   - Check image file size and format
   - Verify media storage configuration
   - Ensure proper file permissions

2. **Slug conflicts**
   - Manually modify the slug to be unique
   - Use more specific product names

3. **Stock management**
   - Regularly audit stock levels
   - Update stock counts after inventory checks

### Getting Help

For technical support:
1. Check the error logs
2. Contact the technical team
3. Refer to the Django documentation

## Security Best Practices

1. Regularly change admin passwords
2. Use strong passwords
3. Log out after admin sessions
4. Monitor admin activity logs
5. Restrict admin access to trusted personnel 