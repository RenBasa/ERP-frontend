import { UseQueryResult } from '@tanstack/react-query';
import ProductCard from './ProductCard';

export interface OrderInventoryGridProps {
  productsQuery: UseQueryResult<Product[], Error>;
  onProductSubmit: (product: Product) => void;
}
const OrderInventoryGrid: React.FC<OrderInventoryGridProps> = ({ productsQuery, onProductSubmit }) => {
  // Hooks

  // handlers and helper funcionts
  return (
    <div className="grid w-full items-stretch justify-center gap-3 p-3 grid-cols-[repeat(auto-fill,minmax(160px,1fr))]">
      {productsQuery.data?.map((product) => (
        <div className="flex h-full" key={product.id}>
          <ProductCard onProductSubmit={onProductSubmit} product={product} />
        </div>
      ))}
    </div>
  );
};

export default OrderInventoryGrid;
