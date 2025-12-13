/* eslint-disable react-hooks/set-state-in-effect */
import Box from '@mui/material/Box'
import Columns from './Columns/Columns'
import { mapOrder } from '~/utils/softs'
import { DndContext, PointerSensor, useSensor, useSensors, MouseSensor, TouchSensor } from '@dnd-kit/core'
import { useEffect, useState } from 'react'
import { arrayMove } from '@dnd-kit/sortable'

function BoardContent({ board }) {

  // const pointerSensor = useSensor(PointerSensor, {activationConstraint: { distance: 10 }})
  
  // Yêu cầu chuột di chuyển 10px mới kích hoạt event (fix trường hợp click mà vẫn gọi event)
  const mouseSensor = useSensor(MouseSensor, {activationConstraint: { distance: 10 }})

  // Nhấn giữ 250ms và di chuyển khoảng 5px mới kích hoạt event
  const touchSensor = useSensor(TouchSensor, {activationConstraint: { delay: 250, tolerance: 5 }})

  // const sensors = useSensors(pointerSensor)
  const sensors = useSensors(mouseSensor, touchSensor)

  const [orderedColumns, setOrderedColumns] =  useState([])
  
  useEffect(() => {
    setOrderedColumns(mapOrder(board?.columns, board?.columnOrderIds, '_id'))
  }, [board])

  const handleDragEnd = (event) => {
    // console.log(event)
    const { active, over } = event

    // Kiểm tra nếu không tồn tại over thì return luôn tránh lỗi
    if (!over) return

    if (active.id !== over.id) {
      // Lấy vị trí cũ của column đang kéo từ active
      const oldIndex = orderedColumns.findIndex(c => c._id === active.id)
      // Lấy vị trí mới của column đang kéo từ active
      const newIndex = orderedColumns.findIndex(c => c._id === over.id)
      // Dùng ArrayMove để sắp xếp lại mảng Columns ban đầu
      // Code của ArrayMove: https://github.com/clauderic/dnd-kit/blob/master/packages/sortable/src/utilities/arrayMove.ts
      const dndOrderedColumns = arrayMove(orderedColumns, oldIndex, newIndex)

      // const dndOrderdColumnsIds = dndOrderedColumns.map(c => c._id)

      // console.log({dndOrderedColumns})
      // console.log({dndOrderdColumnsIds})

      // Cập nhật lại state ban đầu sau khi kéo thả
      setOrderedColumns(dndOrderedColumns)
    }
  }
  return (
    <DndContext onDragEnd={handleDragEnd} sensors={sensors}>
      <Box sx={{
        height: (theme) => theme.trelloCustoms.boardContentHeight,
        bgcolor: (theme) => ( theme.palette.mode === 'dark' ? '#34495e' : '#1976d2' ),
        p: '10px 0',

      }}>
        <Columns columns={orderedColumns}/>
      </Box>
    </DndContext>
  )
}

export default BoardContent
