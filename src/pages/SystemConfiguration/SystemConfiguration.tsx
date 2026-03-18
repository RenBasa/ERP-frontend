import { Card, CardActionArea, CardContent } from '@mui/material';
import InfoBar from '../../layouts/InfoBar/InfoBar';
import SystemSettingsModules from './SystemSettingsModules';
import { useNavigate } from 'react-router-dom';

const SystemConfiguration = () => {
  const navigateTo = useNavigate();

  return (
    <>
      <InfoBar pageTitle="Configuración adicional" />
      <div className=" min-w-full flex flex-col gap-6 rounded-md drop-shadow-md justify-center w-full px-8 ">
        {SystemSettingsModules.map((module, index) => (
          <Card sx={{ width: '100%' }} key={index}>
            <CardActionArea onClick={() => navigateTo(module.route)}>
              <CardContent
                sx={{
                  display: 'flex',
                  width: '100%',
                  flexDirection: 'row',
                  gap: 2,
                  justifyContent: 'flex-start',
                  alignItems: 'center',
                }}
              >
                {module.icon}
                <span className="text-gray-600 text-2xl">{module.title}</span>
              </CardContent>
            </CardActionArea>
          </Card>
        ))}
      </div>
    </>
  );
};

export default SystemConfiguration;
