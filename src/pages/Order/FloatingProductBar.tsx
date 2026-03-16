import { MenuItem, Skeleton, TextField } from '@mui/material';
import { FC, useEffect, useMemo, useState } from 'react';
import { totalHelper } from '../../utils/orderUtil';

export interface FloatingProductBarProps {
  product: Product | null;
  onAdd: (orderDetail: OrderDetail) => void;
  onClear: () => void;
}

const currencyFormatter = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
  minimumFractionDigits: 2,
});

const FloatingProductBar: FC<FloatingProductBarProps> = ({ product, onAdd, onClear }) => {
  const [quantity, setQuantity] = useState<number>(0);
  const [selectedUnitId, setSelectedUnitId] = useState<number | undefined>(undefined);
  const [selectedUnitName, setSelectedUnitName] = useState<string>('');
  const [unitPrice, setUnitPrice] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (!product) {
      setQuantity(0);
      setSelectedUnitId(undefined);
      setSelectedUnitName('');
      setUnitPrice(0);
      setIsSubmitting(false);
      return;
    }
    // Initialize selection with product's base unit
    setQuantity(1);
    setSelectedUnitId(product.unitId);
    setSelectedUnitName(product.unit?.name || '');
    setUnitPrice(product.priceUnit);
  }, [product]);

  const total = useMemo(() => {
    if (!product || !selectedUnitId) return 0;
    return totalHelper(quantity, unitPrice, selectedUnitId, product);
  }, [product, quantity, unitPrice, selectedUnitId]);

  const handleDecrease = () => {
    setQuantity((q) => (q > 0 ? q - 1 : 0));
  };
  const handleIncrease = () => {
    setQuantity((q) => q + 1);
  };
  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    if (Number.isNaN(value) || value < 0) {
      setQuantity(0);
      return;
    }
    setQuantity(value);
  };

  const handleUnitChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    newUnitId: number,
    newUnitName: string,
    newUnitPrice: number,
  ) => {
    setSelectedUnitId(newUnitId);
    setSelectedUnitName(newUnitName);
    setUnitPrice(newUnitPrice);
  };

  const handleAdd = async () => {
    if (!product || !selectedUnitId) return;
    setIsSubmitting(true);
    const detail: OrderDetail = {
      quantity,
      price: unitPrice,
      unitId: selectedUnitId,
      productId: product.id || 0,
      total: totalHelper(quantity, unitPrice, selectedUnitId, product) || 0,
      productName: product.name,
      unitName: selectedUnitName,
    };
    onAdd(detail);
    // Briefly show skeleton to indicate processing, then clear
    setTimeout(() => {
      setIsSubmitting(false);
      onClear();
    }, 300);
  };

  if (!product) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40">
      <div className="mx-auto max-w-7xl">
        <div className="m-3 rounded-xl bg-white shadow-lg border border-slate-200">
          {isSubmitting ? (
            <div className="p-4 grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
              <Skeleton variant="text" height={28} className="lg:col-span-3" />
              <Skeleton variant="rectangular" height={44} className="lg:col-span-3" />
              <Skeleton variant="rectangular" height={44} className="lg:col-span-3" />
              <Skeleton variant="rectangular" height={44} className="lg:col-span-3" />
            </div>
          ) : (
            <div className="p-4 grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
              {/* Product info */}
              <div className="flex flex-col lg:col-span-3">
                <span className="text-sm text-slate-500">{product.category?.name}</span>
                <span className="text-lg font-semibold text-slate-900">{product.name}</span>
                <span className="text-sm text-slate-700">{currencyFormatter.format(total)}</span>
              </div>

              {/* Quantity controls */}
              <div className="flex items-center gap-2 lg:col-span-3">
                <button
                  className="h-10 w-10 rounded-md border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  aria-label="Disminuir cantidad"
                  tabIndex={0}
                  onClick={handleDecrease}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleDecrease();
                    }
                  }}
                >
                  -
                </button>
                <input
                  className="h-10 w-20 rounded-md border border-slate-300 px-3 text-center focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  type="number"
                  inputMode="decimal"
                  min={0}
                  step="any"
                  aria-label="Cantidad"
                  value={quantity}
                  onChange={handleQuantityChange}
                />
                <button
                  className="h-10 w-10 rounded-md border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  aria-label="Aumentar cantidad"
                  tabIndex={0}
                  onClick={handleIncrease}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleIncrease();
                    }
                  }}
                >
                  +
                </button>
              </div>

              {/* Unit selector */}
              <div className="flex items-center lg:col-span-3">
                <TextField
                  select
                  label="Unidad"
                  fullWidth
                  value={selectedUnitId}
                  onChange={(e) => {
                    const newId = Number(e.target.value);
                    if (!product) return;
                    if (newId === product.unit?.id) {
                      handleUnitChange(
                        e,
                        product.unit?.id || product.unitId,
                        product.unit?.name || '',
                        product.priceUnit,
                      );
                      return;
                    }
                    const match = product.equivalentUnits?.find((eu) => eu.unit?.id === newId);
                    if (match) {
                      handleUnitChange(e, match.unit?.id || match.unitId, match.unit?.name || '', match.equivalent);
                    }
                  }}
                >
                  <MenuItem value={product.unit?.id}>{product.unit?.name}</MenuItem>
                  {product.equivalentUnits?.map((eu) => (
                    <MenuItem key={eu.unit?.id} value={eu.unit?.id}>
                      {eu.unit?.name}
                    </MenuItem>
                  ))}
                </TextField>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 lg:col-span-3">
                <button
                  className="rounded-md border border-slate-300 bg-white px-4 py-2 text-slate-700 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  aria-label="Quitar selección"
                  onClick={onClear}
                >
                  Quitar
                </button>
                <button
                  className="rounded-md bg-primary px-4 py-2 text-white hover:bg-primary/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50"
                  aria-label="Agregar al carrito"
                  onClick={handleAdd}
                  disabled={!product || quantity <= 0 || !selectedUnitId}
                >
                  Agregar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FloatingProductBar;
