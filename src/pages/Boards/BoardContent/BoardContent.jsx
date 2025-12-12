import Box from '@mui/material/Box'

function BoardContent() {
  return (
    <Box sx={{
      height: (theme) => `calc(100vh - ${theme.trelloCustoms.appBarHeight} - ${theme.trelloCustoms.boardBarHeight})`,
      display: 'flex',
      alignItems: 'center',
      bgcolor: (theme) => ( theme.palette.mode === 'dark' ? '#34495e' : '#1976d2' )
    }}>
      Board Content
    </Box>
  )
}

export default BoardContent
