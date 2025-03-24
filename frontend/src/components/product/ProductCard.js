import React from 'react';
import { Link } from 'react-router-dom';
import { formatNaira } from '../../utils/formatters';
import { useCart } from '../../context/CartContext';
import styled from 'styled-components';

// Styled components for the product card
const CardContainer = styled.div`
  background-color: #FFFFFF;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  position: relative;
  border: 1px solid #F5F5F5;
  height: 100%;
  display: flex;
  flex-direction: column;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 10px 20px rgba(59, 130, 246, 0.1);
  }
`;

const ImageContainer = styled.div`
  position: relative;
  height: 180px;
  overflow: hidden;
  background-color: #F5F5F5;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  
  img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
    transition: transform 0.3s ease;
  }
  
  &:hover img {
    transform: scale(1.05);
  }
`;

const FeaturedBadge = styled.div`
  position: absolute;
  top: 10px;
  left: 10px;
  background-color: #10B981;
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 4px;
  z-index: 10;
`;

const NewBadge = styled.div`
  position: absolute;
  top: 10px;
  left: 10px;
  background-color: #10B981;
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 4px;
  z-index: 10;
`;

const DealRibbon = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 0 80px 80px 0;
  border-color: transparent #dc2626 transparent transparent;
  z-index: 2;
  
  &::after {
    content: '20% OFF';
    position: absolute;
    top: 18px;
    right: -68px;
    color: white;
    font-size: 11px;
    font-weight: bold;
    transform: rotate(45deg);
    text-transform: uppercase;
  }
`;

const CardContent = styled.div`
  padding: 16px;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
`;

const ProductName = styled.h3`
  color: #2E2E2E;
  font-size: 16px;
  font-weight: 500;
  margin: 8px 0;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const RatingContainer = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 12px;
`;

const StarRating = styled.div`
  display: flex;
  color: #FFB200;
`;

const ReviewCount = styled.span`
  color: #6B7280;
  font-size: 14px;
  margin-left: 4px;
`;

const PriceContainer = styled.div`
  margin-top: auto;
`;

const SalePrice = styled.div`
  color: #FFB200;
  font-weight: 700;
  font-size: 18px;
`;

const BasePrice = styled.div`
  color: #9CA3AF;
  text-decoration: line-through;
  font-size: 14px;
  margin-top: 2px;
`;

const AddToCartButton = styled.button`
  background-color: #3B82F6;
  color: white;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  position: absolute;
  bottom: 16px;
  right: 16px;
  box-shadow: 0 4px 6px rgba(59, 130, 246, 0.25);
  
  &:hover {
    background-color: #2563EB;
    transform: scale(1.1);
  }
  
  &:disabled {
    background-color: #D1D5DB;
    cursor: not-allowed;
    transform: none;
  }
`;

/**
 * Product card component for displaying product in grid or list view
 * @param {Object} props - Component props
 * @param {Object} props.product - Product data
 * @param {string} props.viewType - View type (grid or list)
 * @param {boolean} props.showNewBadge - Whether to show the NEW badge
 */
const ProductCard = ({ product, viewType = 'grid', showNewBadge = false }) => {
  const { addToCart, loading } = useCart();
  
  // Handle add to cart
  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
  };
  
  // Check if product has a discount
  const hasDiscount = product.sale_price && product.sale_price < product.base_price;
  
  // Calculate discount percentage
  const discountPercentage = hasDiscount
    ? Math.round(((product.base_price - product.sale_price) / product.base_price) * 100)
    : 0;
  
  // Generate stars for rating
  const renderStars = () => {
    const stars = [];
    const rating = product.rating || 4; // Default to 4 if not provided
    const reviewCount = product.review_count || 120; // Default to 120 if not provided
    
    for (let i = 1; i <= 5; i++) {
      if (i <= rating) {
        stars.push(
          <svg key={i} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
            <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
          </svg>
        );
      } else {
        stars.push(
          <svg key={i} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="16" height="16">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
        );
      }
    }
    
    return (
      <RatingContainer>
        <StarRating>{stars}</StarRating>
        <ReviewCount>({reviewCount})</ReviewCount>
      </RatingContainer>
    );
  };
  
  if (viewType === 'grid') {
    return (
      <CardContainer>
        <Link to={`/products/${product.slug}`} style={{ textDecoration: 'none' }}>
          <ImageContainer>
            <img 
              src={product.image_url || product.image} 
              alt={product.name} 
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = `https://via.placeholder.com/300x300?text=${encodeURIComponent(product.name)}`;
              }}
            />
            
            {product.is_featured && <FeaturedBadge>Featured</FeaturedBadge>}
            {showNewBadge && <NewBadge>NEW</NewBadge>}
            {hasDiscount && <DealRibbon />}
          </ImageContainer>
          
          <CardContent>
            {renderStars()}
            
            <ProductName>{product.name}</ProductName>
            
            <PriceContainer>
              <SalePrice>{formatNaira(product.sale_price || product.base_price)}</SalePrice>
              {hasDiscount && (
                <BasePrice>{formatNaira(product.base_price)}</BasePrice>
              )}
            </PriceContainer>
          </CardContent>
        </Link>
        
        <AddToCartButton
          onClick={handleAddToCart}
          disabled={loading || (product.stock_quantity !== undefined && product.stock_quantity <= 0)}
          aria-label="Add to cart"
        >
          {loading ? (
            <span className="animate-spin">⟳</span>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="20" height="20">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          )}
        </AddToCartButton>
      </CardContainer>
    );
  }
  
  // List view - simplified for now as we're focusing on the grid view
  return (
    <CardContainer>
      <div style={{ display: 'flex', flexDirection: 'column', '@media (min-width: 768px)': { flexDirection: 'row' } }}>
        <div style={{ position: 'relative', height: '180px', width: '100%', '@media (min-width: 768px)': { width: '33%' } }}>
          <Link to={`/products/${product.slug}`}>
            <img 
              src={product.image_url || product.image} 
              alt={product.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = `https://via.placeholder.com/300x300?text=${encodeURIComponent(product.name)}`;
              }}
            />
          </Link>
          
          {product.is_featured && <FeaturedBadge>Featured</FeaturedBadge>}
          {showNewBadge && <NewBadge>NEW</NewBadge>}
          {hasDiscount && <DealRibbon />}
        </div>
        
        <div style={{ padding: '16px', width: '100%', '@media (min-width: 768px)': { width: '67%' } }}>
          <Link to={`/products/${product.slug}`} style={{ textDecoration: 'none' }}>
            {renderStars()}
            <ProductName style={{ fontSize: '18px' }}>{product.name}</ProductName>
            
            <p style={{ fontSize: '14px', color: '#4B5563', margin: '8px 0 16px', lineHeight: '1.5' }}>
              {product.description && product.description.length > 120 
                ? `${product.description.substring(0, 120)}...` 
                : product.description}
            </p>
          </Link>
          
          <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <SalePrice style={{ fontSize: '20px' }}>{formatNaira(product.sale_price || product.base_price)}</SalePrice>
              {hasDiscount && (
                <BasePrice>{formatNaira(product.base_price)}</BasePrice>
              )}
            </div>
            
            <button
              onClick={handleAddToCart}
              disabled={loading || (product.stock_quantity !== undefined && product.stock_quantity <= 0)}
              style={{
                backgroundColor: '#3B82F6',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 4px 6px rgba(59, 130, 246, 0.25)'
              }}
            >
              {loading ? (
                <span style={{ animation: 'spin 1s linear infinite' }}>⟳</span>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="20" height="20">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </CardContainer>
  );
};

export default ProductCard;
