import Box from '@mui/material/Box'
import Columns from './Columns/Columns'

function BoardContent() {
  

  return (
    <Box sx={{
      height: (theme) => theme.trelloCustoms.boardContentHeight,
      bgcolor: (theme) => ( theme.palette.mode === 'dark' ? '#34495e' : '#1976d2' ),
      p: '10px 0',

    }}>
      <Columns />
    </Box>
  )
}

export default BoardContent
