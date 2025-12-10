import Box from '@mui/material/Box'

function BoardBar() {
  return (
    <Box sx={{
      bgcolor: 'primary.dark',
      width: '100%',
      height: (theme) => theme.trelloCustoms.boardBarHeight,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }}>
      Board Bar
    </Box>
  )
}

export default BoardBar
