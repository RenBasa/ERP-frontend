import { Visibility, VisibilityOff } from '@mui/icons-material';
import { Button, FormControl, IconButton, InputAdornment, InputLabel, OutlinedInput, TextField } from '@mui/material';
import { useFormik } from 'formik';
import { useState } from 'react';
import { login } from '../../services/auth.service';
import { useNavigate } from 'react-router-dom';
import { logoutAuth, syncAuthFromStorage } from '../../utils/auth-util';

const boxStyle = {
  boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)', // Adjust the values to your preference
  // padding: '16px', // Add padding to mimic Paper component
  backgroundColor: '#fff', // Set background color if needed
};
export const Login: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const navigateTo = useNavigate();

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };
  const onSubmit = async (values: { username: string; password: string }) => {
    const user = await login(values.username, values.password);
    if (user) {
      // Drop anything left over from the previous user before saving the new
      // session, then load the store from localStorage so both always agree.
      logoutAuth();
      localStorage.setItem('access_token', user.access_token);
      localStorage.setItem('user_first_name', user.first_name);
      localStorage.setItem('user_last_name', user.last_name);
      localStorage.setItem('user_role', user.rol);
      syncAuthFromStorage();

      navigateTo('/');
    }
  };

  const formik = useFormik({
    initialValues: {
      username: '',
      password: '',
    },
    onSubmit,
  });
  // TODO: add loading screen or toast when submitted
  return (
    <div className="w-full min-h-screen lg:p-4 flex items-center justify-center">
      <form
        onSubmit={formik.handleSubmit}
        style={boxStyle}
        className="bg-white max-w-lg mx-auto md:p-12 my-10 rounded-xl  flex flex-1 flex-col items-center gap-8 p-8"
      >
        <h1 className="text-4xl border-b-4 border-primary">Bienvenido</h1>
        <TextField
          label="Usuario"
          name="username"
          variant="outlined"
          className="w-full"
          onChange={formik.handleChange}
          value={formik.values.username}
        />
        <FormControl className="w-full" variant="outlined">
          <InputLabel htmlFor="outlined-adornment-password">Contraseña</InputLabel>
          <OutlinedInput
            autoComplete="off"
            id="outlined-adornment-password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            endAdornment={
              <InputAdornment position="end">
                <IconButton aria-label="toggle password visibility" onClick={handleClickShowPassword} edge="end">
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            }
            label="Contraseña"
            value={formik.values.password}
            onChange={formik.handleChange}
          />
        </FormControl>
        <Button type="submit" variant="contained" style={{ backgroundColor: '#900A20' }} className="w-full text-white">
          Ingresar
        </Button>
      </form>
    </div>
  );
};
export default Login;
