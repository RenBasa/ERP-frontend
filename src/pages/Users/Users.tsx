import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { changePassword, createUser, getUsers, updateUser } from '../../services/user.service';
import { toast } from 'react-toastify';
import { Button, IconButton, TextField } from '@mui/material';
import { useState } from 'react';
import { CompactTable } from '@table-library/react-table-library/compact';
import { useTheme } from '@table-library/react-table-library/theme';
import { DEFAULT_OPTIONS, getTheme } from '@table-library/react-table-library/material-ui';
import { Add, EditOutlined, PasswordOutlined } from '@mui/icons-material';
import UsersModal from './UsersModal';
import InfoBar from '../../layouts/InfoBar/InfoBar';
import CustomLoading from '../../components/CustomLoading/CustomLoading';

const userModel: UserTable = {
  id: 0,
  username: '',
  first_name: '',
  last_name: '',
  rol: 'Admin',
};
type modes = 'Add' | 'Edit' | 'Update' | '';
const Users = () => {
  const [search, setSearch] = useState('');
  const [openModal, setOpenModal] = useState(false);
  const [mode, setMode] = useState<modes>('');
  const [userId, setUserId] = useState<number>(0);
  const queryClient = useQueryClient();
  const [userModelState, setUserModelState] = useState(userModel);
  const [userUsername, setUserUsername] = useState<string | undefined>();

  const users = useQuery({ queryKey: ['users'], queryFn: getUsers });
  const { mutate: createUserMutate } = useMutation({
    mutationFn: (user: User) => createUser(user),
    onSuccess: () => {
      handleOnCloseModal();
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: () => toast.error('Error al crear un nuevo usuario'),
  });
  const { mutate: editUserMutate } = useMutation({
    mutationFn: (user: UserTable) => updateUser(user.id, user),
    onSuccess: () => {
      handleOnCloseModal();
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: () => toast.error('Error al crear un nuevo usuario'),
  });

  const { mutate: changePasswordMutate } = useMutation({
    mutationFn: (user: { id: number; password: string }) => changePassword(user.id, user.password),
    onSuccess: () => {
      handleOnCloseModal();
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: () => toast.error('Error al cambiar la contraseña'),
  });

  const materialTheme = getTheme({
    ...DEFAULT_OPTIONS,
    striped: true,
    highlightOnHover: true,
  });
  const customTheme = useTheme({
    Table: `
      --data-table-library_grid-template-columns: repeat(5, minmax(100px, 1fr));
    `,
  });
  const theme = useTheme([materialTheme, customTheme]);

  if (users.isError) {
    toast.error('Error al obtener al usuaro');
  }
  const tableColumns: Column<UserTable>[] = [
    { label: 'Nombre del Usuario', renderCell: (item) => item.username },
    { label: 'Nombre', renderCell: (item) => item.first_name },
    { label: 'Apellido', renderCell: (item) => item.last_name },
    { label: 'Rol', renderCell: (item) => (item.active === false ? `${item.rol} (Inactivo)` : item.rol) },
    {
      label: 'Acciones',
      renderCell: (item) => (
        <div className="flex flex-row gap 2">
          <IconButton onClick={() => handleOnChangePassword(item)}>
            <PasswordOutlined />
          </IconButton>
          <IconButton onClick={() => handleOnEdit(item)}>
            <EditOutlined />
          </IconButton>
        </div>
      ),
    },
  ];

  const handleOnOpenModal = () => setOpenModal(true);

  const handleOnCloseModal = () => {
    setOpenModal(false);
    setMode('');
  };

  const handleOnAddUser = () => {
    setMode('Add');
    handleOnOpenModal();
  };

  const handleOnChangePassword = (user: UserTable) => {
    setUserUsername(user.username);
    setUserId(user.id);
    setMode('Update');
    handleOnOpenModal();
  };

  const handleOnEdit = (user: UserTable) => {
    setMode('Edit');
    setUserModelState(user);
    handleOnOpenModal();
  };

  const handleOnEditAccept = (user: UserTable) => {
    editUserMutate(user);
  };

  const handleOnChangePasswordAccept = (id: number, password: string) => {
    changePasswordMutate({ id, password });
  };

  const handleSearch = (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    setSearch(event.target.value);
  };

  let data = {};
  if (users?.data) {
    data = { nodes: users?.data.filter((item) => item.username.toLowerCase().includes(search.toLowerCase())) };
  }
  const onSubmit = (values: User) => {
    createUserMutate(values);
  };

  return (
    <>
      <InfoBar pageTitle="Usuarios">
        <Button
          onClick={handleOnAddUser}
          variant="contained"
          style={{ backgroundColor: '#900A20', color: 'white' }}
          endIcon={<Add />}
        >
          Agregar usuario
        </Button>
        <TextField
          sx={{ backgroundColor: '#FFF' }}
          fullWidth
          label="Buscar Usuario"
          value={search}
          onChange={handleSearch}
        />
      </InfoBar>
      <div className="min-w-full rounded-md drop-shadow-md justify-center w-full p-8">
        {users.isLoading ? (
          <CustomLoading />
        ) : (
          users?.data && (
            <div className="min-w-full">
              <CompactTable
                columns={tableColumns}
                data={data}
                theme={theme}
                layout={{ custom: true, horizontalScroll: true }}
                className="min-w-full"
              />
            </div>
          )
        )}
      </div>
      <UsersModal
        open={openModal}
        modalMode={mode}
        onAccept={onSubmit}
        onAcceptEdit={handleOnEditAccept}
        onClose={handleOnCloseModal}
        id={userId}
        user={userModelState}
        userUserName={userUsername}
        onChangePasswordAccept={handleOnChangePasswordAccept}
      />
    </>
  );
};

export default Users;
