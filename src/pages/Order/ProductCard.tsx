import { FC } from 'react';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import ErrorImage from '../../assets/ErrorImage.png';
export interface ProductCardProps {
  product: Product;
  onProductSubmit: (product: Product) => void;
}

const ProductCard: FC<ProductCardProps> = ({ product, onProductSubmit }) => {
  return (
    <div
      key={product.id}
      className="flex flex-col bg-white border shadow-sm rounded-xl dark:bg-neutral-900 dark:border-neutral-700 dark:shadow-neutral-700/70 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      style={{ backgroundColor: 'white', borderColor: '#F6F6F6' }}
      role="button"
      aria-label={`Agregar ${product.name} al carrito`}
      tabIndex={0}
      onClick={() => onProductSubmit(product)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onProductSubmit(product);
        }
      }}
    >
      <div className="relative">
        <div className="w-full flex items-center justify-center p-2">
          <div className="w-full aspect-[5/4] bg-white rounded-md flex items-center justify-center overflow-hidden">
            <LazyLoadImage
              src={product.image}
              alt={product.name}
              placeholderSrc={ErrorImage}
              className="max-h-full max-w-full object-contain"
            />
          </div>
        </div>
      </div>
      <div className="px-4 pb-4 flex flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-col">
            <span className="text-[11px] text-gray-500">{product.productKey}</span>
            <span className="text-base font-semibold text-gray-900">{product.name}</span>
            <span className="text-xs text-gray-500">{product?.category?.name}</span>
          </div>
        </div>

        <div className="flex items-center justify-center w-full">
          <button
            aria-label={`Agregar ${product.name} al carrito`}
            tabIndex={0}
            onClick={(e) => {
              e.stopPropagation();
              onProductSubmit(product);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                e.stopPropagation();
                onProductSubmit(product);
              }
            }}
            className="w-full rounded-md bg-primary px-4 py-2 text-white hover:bg-primary/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            Agregar
          </button>
        </div>
      </div>
    </div>
  );
};
export default ProductCard;
