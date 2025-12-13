import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import NoteAddIcon from '@mui/icons-material/NoteAdd'
import Column from './Column/Column'
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable'

function Columns({ columns }) {
  // SoftableContext yêu cầu items là một mảng dạng ['id1', 'id2', ...] chứ không phải [{...}, {...}] 
  // Nếu không đúng thì vẫn kéo thả được nhưng không có animation
  return (
    <SortableContext items={columns?.map(c => c._id)} strategy={horizontalListSortingStrategy}>
      <Box sx={{
        display: 'flex',
        bgcolor: 'inherit',
        width: '100%',
        height: '100%',
        overflowX: 'auto',
        overflowY: 'hidden',
        '&::-webkit-scrollbar-track': { m: 2 }
      }}>
        {/* Box Column */}
        {columns?.map((column) => (<Column key={column._id} column={column} />))}
        <Box sx={{
          fontweight: 'normal',
          minWidth: '200px',
          maxWidth: '200px',
          borderRadius: '6px',
          height: 'fit-content',
          mx: 2,
          bgcolor: '#ffffff3d'
        }}>
          <Button
            startIcon={<NoteAddIcon />}
            sx={{
              color: 'white',
              width: '100%',
              justifyContent: 'flex-start',
              pl: 2.5,
              py: 1
            }}
          >
            Add new column
          </Button>
        </Box>
      </Box>
    </SortableContext>
  )
}

export default Columns
