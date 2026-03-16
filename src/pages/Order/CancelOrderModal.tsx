import { Button } from '@mui/material';
import ModalTemplate from '../../components/ModalTemplate/ModalTemplate';

export interface CancelOrderModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const CancelOrderModal: React.FC<CancelOrderModalProps> = ({ open, onClose, onConfirm }) => {
  return (
    <ModalTemplate open={open} handleOnClose={onClose} title="Cancelar orden">
      <div className="px-6 pb-6">
        <p className="text-gray-700 mb-4">¿Seguro que deseas cancelar la orden? Esta acción no se puede deshacer.</p>
        <div className="flex gap-3 justify-end">
          <Button variant="contained" style={{ backgroundColor: '#F6F6FB', color: 'black' }} onClick={onClose}>
            No, volver
          </Button>
          <Button variant="contained" style={{ backgroundColor: '#900A20', color: 'white' }} onClick={onConfirm}>
            Sí, cancelar
          </Button>
        </div>
      </div>
    </ModalTemplate>
  );
};

export default CancelOrderModal;
