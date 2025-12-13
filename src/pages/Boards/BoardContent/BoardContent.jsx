import Box from '@mui/material/Box'
import Columns from './Columns/Columns'
import { mapOrder } from '~/utils/softs'

function BoardContent({ board }) {
  const orderedColumns = mapOrder(board?.columns, board?.columnOrderIds, '_id')
  return (
    <Box sx={{
      height: (theme) => theme.trelloCustoms.boardContentHeight,
      bgcolor: (theme) => ( theme.palette.mode === 'dark' ? '#34495e' : '#1976d2' ),
      p: '10px 0',

    }}>
      <Columns columns={orderedColumns}/>
    </Box>
  )
}

export default BoardContent
