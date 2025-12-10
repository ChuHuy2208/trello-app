import ModeSelect from '~/components/ModeSelect/ModeSelect'
import Box from '@mui/material/Box'

function AppBar() {
  return (
    <Box sx={{
      bgcolor: 'primary.light',
      width: '100%',
      height: (theme) => theme.trelloCustoms.appBarHeight,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }}>
      Header
      <ModeSelect />
    </Box>
  )
}

export default AppBar
